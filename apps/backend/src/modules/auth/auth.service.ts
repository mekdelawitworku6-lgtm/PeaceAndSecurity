import { randomUUID } from "crypto";
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { Patrol } from "../patrol/entities/patrol.entity";
import { Citizen } from "../citizen/entities/citizen.entity";
import { Report } from "../reports/entities/report.entity";
import { OtpService } from "../otp/otp.service";
import { JwtService } from "@nestjs/jwt";
import {
  comparePassword,
  hashPassword,
} from "../../common/utils/password.util";
import {
  blacklistToken,
  isTokenBlacklisted,
  redisDel,
  redisGet,
  redisSet,
} from "../../common/utils/redis.service";
import { validatePinComplexity } from "../../common/utils/pin-validator.util";
import {
  signAccessToken,
  signRefreshToken,
  signPasswordResetToken,
  signSetPasswordToken,
  verifyToken,
  signRegistrationToken,
  signPinResetToken,
} from "../../common/utils/token.util";
import {
  OTPStatus,
  OTPType,
  PINType,
  TokenType,
  UserRole,
  UserStatus,
  VerificationStatus,
  SecurityEventType,
} from "common/enums/enums";
import { sendSMS } from "../../common/utils/sms-sender";
import { normalizeEtPhone } from "common/utils/validator";
import {
  ServiceResponse,
  successResponse,
  errorResponse,
} from "../../common/types/service-response";
import { generateRandomCode } from "../../common/utils/generator";
import { processUploads } from "../../common/utils/file-upload.util";
import { AuditService } from "../audit/audit.service";
import { RequestContext } from "../audit/request-context";
import { BaseTokenPayload } from "../../common/interfaces/token";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patrol)
    private readonly patrolRepository: Repository<Patrol>,
    @InjectRepository(Citizen)
    private readonly citizenRepository: Repository<Citizen>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) { }

  /**
   * Attach anonymous (guest) reports created from the same device to a citizen
   * account after login/registration so they appear in "My Reports".
   */
  private async attachGuestReports(
    userId: string,
    deviceId?: string,
  ): Promise<void> {
    if (!deviceId) return;
    try {
      const result = await this.reportRepository.query(
        `UPDATE reports SET "reporterId" = $1
         WHERE "reporterId" IS NULL AND "deviceId" = $2`,
        [userId, deviceId],
      );
      const affected = Array.isArray(result) ? result.length : 1;
      if (affected && affected > 0) {
        this.auditService.logSecurityEvent({
          eventType: SecurityEventType.OTP_VERIFIED,
          actorId: userId,
          success: true,
          metadata: { action: "guest_reports_attached", count: affected },
        }).catch(() => void 0);
      }
    } catch {
      // Non-fatal: guest report attachment must never block login/register
    }
  }

  /** ===== Shared PIN & Lockout Helpers ===== */
  private async hashPin(pin: string): Promise<string> {
    validatePinComplexity(pin);
    return hashPassword(pin);
  }

  private async comparePin(plain: string, hashed: string): Promise<boolean> {
    return comparePassword(plain, hashed);
  }

  private tokenPayload(user: any): BaseTokenPayload {
    return {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      ...(user.email ? { email: user.email } : {}),
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
      jti: randomUUID(),
    };
  }

  private async bumpTokenVersion(
    repository: Repository<any>,
    id: string,
  ): Promise<number> {
    const entity = await repository.findOne({ where: { id } });
    const nextVersion = (entity?.tokenVersion ?? 0) + 1;
    await repository.increment({ id }, "tokenVersion", 1);
    return nextVersion;
  }

  private tokenTtlSeconds(token: string): number {
    const decoded = this.jwtService.decode(token) as any;
    const remaining = (decoded?.exp ?? 0) - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 0;
  }

  private verifyMobileToken(token: string): {
    decoded: any;
    otpType: OTPType;
    pinType: PINType;
  } {
    const candidates = [
      {
        secret: process.env.JWT_REG_SECRET,
        type: TokenType.REGISTRATION,
        pinType: PINType.SETUP,
        otpType: OTPType.REGISTRATION_OTP,
      },
      {
        secret: process.env.JWT_PASSWORD_RESET_SECRET,
        type: TokenType.PIN_RESET,
        pinType: PINType.RESET,
        otpType: OTPType.FORGOT_PIN_OTP,
      },
    ];

    for (const candidate of candidates) {
      try {
        const decoded = verifyToken<any>(
          this.jwtService,
          token,
          candidate.secret!,
        );
        if (decoded.type !== candidate.type) continue;
        const pinType = decoded.pinType ?? candidate.pinType;
        const otpType =
          pinType === PINType.SETUP
            ? OTPType.REGISTRATION_OTP
            : OTPType.FORGOT_PIN_OTP;
        return { decoded, otpType, pinType };
      } catch (_) {}
    }

    throw new UnauthorizedException("Invalid or expired token");
  }

  private async checkLoginLockout(phone: string): Promise<void> {
    try {
      const lockKey = `login:lockout:${phone}`;
      const isLocked = await redisGet(lockKey);
      if (isLocked) {
        throw new HttpException(
          "Too many failed login attempts. Account temporarily locked for 15 minutes.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
    }
  }

  private async recordFailedLogin(phone: string): Promise<void> {
    try {
      const failedKey = `login:failed:${phone}`;
      const lockKey = `login:lockout:${phone}`;
      const raw = await redisGet(failedKey);
      const count = (Number(raw) || 0) + 1;
      if (count >= 5) {
        await redisSet(lockKey, "locked", 900);
        await redisDel(failedKey);
        throw new HttpException(
          "Too many failed login attempts. Account temporarily locked for 15 minutes.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        await redisSet(failedKey, String(count), 900);
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
    }
  }

  private async clearLoginLockout(phone: string): Promise<void> {
    try {
      await redisDel(`login:failed:${phone}`);
      await redisDel(`login:lockout:${phone}`);
    } catch (_) {}
  }

  /** ===== Citizen Auth Flow ===== */

  /**
   * Register a new citizen with phone + PIN (self-registration from mobile app)
   */
  async citizenRegister(
    fullName: string,
    phoneNumber: string,
    file?: any,
    pin?: string,
    deviceId?: string,
  ): Promise<ServiceResponse> {
    try {
      const normalizedPhone = normalizeEtPhone(phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid Ethiopian phone number format");
      if (!pin) throw new BadRequestException("PIN is required");

      const existing = await this.citizenRepository.findOne({
        where: { phoneNumber: normalizedPhone },
      });
      if (existing && existing.isPinSet && existing.status === UserStatus.ACTIVE) {
        throw new ConflictException(
          "Phone number already registered. Please login instead.",
        );
      }

      let profileImage: string | undefined;
      if (file) {
        const [asset] = await processUploads(
          file,
          { baseDir: "uploads", publicBase: "/", makeThumb: false, quality: 82 },
          "profiles",
        );
        profileImage = asset?.url;
      }

      const hashedPin = await this.hashPin(pin);

      let citizen = existing;
      if (!citizen) {
        citizen = this.citizenRepository.create({
          fullName,
          userCode: generateRandomCode(8),
          phoneNumber: normalizedPhone,
          status: UserStatus.ACTIVE,
          pin: hashedPin,
          isPinSet: true,
          verificationStatus: VerificationStatus.VERIFIED,
          profileImage,
          deviceId,
        });
      } else {
        citizen.fullName = fullName;
        citizen.status = UserStatus.ACTIVE;
        citizen.pin = hashedPin;
        citizen.isPinSet = true;
        citizen.verificationStatus = VerificationStatus.VERIFIED;
        if (profileImage) citizen.profileImage = profileImage;
        if (deviceId) citizen.deviceId = deviceId;
      }

      const saved = await this.citizenRepository.save(citizen);

      await this.attachGuestReports(saved.id, deviceId);

      const nextVersion = await this.bumpTokenVersion(
        this.citizenRepository,
        saved.id,
      );
      const payload = {
        ...this.tokenPayload(saved),
        role: UserRole.CITIZEN,
        tokenVersion: nextVersion,
      };
      const accessToken = signAccessToken(this.jwtService, payload);
      const refreshToken = signRefreshToken(this.jwtService, payload);

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.LOGIN_SUCCESS,
        actorId: saved.id,
        actorName: saved.fullName,
        targetUserId: saved.id,
        targetUserName: saved.fullName,
        success: true,
        metadata: { loginType: "CITIZEN_REGISTRATION" },
      });

      return successResponse("Registration successful", {
        accessToken,
        refreshToken,
        user: {
          id: saved.id,
          userCode: saved.userCode,
          fullName: saved.fullName,
          phoneNumber: saved.phoneNumber,
          role: UserRole.CITIZEN,
          profileImage: saved.profileImage,
          status: saved.status,
          createdAt: saved.createdAt,
        },
      });
    } catch (error) {
      return errorResponse(
        error.message ?? "Citizen registration failed",
        error,
      );
    }
  }

  /**
   * Citizen login with phone + PIN
   */
  async citizenLogin(
    phoneNumber: string,
    pin: string,
    deviceId?: string,
  ): Promise<ServiceResponse> {
    try {
      const normalizedPhone = normalizeEtPhone(phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid phone number format");

      await this.checkLoginLockout(normalizedPhone);

      const citizen = await this.citizenRepository
        .createQueryBuilder("citizen")
        .addSelect("citizen.pin")
        .where("citizen.phoneNumber = :phone", { phone: normalizedPhone })
        .getOne();

      if (!citizen) {
        await this.recordFailedLogin(normalizedPhone);
        throw new UnauthorizedException("Invalid credentials");
      }

      if (citizen.status === UserStatus.DISABLED)
        return errorResponse(
          "Your account is disabled. Please contact support.",
        );

      if (!citizen.pin)
        throw new UnauthorizedException("No PIN set. Please register first.");

      const pinOk = await this.comparePin(pin, citizen.pin);
      if (!pinOk) {
        await this.recordFailedLogin(normalizedPhone);
        await this.auditService.logSecurityEvent({
          eventType: SecurityEventType.LOGIN_FAILURE,
          actorId: citizen.id,
          actorName: citizen.fullName,
          targetUserId: citizen.id,
          targetUserName: citizen.fullName,
          success: false,
          reason: "Invalid PIN",
          metadata: { loginType: "CITIZEN" },
        });
        throw new UnauthorizedException("Invalid credentials");
      }

      await this.clearLoginLockout(normalizedPhone);

      const payload = this.tokenPayload(citizen);
      const accessToken = signAccessToken(this.jwtService, payload);
      const refreshToken = signRefreshToken(this.jwtService, payload);

      if (deviceId && citizen.deviceId !== deviceId) {
        citizen.deviceId = deviceId;
        await this.citizenRepository.save(citizen).catch(() => void 0);
      }
      await this.attachGuestReports(citizen.id, deviceId);

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.LOGIN_SUCCESS,
        actorId: citizen.id,
        actorName: citizen.fullName,
        targetUserId: citizen.id,
        targetUserName: citizen.fullName,
        success: true,
        metadata: { loginType: "CITIZEN" },
      });

      return successResponse("Login successful", {
        accessToken,
        refreshToken,
        user: {
          id: citizen.id,
          userCode: citizen.userCode,
          fullName: citizen.fullName,
          phoneNumber: citizen.phoneNumber,
          role: UserRole.CITIZEN,
          profileImage: citizen.profileImage,
          status: citizen.status,
          createdAt: citizen.createdAt,
        },
      });
    } catch (error) {
      return errorResponse(error.message ?? "Citizen login failed", error);
    }
  }

  /** ===== Patrol Auth Flow ===== */

  /**
   * Patrol login with phone + PIN (PIN is set by admin when registering patrol)
   */
  async patrolLogin(
    phoneNumber: string,
    pin: string,
  ): Promise<ServiceResponse> {
    try {
      const normalizedPhone = normalizeEtPhone(phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid phone number format");

      await this.checkLoginLockout(normalizedPhone);

      const patrol = await this.patrolRepository
        .createQueryBuilder("patrol")
        .addSelect("patrol.pin")
        .where("patrol.phoneNumber = :phone", { phone: normalizedPhone })
        .getOne();

      if (!patrol) {
        await this.recordFailedLogin(normalizedPhone);
        throw new UnauthorizedException("Invalid credentials");
      }

      if (patrol.status === UserStatus.DISABLED)
        return errorResponse(
          "Your account is disabled. Please contact your administrator.",
        );

      if (!patrol.pin)
        throw new UnauthorizedException(
          "No PIN set for this patrol account. Please contact your administrator.",
        );

      const pinOk = await this.comparePin(pin, patrol.pin);
      if (!pinOk) {
        await this.recordFailedLogin(normalizedPhone);
        await this.auditService.logSecurityEvent({
          eventType: SecurityEventType.LOGIN_FAILURE,
          actorId: patrol.id,
          actorName: patrol.fullName,
          targetUserId: patrol.id,
          targetUserName: patrol.fullName,
          success: false,
          reason: "Invalid PIN",
          metadata: { loginType: "PATROL" },
        });
        throw new UnauthorizedException("Invalid credentials");
      }

      await this.clearLoginLockout(normalizedPhone);

      const payload = this.tokenPayload(patrol);
      const accessToken = signAccessToken(this.jwtService, payload);
      const refreshToken = signRefreshToken(this.jwtService, payload);

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.LOGIN_SUCCESS,
        actorId: patrol.id,
        actorName: patrol.fullName,
        targetUserId: patrol.id,
        targetUserName: patrol.fullName,
        success: true,
        metadata: { loginType: "PATROL" },
      });

      return successResponse("Patrol login successful", {
        accessToken,
        refreshToken,
        user: {
          id: patrol.id,
          userCode: patrol.userCode,
          fullName: patrol.fullName,
          phoneNumber: patrol.phoneNumber,
          role: UserRole.PATROL,
          profileImage: patrol.profileImage,
          status: patrol.status,
          assignedArea: patrol.assignedArea,
          officeAddress: patrol.officeAddress,
          officeLatitude: patrol.officeLatitude,
          officeLongitude: patrol.officeLongitude,
          latitude: patrol.latitude,
          longitude: patrol.longitude,
          createdAt: patrol.createdAt,
        },
      });
    } catch (error) {
      return errorResponse(error.message ?? "Patrol login failed", error);
    }
  }

  /**
   * Admin sets or resets patrol/citizen PIN
   */
  async setUserPin(
    adminId: string,
    targetUserId: string,
    pin: string,
  ): Promise<ServiceResponse> {
    try {
      const admin = await this.userRepository.findOne({
        where: { id: adminId },
      });
      if (!admin) throw new NotFoundException("Admin not found");

      const isSystemAdmin =
        admin.role === UserRole.SYSTEM_SUPER_ADMIN ||
        admin.role === UserRole.SYSTEM_ADMIN;
      if (!isSystemAdmin)
        throw new UnauthorizedException("Only admins can set user PINs");

      // Try Patrol first, then Citizen
      const patrol = await this.patrolRepository.findOne({
        where: { id: targetUserId },
      });
      if (patrol) {
        patrol.pin = await this.hashPin(pin);
        if (patrol.status === UserStatus.DISABLED || patrol.status === UserStatus.PENDING)
          patrol.status = UserStatus.ACTIVE;
        await this.patrolRepository.save(patrol);
        await this.bumpTokenVersion(this.patrolRepository, patrol.id);

        if (patrol.phoneNumber) {
          const recipient = normalizeEtPhone(patrol.phoneNumber);
          if (recipient) {
            sendSMS({
              recipient,
              messageBody: `Your PIN has been set by the administrator. Your login PIN is: ${pin}. Please change it after your first login.`,
            }).catch(() => void 0);
          }
        }
        return successResponse(
          "PIN set successfully for patrol officer. User notified via SMS.",
        );
      }

      const citizen = await this.citizenRepository.findOne({
        where: { id: targetUserId },
      });
      if (citizen) {
        citizen.pin = await this.hashPin(pin);
        if (citizen.status === UserStatus.DISABLED || citizen.status === UserStatus.PENDING)
          citizen.status = UserStatus.ACTIVE;
        await this.citizenRepository.save(citizen);
        await this.bumpTokenVersion(this.citizenRepository, citizen.id);

        if (citizen.phoneNumber) {
          const recipient = normalizeEtPhone(citizen.phoneNumber);
          if (recipient) {
            sendSMS({
              recipient,
              messageBody: `Your PIN has been set by the administrator. Your login PIN is: ${pin}. Please change it after your first login.`,
            }).catch(() => void 0);
          }
        }
        return successResponse(
          "PIN set successfully for citizen. User notified via SMS.",
        );
      }

      throw new NotFoundException(
        "Patrol or Citizen user not found with the given ID",
      );
    } catch (error) {
      return errorResponse(error.message ?? "Failed to set PIN", error);
    }
  }

  /**
   * Citizen or Patrol self-change their PIN (requires knowing old PIN)
   * role is derived from the JWT token — passed by the controller
   */
  async changePin(
    userId: string,
    oldPin: string,
    newPin: string,
    role: UserRole,
  ): Promise<ServiceResponse> {
    try {
      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository
          .createQueryBuilder("patrol")
          .addSelect("patrol.pin")
          .where("patrol.id = :id", { id: userId })
          .getOne();
        if (!patrol) throw new NotFoundException("Patrol officer not found");
        if (!patrol.pin)
          throw new BadRequestException("No PIN set for this account");
        const ok = await this.comparePin(oldPin, patrol.pin);
        if (!ok) throw new UnauthorizedException("Current PIN is incorrect");
        patrol.pin = await this.hashPin(newPin);
        await this.patrolRepository.save(patrol);
        await this.bumpTokenVersion(this.patrolRepository, patrol.id);
      } else if (role === UserRole.CITIZEN) {
        const citizen = await this.citizenRepository
          .createQueryBuilder("citizen")
          .addSelect("citizen.pin")
          .where("citizen.id = :id", { id: userId })
          .getOne();
        if (!citizen) throw new NotFoundException("Citizen not found");
        if (!citizen.pin)
          throw new BadRequestException("No PIN set for this account");
        const ok = await this.comparePin(oldPin, citizen.pin);
        if (!ok) throw new UnauthorizedException("Current PIN is incorrect");
        citizen.pin = await this.hashPin(newPin);
        await this.citizenRepository.save(citizen);
        await this.bumpTokenVersion(this.citizenRepository, citizen.id);
      } else {
        throw new BadRequestException(
          "PIN change is only available for Patrol and Citizen users",
        );
      }
      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PIN_CHANGED,
        success: true,
        metadata: { userId, role },
      });
      return successResponse("PIN changed successfully.");
    } catch (error) {
      return errorResponse(error.message ?? "Failed to change PIN", error);
    }
  }

  /**
   * Patrol/Citizen: Request a PIN reset via OTP sent to phone.
   * Separate from `requestUserPasswordReset` which is for dashboard users only.
   */
  async requestPinReset(
    phoneNumber: string,
    role: "patrol" | "citizen",
    pinType: PINType,
  ): Promise<ServiceResponse> {
    try {
      const normalizedPhone = normalizeEtPhone(phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid Ethiopian phone number format");
      if (pinType !== PINType.RESET)
        throw new BadRequestException(
          "This endpoint only supports PIN resets. Use phone verification to set a PIN.",
        );

      let id: string;
      let tokenVersion = 0;

      if (role === "patrol") {
        const patrol = await this.patrolRepository.findOne({
          where: { phoneNumber: normalizedPhone },
        });
        if (!patrol) throw new NotFoundException("Patrol officer not found");
        if (patrol.status === UserStatus.DISABLED)
          throw new UnauthorizedException(
            "Account is disabled. Contact your administrator.",
          );
        id = patrol.id;
        tokenVersion = patrol.tokenVersion ?? 0;
      } else {
        const citizen = await this.citizenRepository.findOne({
          where: { phoneNumber: normalizedPhone },
        });
        if (!citizen) throw new NotFoundException("Citizen not found");
        if (citizen.status === UserStatus.DISABLED)
          throw new UnauthorizedException(
            "Account is disabled. Contact support.",
          );
        id = citizen.id;
        tokenVersion = citizen.tokenVersion ?? 0;
      }

      const otpType = OTPType.FORGOT_PIN_OTP;

      const otp = await this.otpService.createOtp({
        userId: id,
        phoneNumber: normalizedPhone,
        otpType,
      });

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PIN_RESET_REQUESTED,
        actorId: id,
        success: true,
        metadata: { role, pinType },
      });

      sendSMS({
        recipient: normalizedPhone,
        messageBody: `Your PIN reset code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const resetToken = signPinResetToken(this.jwtService, {
        ...this.tokenPayload({
          id,
          phoneNumber: normalizedPhone,
          role: role === "patrol" ? UserRole.PATROL : UserRole.CITIZEN,
        }),
        tokenVersion,
        pinType,
      });

      return successResponse("PIN reset OTP sent to your phone.", {
        resetToken,
      });
    } catch (error) {
      return errorResponse(
        error.message ?? "Failed to request PIN OTP",
        error,
      );
    }
  }

  /**
   * Patrol/Citizen: Confirm PIN reset with OTP + reset token + new PIN
   */
  async confirmPinReset(
    resetToken: string,
    otpCode: string,
    newPin: string,
  ): Promise<ServiceResponse> {
    try {
      const { decoded, otpType, pinType } =
        this.verifyMobileToken(resetToken);
      const { sub: userId, role } = decoded;
      const phoneNumber = normalizeEtPhone(decoded.phoneNumber);
      if (!phoneNumber)
        throw new BadRequestException("Invalid phone number in token");

      await this.otpService.verifyOtpWithCriteria(
        [{ userId, phoneNumber, otpType }],
        otpCode,
      );

      const hashedPin = await this.hashPin(newPin);

      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: userId, phoneNumber },
        });
        if (!patrol) throw new NotFoundException("Patrol officer not found");
        patrol.pin = hashedPin;
        patrol.isPinSet = true;
        patrol.status = UserStatus.ACTIVE;
        await this.patrolRepository.save(patrol);
        await this.bumpTokenVersion(this.patrolRepository, patrol.id);
      } else if (role === UserRole.CITIZEN) {
        const citizen = await this.citizenRepository.findOne({
          where: { id: userId, phoneNumber },
        });
        if (!citizen) throw new NotFoundException("Citizen not found");
        citizen.pin = hashedPin;
        citizen.isPinSet = true;
        citizen.status = UserStatus.ACTIVE;
        citizen.verificationStatus = VerificationStatus.VERIFIED;
        await this.citizenRepository.save(citizen);
        await this.bumpTokenVersion(this.citizenRepository, citizen.id);
      } else {
        throw new BadRequestException("Invalid role in reset token");
      }

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PIN_RESET_COMPLETED,
        actorId: userId,
        success: true,
        metadata: { role, pinType },
      });

      return successResponse("PIN reset successfully.");
    } catch (error) {
      return errorResponse(error.message ?? "Failed to reset PIN", error);
    }
  }

  /** ===== Dashboard User Auth Flow ===== */

  async verifyUserOTP(
    token: string,
    otpCode: string,
    otpType: OTPType,
  ): Promise<ServiceResponse> {
    try {
      const decoded = verifyToken<any>(
        this.jwtService,
        token,
        process.env.JWT_REG_SECRET,
      );
      if (decoded.type !== TokenType.REGISTRATION)
        throw new UnauthorizedException("Invalid token type");

      const userId = decoded.sub;
      const phone = decoded.phoneNumber ?? null;
      const email = decoded.email ?? null;
      if (!phone && !email)
        throw new BadRequestException(
          "Token must include email or phoneNumber.",
        );

      const whereClauses: any[] = [];
      if (phone) whereClauses.push({ id: userId, phoneNumber: phone });
      if (email) whereClauses.push({ id: userId, email });

      const user = await this.userRepository.findOne({ where: whereClauses });
      if (!user) throw new NotFoundException("User not found");

      const where: any[] = [];
      if (phone) where.push({ userId, phoneNumber: phone, otpType });
      if (email) where.push({ userId, email, otpType });

      await this.otpService.verifyOtpWithCriteria(where, otpCode);

      await this.otpService.removeBulkOtps({
        userId,
        otpType,
        ...(phone ? { phoneNumber: phone } : {}),
        ...(email ? { email } : {}),
        status: OTPStatus.REQUESTED,
      });

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.OTP_VERIFIED,
        actorId: userId,
        success: true,
        metadata: { otpType },
      });

      // Dashboard users remain PENDING until password is set.
      // status will be updated to ACTIVE in setUserPasswordWithToken.
      if (phone) user.isPhoneVerified = true;
      if (email) user.isEmailVerified = true;
      await this.userRepository.save(user);

      const setPasswordToken = signSetPasswordToken(
        this.jwtService,
        this.tokenPayload(user),
      );

      return successResponse("OTP verified successfully.", {
        setPasswordToken,
      });
    } catch (error) {
      return errorResponse(error.message ?? "Failed to verify OTP", error);
    }
  }

  async verifyMobileOTP(
    token: string,
    otpCode: string,
    otpType: OTPType,
  ): Promise<ServiceResponse> {
    try {
      const { decoded, otpType } = this.verifyMobileToken(token);
      const role = decoded.role;
      if (role !== UserRole.PATROL && role !== UserRole.CITIZEN)
        throw new UnauthorizedException("Invalid role in token");

      const userId = decoded.sub;
      const phone = normalizeEtPhone(decoded.phoneNumber);
      if (!phone)
        throw new BadRequestException("Invalid phone number in token");

      let tokenVersion = 0;
      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (!patrol) throw new NotFoundException("Patrol officer not found");
        tokenVersion = patrol.tokenVersion ?? 0;
      } else {
        const citizen = await this.citizenRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (!citizen) throw new NotFoundException("Citizen not found");
        tokenVersion = citizen.tokenVersion ?? 0;
      }

      await this.otpService.verifyOtpWithCriteria(
        [{ userId, phoneNumber: phone, otpType }],
        otpCode,
      );

      if (role === UserRole.CITIZEN) {
        const citizen = await this.citizenRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (citizen) {
          citizen.verificationStatus = VerificationStatus.VERIFIED;
          await this.citizenRepository.save(citizen);
        }
      }

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.OTP_VERIFIED,
        actorId: userId,
        success: true,
        metadata: { otpType, role },
      });

      const setPinToken = signSetPasswordToken(
        this.jwtService,
        this.tokenPayload({
          id: userId,
          phoneNumber: phone,
          role,
        }),
      );

      return successResponse("OTP verified successfully.", { setPinToken });
    } catch (error) {
      return errorResponse(error.message ?? "Failed to verify OTP", error);
    }
  }

  async resendMobileOTP(
    token: string,
    otpType: OTPType,
  ): Promise<ServiceResponse> {
    try {
      const { decoded, otpType: derivedOtpType } =
        this.verifyMobileToken(token);
      const userId = decoded.sub;
      const phone = normalizeEtPhone(decoded.phoneNumber);
      if (!phone)
        throw new BadRequestException("Invalid phone number in token");

      const otp = await this.otpService.createOtp({
        phoneNumber: phone,
        userId,
        otpType: derivedOtpType,
      });

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.OTP_REQUESTED,
        actorId: userId,
        success: true,
        metadata: { otpType: derivedOtpType, resent: true },
      });

      sendSMS({
        recipient: phone,
        messageBody: `Your verification code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      return successResponse("OTP resent successfully", {
        ...(process.env.NODE_ENV === "development"
          ? { devOtp: otp.otpCode }
          : {}),
      });
    } catch (error) {
      return errorResponse(error.message ?? "Failed to resend OTP", error);
    }
  }

  async setMobilePinWithToken(
    token: string,
    pin: string,
  ): Promise<ServiceResponse> {
    try {
      const decoded = verifyToken<any>(
        this.jwtService,
        token,
        process.env.JWT_SET_PASSWORD_SECRET,
      );
      if (decoded.type !== TokenType.SET_PASSWORD)
        throw new UnauthorizedException("Invalid token type");

      const role = decoded.role;
      if (role !== UserRole.PATROL && role !== UserRole.CITIZEN)
        throw new UnauthorizedException("Invalid role in token");

      const userId = decoded.sub;
      const phone = normalizeEtPhone(decoded.phoneNumber);
      if (!phone)
        throw new BadRequestException("Invalid phone number in token");
      const hashedPin = await this.hashPin(pin);

      let savedUser: any;
      let nextVersion: number;
      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (!patrol) throw new NotFoundException("Patrol officer not found");
        patrol.pin = hashedPin;
        patrol.isPinSet = true;
        patrol.status = UserStatus.ACTIVE;
        savedUser = await this.patrolRepository.save(patrol);
        nextVersion = await this.bumpTokenVersion(
          this.patrolRepository,
          savedUser.id,
        );
      } else {
        const citizen = await this.citizenRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (!citizen) throw new NotFoundException("Citizen not found");
        citizen.pin = hashedPin;
        citizen.isPinSet = true;
        citizen.status = UserStatus.ACTIVE;
        citizen.verificationStatus = VerificationStatus.VERIFIED;
        savedUser = await this.citizenRepository.save(citizen);
        nextVersion = await this.bumpTokenVersion(
          this.citizenRepository,
          savedUser.id,
        );
      }

      const payload = {
        ...this.tokenPayload(savedUser),
        role,
        tokenVersion: nextVersion,
      };

      const accessToken = signAccessToken(this.jwtService, payload);
      const refreshToken = signRefreshToken(this.jwtService, payload);

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PIN_CHANGED,
        actorId: userId,
        success: true,
        metadata: { role, action: "initial_set" },
      });

      return successResponse("PIN set successfully. Login complete.", {
        accessToken,
        refreshToken,
        user: {
          id: savedUser.id,
          userCode: savedUser.userCode,
          fullName: savedUser.fullName,
          phoneNumber: savedUser.phoneNumber,
          role,
          profileImage: savedUser.profileImage,
          status: savedUser.status,
          createdAt: savedUser.createdAt,
        },
      });
    } catch (error) {
      return errorResponse(error.message ?? "Failed to set PIN", error);
    }
  }

  async setUserPasswordWithToken(
    token: string,
    password: string,
  ): Promise<ServiceResponse> {
    try {
      const decoded = verifyToken<any>(
        this.jwtService,
        token,
        process.env.JWT_SET_PASSWORD_SECRET,
      );
      if (decoded.type !== TokenType.SET_PASSWORD)
        throw new UnauthorizedException("Invalid token type");

      let user: User | null = null;
      if (decoded.email)
        user = await this.userRepository.findOne({
          where: { id: decoded.sub, email: decoded.email },
        });
      else if (decoded.phoneNumber)
        user = await this.userRepository.findOne({
          where: { id: decoded.sub, phoneNumber: decoded.phoneNumber },
        });
      if (!user) throw new NotFoundException("User not found");

      // Dashboard users only use password (Patrol/Citizen are in separate tables now)
      user.password = await hashPassword(password);
      user.isPasswordSet = true;
      user.status = UserStatus.ACTIVE;
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      const savedUser = await this.userRepository.save(user);
      const nextVersion = await this.bumpTokenVersion(
        this.userRepository,
        savedUser.id,
      );

      const payload = {
        ...this.tokenPayload(savedUser),
        tokenVersion: nextVersion,
      };

      const accessToken = signAccessToken(this.jwtService, payload);
      const refreshToken = signRefreshToken(this.jwtService, payload);

      return successResponse(
        "Credential set successfully. Registration completed.",
        {
          accessToken,
          refreshToken,
          user: {
            id: savedUser.id,
            phoneNumber: savedUser.phoneNumber,
            email: savedUser.email,
            fullName: savedUser.fullName,
            role: savedUser.role,
            profileImage: savedUser.profileImage,
            permissions: savedUser.permissions || [],
            isPasswordSet: savedUser.isPasswordSet,
            isEmailVerified: savedUser.isEmailVerified,
            isPhoneVerified: savedUser.isPhoneVerified,
            createdAt: savedUser.createdAt,
          },
        },
      );
    } catch (error) {
      return errorResponse(error.message ?? "Failed to set credential", error);
    }
  }

  /**
   * Dashboard user (admin) password reset request via phone OTP
   */
  async requestUserPasswordReset(
    phoneNumber: string,
  ): Promise<ServiceResponse> {
    try {
      const normalizedPhone = normalizeEtPhone(phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid phone number format");

      const user = await this.userRepository.findOne({
        where: { phoneNumber: normalizedPhone },
      });
      if (!user) throw new NotFoundException("User not found");

      if (user.status === UserStatus.DISABLED)
        throw new UnauthorizedException("Account is disabled.");

      const otp = await this.otpService.createOtp({
        userId: user.id,
        phoneNumber: normalizedPhone,
        otpType: OTPType.FORGOT_PASSWORD_OTP,
      });

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PASSWORD_RESET_REQUESTED,
        actorId: user.id,
        actorName: user.fullName,
        success: true,
        metadata: { phoneNumber: normalizedPhone },
      });

      const recipient = normalizedPhone;
      sendSMS({
        recipient,
        messageBody: `Your password reset code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const resetToken = signPasswordResetToken(this.jwtService, {
        ...this.tokenPayload(user),
        phoneNumber: normalizedPhone,
      });
      return successResponse("Password reset OTP sent to your phone.", {
        resetToken,
      });
    } catch (error) {
      return errorResponse(error.message ?? "Failed to request reset", error);
    }
  }

  /**
   * Dashboard user: confirm password reset with reset token + OTP + new password
   */
  async resetUserPasswordWithToken(
    resetToken: string,
    otpCode: string,
    newPassword: string,
  ): Promise<ServiceResponse> {
    try {
      const decoded = verifyToken<any>(
        this.jwtService,
        resetToken,
        process.env.JWT_PASSWORD_RESET_SECRET,
      );
      if (decoded.type !== TokenType.PASSWORD_RESET)
        throw new UnauthorizedException("Invalid token type");

      const { sub: userId, phoneNumber, role } = decoded;

      // Only for dashboard users (admin roles)
      if (role === UserRole.PATROL || role === UserRole.CITIZEN) {
        throw new BadRequestException(
          "Please use the PIN reset endpoint for patrol/citizen accounts.",
        );
      }

      // Verify OTP
      await this.otpService.verifyOtpWithCriteria(
        [
          {
            userId,
            phoneNumber,
            otpType: OTPType.FORGOT_PASSWORD_OTP,
          },
        ],
        otpCode,
      );

      const user = await this.userRepository.findOne({
        where: { id: userId, phoneNumber },
      });
      if (!user) throw new NotFoundException("User not found");

      user.password = await hashPassword(newPassword);
      user.isPasswordSet = true;
      await this.userRepository.save(user);
      await this.bumpTokenVersion(this.userRepository, user.id);

      await this.otpService.removeBulkOtps({
        userId,
        otpType: OTPType.FORGOT_PASSWORD_OTP,
        status: OTPStatus.REQUESTED,
      });

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PASSWORD_RESET_COMPLETED,
        actorId: userId,
        actorName: user.fullName,
        success: true,
      });

      return successResponse("Password reset successfully.");
    } catch (error) {
      return errorResponse(error.message ?? "Failed to reset password", error);
    }
  }

  async changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<ServiceResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException("User not found");

      const ok = await comparePassword(currentPassword, user.password);
      if (!ok) throw new BadRequestException("Current password is incorrect");

      user.password = await hashPassword(newPassword);
      await this.userRepository.save(user);
      await this.bumpTokenVersion(this.userRepository, user.id);

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PASSWORD_CHANGED,
        actorId: userId,
        actorName: user.fullName,
        success: true,
      });

      return successResponse("Password changed successfully.");
    } catch (error) {
      return errorResponse(error.message ?? "Failed to change password", error);
    }
  }

  async userPreLogin(
    email?: string,
    phoneNumber?: string,
  ): Promise<ServiceResponse> {
    try {
      if (!email && !phoneNumber)
        throw new BadRequestException("Email or phone number is required");

      let user: User | null = null;
      if (email) {
        user = await this.userRepository.findOne({
          where: { email: email.trim().toLowerCase() },
        });
        if (!user) throw new NotFoundException("Email not registered");
      } else if (phoneNumber) {
        const normalizedPhone = normalizeEtPhone(phoneNumber);
        user = await this.userRepository.findOne({
          where: { phoneNumber: normalizedPhone },
        });
        if (!user) throw new NotFoundException("Phone number not registered");
      }

      if (user.status === UserStatus.DISABLED)
        return errorResponse(
          "Your account is disabled. Please contact the System Administrator.",
        );

      if (user.isPasswordSet)
        return successResponse("Password already set. Proceed to login.", {
          isPasswordSet: true,
        });

      const resetToken = signSetPasswordToken(
        this.jwtService,
        this.tokenPayload(user),
      );
      return successResponse("Please set your password to continue", {
        isPasswordSet: false,
        resetToken,
      });
    } catch (error) {
      return errorResponse(error.message ?? "Pre-login failed", error);
    }
  }

  async patrolPreLogin(phoneNumber: string): Promise<ServiceResponse> {
    try {
      const normalizedPhone = normalizeEtPhone(phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid Ethiopian phone number format");

      const patrol = await this.patrolRepository
        .createQueryBuilder("patrol")
        .addSelect("patrol.pin")
        .where("patrol.phoneNumber = :phone", { phone: normalizedPhone })
        .getOne();

      if (!patrol) throw new NotFoundException("Patrol officer not registered");

      if (patrol.status === UserStatus.DISABLED)
        return errorResponse(
          "Your account is disabled. Please contact your administrator.",
        );

      if (patrol.isPinSet)
        return successResponse("PIN already set. Proceed to login.", {
          isPinSet: true,
        });

      // No PIN set, send OTP to verify phone
      const otp = await this.otpService.createOtp({
        phoneNumber: normalizedPhone,
        userId: patrol.id,
        otpType: OTPType.REGISTRATION_OTP,
      });

      sendSMS({
        recipient: normalizedPhone,
        messageBody: `Your verification code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const registrationToken = signRegistrationToken(
        this.jwtService,
        this.tokenPayload(patrol),
      );

      return successResponse("Please verify your phone and set your PIN", {
        isPinSet: false,
        registrationToken,
      });
    } catch (error) {
      return errorResponse(error.message ?? "Patrol pre-login failed", error);
    }
  }

  async citizenPreLogin(phoneNumber: string): Promise<ServiceResponse> {
    try {
      const normalizedPhone = normalizeEtPhone(phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid Ethiopian phone number format");

      const citizen = await this.citizenRepository
        .createQueryBuilder("citizen")
        .addSelect("citizen.pin")
        .where("citizen.phoneNumber = :phone", { phone: normalizedPhone })
        .getOne();

      if (!citizen) throw new NotFoundException("User not found. Please register first.");

      if (citizen.isPinSet && citizen.status === UserStatus.DISABLED)
        return errorResponse(
          "Your account is disabled. Please contact support.",
        );

      if (citizen.isPinSet)
        return successResponse("PIN already set. Proceed to login.", {
          isPinSet: true,
        });

      // No PIN set, send OTP to verify phone
      const otp = await this.otpService.createOtp({
        phoneNumber: normalizedPhone,
        userId: citizen.id,
        otpType: OTPType.REGISTRATION_OTP,
      });

      sendSMS({
        recipient: normalizedPhone,
        messageBody: `Your verification code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const registrationToken = signRegistrationToken(
        this.jwtService,
        this.tokenPayload(citizen),
      );

      return successResponse("Please verify your phone and set your PIN", {
        isPinSet: false,
        registrationToken,
      });
    } catch (error) {
      return errorResponse(error.message ?? "Citizen pre-login failed", error);
    }
  }

  async userLogin(
    phoneNumber?: string,
    password?: string,
    email?: string,
  ): Promise<ServiceResponse> {
    try {
      if (!phoneNumber && !email) {
        throw new BadRequestException("Email or phone number is required");
      }

      let whereClause: any = {};
      if (email) {
        whereClause = { email: email.trim().toLowerCase() };
      } else if (phoneNumber) {
        const normalizedPhone = normalizeEtPhone(phoneNumber);
        whereClause = { phoneNumber: normalizedPhone };
      }

      const user = await this.userRepository.findOne({
        where: whereClause,
        select: [
          "id",
          "phoneNumber",
          "email",
          "fullName",
          "password",
          "isPasswordSet",
          "status",
          "isEmailVerified",
          "isPhoneVerified",
          "role",
          "profileImage",
          "createdAt",
          "updatedAt",
          "permissions",
          "userCode",
        ],
      });
      if (!user) throw new UnauthorizedException("Invalid credentials");
      if (user.status === UserStatus.DISABLED)
        return errorResponse(
          "Your account is disabled. Please contact the System Administrator.",
        );

      // Patrol and Citizen use PIN login through their own endpoints
      if (user.role === UserRole.CITIZEN || user.role === UserRole.PATROL) {
        throw new UnauthorizedException(
          "Please use the mobile app to login with your PIN.",
        );
      }

      if (!user.isEmailVerified && !user.isPhoneVerified) {
        const otp = await this.otpService.createOtp({
          phoneNumber: user.phoneNumber,
          userId: user.id,
          otpType: OTPType.REGISTRATION_OTP,
        });
        const recipient = normalizeEtPhone(user.phoneNumber);
        if (recipient)
          sendSMS({
            recipient,
            messageBody: `Your verification code is ${otp.otpCode}. It expires in 2 minutes.`,
          }).catch(() => void 0);

        const registrationToken = signRegistrationToken(
          this.jwtService,
          this.tokenPayload(user),
        );
        return successResponse(
          "Verification required. We sent you a new OTP to complete registration.",
          {
            registrationTokenHint:
              "Use /auth endpoints to verify and set password.",
            registrationToken,
          },
        );
      }

      if (user.status !== UserStatus.ACTIVE || !user.isPasswordSet)
        throw new UnauthorizedException(
          "Invalid credentials or not registered",
        );

      const ok = await comparePassword(password!, user.password);
      if (!ok) {
        await this.auditService.logSecurityEvent({
          eventType: SecurityEventType.LOGIN_FAILURE,
          actorId: user.id,
          actorName: user.fullName,
          targetUserId: user.id,
          targetUserName: user.fullName,
          success: false,
          reason: "Invalid password",
          metadata: { loginType: "USER" },
        });
        throw new UnauthorizedException("Invalid credentials");
      }

      const payload = this.tokenPayload(user);
      const accessToken = signAccessToken(this.jwtService, payload);
      const refreshToken = signRefreshToken(this.jwtService, payload);

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.LOGIN_SUCCESS,
        actorId: user.id,
        actorName: user.fullName,
        targetUserId: user.id,
        targetUserName: user.fullName,
        success: true,
        metadata: { loginType: "USER" },
      });

      return successResponse("Login successful", {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profileImage: user.profileImage,
          permissions: user.permissions || [],
          isPasswordSet: user.isPasswordSet,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      return errorResponse(error.message ?? "Login failed", error);
    }
  }

  /**
   * Refresh access token — supports all user types (User, Patrol, Citizen)
   */
  async refreshUserToken(refreshToken: string): Promise<ServiceResponse> {
    try {
      if (!refreshToken)
        throw new UnauthorizedException("Refresh token required");

      const decoded = verifyToken<any>(
        this.jwtService,
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );

      if (decoded.type !== TokenType.REFRESH)
        throw new UnauthorizedException("Invalid token type");

      const { sub, role } = decoded;
      const tokenVersion = decoded.tokenVersion ?? 0;

      const rotate = async (entity: any, entityRole: string) => {
        if ((entity.tokenVersion ?? 0) !== tokenVersion)
          throw new UnauthorizedException(
            "Session has been terminated. Please sign in again.",
          );

        if (await isTokenBlacklisted(refreshToken))
          throw new UnauthorizedException(
            "Session has been terminated or token has been revoked",
          );

        await blacklistToken(
          refreshToken,
          this.tokenTtlSeconds(refreshToken),
        );

        const payload = this.tokenPayload(entity);
        const accessToken = signAccessToken(this.jwtService, payload);
        const nextRefreshToken = signRefreshToken(this.jwtService, {
          ...this.tokenPayload(entity),
          role: entityRole,
        });

        await this.auditService.logSecurityEvent({
          eventType: SecurityEventType.TOKEN_REFRESH,
          actorId: entity.id,
          success: true,
          metadata: { role: entityRole },
        });

        return successResponse("Token refreshed successfully", {
          accessToken,
          refreshToken: nextRefreshToken,
        });
      };

      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: sub, status: UserStatus.ACTIVE },
        });
        if (!patrol)
          throw new UnauthorizedException(
            "Patrol officer not found or inactive",
          );
        return await rotate(patrol, UserRole.PATROL);
      }

      if (role === UserRole.CITIZEN) {
        const citizen = await this.citizenRepository.findOne({
          where: { id: sub, status: UserStatus.ACTIVE },
        });
        if (!citizen)
          throw new UnauthorizedException("Citizen not found or inactive");
        return await rotate(citizen, UserRole.CITIZEN);
      }

      const user = await this.userRepository.findOne({
        where: { id: sub, status: UserStatus.ACTIVE },
      });
      if (!user) throw new UnauthorizedException("User not found or inactive");
      return await rotate(user, user.role);
    } catch (error) {
      return errorResponse(error.message ?? "Token refresh failed", error);
    }
  }

  /**
   * Revoke session token and blacklist it in Redis (CWE-613)
   */
  async logout(
    accessToken?: string,
    refreshToken?: string,
    user?: any,
  ): Promise<ServiceResponse> {
    try {
      if (accessToken) {
        try {
          verifyToken<any>(
            this.jwtService,
            accessToken,
            process.env.JWT_ACCESS_SECRET,
          );
          await blacklistToken(
            accessToken,
            this.tokenTtlSeconds(accessToken),
          );
        } catch (_) {}
      }

      if (refreshToken) {
        const decoded = verifyToken<any>(
          this.jwtService,
          refreshToken,
          process.env.JWT_REFRESH_SECRET,
        );
        if (decoded.type !== TokenType.REFRESH)
          throw new UnauthorizedException("Invalid refresh token");
        await blacklistToken(refreshToken, this.tokenTtlSeconds(refreshToken));
        user = user ?? { id: decoded.sub, role: decoded.role };
      }

      if (user?.id) {
        await this.auditService.logSecurityEvent({
          eventType: SecurityEventType.LOGOUT,
          actorId: user.id,
          success: true,
          metadata: { role: user.role },
        });
      }

      return successResponse("Logged out successfully");
    } catch (error) {
      return errorResponse(error.message ?? "Logout failed", error);
    }
  }
}

