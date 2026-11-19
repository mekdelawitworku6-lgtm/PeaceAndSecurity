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

      let hashedPin: string | null = null;
      if (pin) {
        hashedPin = await this.hashPin(pin);
      }

      let citizen = existing;
      if (!citizen) {
        citizen = this.citizenRepository.create({
          fullName,
          userCode: generateRandomCode(8),
          phoneNumber: normalizedPhone,
          status: UserStatus.DISABLED,
          pin: hashedPin,
          isPinSet: false,
          profileImage,
          deviceId,
        });
      } else {
        citizen.fullName = fullName;
        if (profileImage) citizen.profileImage = profileImage;
        if (deviceId) citizen.deviceId = deviceId;
        if (hashedPin) citizen.pin = hashedPin;
      }

      const saved = await this.citizenRepository.save(citizen);

      // Attach anonymous reports submitted from this device before signup
      await this.attachGuestReports(saved.id, deviceId);

      // Issue registration OTP to verify phone number ownership (CWE-287)
      await this.otpService.removeBulkOtps?.({
        userId: saved.id,
        otpType: OTPType.REGISTRATION_OTP,
      });

      const otp = await this.otpService.createOtp({
        phoneNumber: normalizedPhone,
        userId: saved.id,
        otpType: OTPType.REGISTRATION_OTP,
      });

      sendSMS({
        recipient: normalizedPhone,
        messageBody: `Your verification code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const registrationToken = signRegistrationToken(this.jwtService, {
        sub: saved.id,
        phoneNumber: saved.phoneNumber,
        role: UserRole.CITIZEN,
      });

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.OTP_REQUESTED,
        actorId: saved.id,
        actorName: saved.fullName,
        targetUserId: saved.id,
        targetUserName: saved.fullName,
        success: true,
        metadata: { loginType: "CITIZEN_REGISTRATION", registrationPending: true },
      });

      return successResponse(
        "Verification code sent to your phone. Please verify to complete registration.",
        {
          registrationToken,
          isPinSet: false,
          ...(process.env.NODE_ENV === "development"
            ? { devOtp: otp.otpCode }
            : {}),
        },
      );
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

      const payload = {
        sub: citizen.id,
        phoneNumber: citizen.phoneNumber,
        role: UserRole.CITIZEN,
      };
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

      const payload = {
        sub: patrol.id,
        phoneNumber: patrol.phoneNumber,
        role: UserRole.PATROL,
      };
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

      let id: string;

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
      }

      const otpType =
        pinType === PINType.SETUP
          ? OTPType.REGISTRATION_OTP
          : OTPType.FORGOT_PIN_OTP;

      await this.otpService.removeBulkOtps({
        userId: id,
        otpType,
      });

      const otp = await this.otpService.createOtp({
        userId: id,
        phoneNumber: normalizedPhone,
        otpType,
      });

      await this.auditService.logSecurityEvent({
        eventType: pinType === PINType.SETUP ? SecurityEventType.OTP_REQUESTED : SecurityEventType.PIN_RESET_REQUESTED,
        actorId: id,
        success: true,
        metadata: { role, pinType },
      });

      const recipient = normalizedPhone;
      const messageAction =
        pinType === PINType.SETUP ? "verification" : "PIN reset";

      sendSMS({
        recipient,
        messageBody: `Your ${messageAction} code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const tokenSigner =
        pinType === PINType.SETUP ? signRegistrationToken : signPinResetToken;

      const resetToken = tokenSigner(this.jwtService, {
        sub: id,
        phoneNumber: normalizedPhone,
        role: role === "patrol" ? UserRole.PATROL : UserRole.CITIZEN,
      });

      return successResponse(
        `${pinType === PINType.SETUP ? "Verification" : "PIN reset"} OTP sent to your phone.`,
        {
          resetToken,
        },
      );
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
      const decoded = verifyToken<any>(
        this.jwtService,
        resetToken,
        process.env.JWT_PASSWORD_RESET_SECRET,
      );
      if (decoded.type !== TokenType.PIN_RESET)
        throw new UnauthorizedException("Invalid token type");

      const { sub: userId, role } = decoded;

      // Verify OTP
      await this.otpService.verifyOtp(userId, OTPType.FORGOT_PIN_OTP, otpCode);

      const hashedPin = await this.hashPin(newPin);

      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: userId },
        });
        if (!patrol) throw new NotFoundException("Patrol officer not found");
        patrol.pin = hashedPin;
        patrol.isPinSet = true;
        patrol.status = UserStatus.ACTIVE;
        await this.patrolRepository.save(patrol);
      } else if (role === UserRole.CITIZEN) {
        const citizen = await this.citizenRepository.findOne({
          where: { id: userId },
        });
        if (!citizen) throw new NotFoundException("Citizen not found");
        citizen.pin = hashedPin;
        citizen.isPinSet = true;
        citizen.status = UserStatus.ACTIVE;
        await this.citizenRepository.save(citizen);
      } else {
        throw new BadRequestException("Invalid role in reset token");
      }

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.PIN_RESET_COMPLETED,
        actorId: userId,
        success: true,
        metadata: { role },
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

      const setPasswordToken = signSetPasswordToken(this.jwtService, {
        sub: userId,
        phoneNumber: phone ?? undefined,
        email: email ?? undefined,
      });

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
      const secret =
        otpType === OTPType.REGISTRATION_OTP
          ? process.env.JWT_REG_SECRET
          : process.env.JWT_PASSWORD_RESET_SECRET;

      const expectedTokenType =
        otpType === OTPType.REGISTRATION_OTP
          ? TokenType.REGISTRATION
          : TokenType.PIN_RESET;

      const decoded = verifyToken<any>(this.jwtService, token, secret);

      if (decoded.type !== expectedTokenType)
        throw new UnauthorizedException("Invalid token type");

      const role = decoded.role;
      if (role !== UserRole.PATROL && role !== UserRole.CITIZEN)
        throw new UnauthorizedException("Invalid role in token");

      const userId = decoded.sub;
      const phone = decoded.phoneNumber;

      await this.otpService.verifyOtp(userId, otpType, otpCode);

      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (!patrol) throw new NotFoundException("Patrol officer not found");
      } else {
        const citizen = await this.citizenRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (!citizen) throw new NotFoundException("Citizen not found");
      }

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.OTP_VERIFIED,
        actorId: userId,
        success: true,
        metadata: { otpType, role },
      });

      const setPinToken = signSetPasswordToken(this.jwtService, {
        sub: userId,
        phoneNumber: phone,
        role,
      });

      // Also return access & refresh tokens if the user already has a PIN set
      // (e.g., during PIN reset flow), so the frontend can skip set-pin step.
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository
          .createQueryBuilder("patrol")
          .addSelect("patrol.pin")
          .where("patrol.id = :id", { id: userId })
          .getOne();
        if (patrol?.isPinSet) {
          const payload = { sub: patrol.id, phoneNumber: patrol.phoneNumber, role };
          accessToken = signAccessToken(this.jwtService, payload);
          refreshToken = signRefreshToken(this.jwtService, payload);
        }
      } else {
        const citizen = await this.citizenRepository
          .createQueryBuilder("citizen")
          .addSelect("citizen.pin")
          .where("citizen.id = :id", { id: userId })
          .getOne();
        if (citizen?.isPinSet) {
          const payload = { sub: citizen.id, phoneNumber: citizen.phoneNumber, role };
          accessToken = signAccessToken(this.jwtService, payload);
          refreshToken = signRefreshToken(this.jwtService, payload);
        }
      }

      return successResponse("OTP verified successfully.", {
        setPinToken,
        ...(accessToken ? { accessToken, refreshToken } : {}),
      });
    } catch (error) {
      return errorResponse(error.message ?? "Failed to verify OTP", error);
    }
  }

  async resendMobileOTP(
    token: string,
    otpType: OTPType,
  ): Promise<ServiceResponse> {
    try {
      const secret =
        otpType === OTPType.REGISTRATION_OTP
          ? process.env.JWT_REG_SECRET
          : process.env.JWT_PASSWORD_RESET_SECRET;

      const expectedTokenType =
        otpType === OTPType.REGISTRATION_OTP
          ? TokenType.REGISTRATION
          : TokenType.PIN_RESET;

      const decoded = verifyToken<any>(this.jwtService, token, secret);

      if (decoded.type !== expectedTokenType)
        throw new UnauthorizedException("Invalid token type");

      const userId = decoded.sub;
      const phone = decoded.phoneNumber;

      const otp = await this.otpService.createOtp({
        phoneNumber: phone,
        userId,
        otpType,
      });

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.OTP_REQUESTED,
        actorId: userId,
        success: true,
        metadata: { otpType, resent: true },
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
      const phone = decoded.phoneNumber;
      const hashedPin = await this.hashPin(pin);

      let savedUser: any;
      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        patrol.pin = hashedPin;
        patrol.isPinSet = true;
        patrol.status = UserStatus.ACTIVE;
        savedUser = await this.patrolRepository.save(patrol);
      } else {
        const citizen = await this.citizenRepository.findOne({
          where: { id: userId, phoneNumber: phone },
        });
        if (!citizen) throw new NotFoundException("Citizen not found");
        citizen.pin = hashedPin;
        citizen.isPinSet = true;
        citizen.status = UserStatus.ACTIVE;
        savedUser = await this.citizenRepository.save(citizen);
      }

      const payload = {
        sub: savedUser.id,
        phoneNumber: savedUser.phoneNumber,
        role,
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

      const payload = {
        sub: savedUser.id,
        phoneNumber: savedUser.phoneNumber,
        email: savedUser.email,
        role: savedUser.role,
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

      await this.otpService.removeBulkOtps({
        userId: user.id,
        otpType: OTPType.FORGOT_PASSWORD_OTP,
      });
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
        sub: user.id,
        phoneNumber: normalizedPhone,
        role: user.role,
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

      const resetToken = signSetPasswordToken(this.jwtService, {
        sub: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
      });
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
      await this.otpService.removeBulkOtps?.({
        userId: patrol.id,
        otpType: OTPType.REGISTRATION_OTP,
      });
      const otp = await this.otpService.createOtp({
        phoneNumber: normalizedPhone,
        userId: patrol.id,
        otpType: OTPType.REGISTRATION_OTP,
      });

      sendSMS({
        recipient: normalizedPhone,
        messageBody: `Your verification code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const registrationToken = signRegistrationToken(this.jwtService, {
        sub: patrol.id,
        phoneNumber: normalizedPhone,
        role: UserRole.PATROL,
      });

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
      await this.otpService.removeBulkOtps?.({
        userId: citizen.id,
        otpType: OTPType.REGISTRATION_OTP,
      });
      const otp = await this.otpService.createOtp({
        phoneNumber: normalizedPhone,
        userId: citizen.id,
        otpType: OTPType.REGISTRATION_OTP,
      });

      sendSMS({
        recipient: normalizedPhone,
        messageBody: `Your verification code is ${otp.otpCode}. It expires in 2 minutes.`,
      }).catch(() => void 0);

      const registrationToken = signRegistrationToken(this.jwtService, {
        sub: citizen.id,
        phoneNumber: normalizedPhone,
        role: UserRole.CITIZEN,
      });

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
        await this.otpService.removeBulkOtps?.({
          userId: user.id,
          otpType: OTPType.REGISTRATION_OTP,
        });
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

        const registrationToken = signRegistrationToken(this.jwtService, {
          sub: user.id,
          phoneNumber: user.phoneNumber,
        });
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

      const payload = {
        sub: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      };
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

      if (await isTokenBlacklisted(refreshToken))
        throw new UnauthorizedException(
          "Session has been terminated or token has been revoked",
        );

      const { sub, role } = decoded;

      if (role === UserRole.PATROL) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: sub, status: UserStatus.ACTIVE },
        });
        if (!patrol)
          throw new UnauthorizedException(
            "Patrol officer not found or inactive",
          );

        const payload = {
          sub: patrol.id,
          phoneNumber: patrol.phoneNumber,
          role: UserRole.PATROL,
        };
        const accessToken = signAccessToken(this.jwtService, payload);
        await this.auditService.logSecurityEvent({
          eventType: SecurityEventType.TOKEN_REFRESH,
          actorId: patrol.id,
          success: true,
          metadata: { role: UserRole.PATROL },
        });
        return successResponse("Token refreshed successfully", { accessToken });
      }

      if (role === UserRole.CITIZEN) {
        const citizen = await this.citizenRepository.findOne({
          where: { id: sub, status: UserStatus.ACTIVE },
        });
        if (!citizen)
          throw new UnauthorizedException("Citizen not found or inactive");

        const payload = {
          sub: citizen.id,
          phoneNumber: citizen.phoneNumber,
          role: UserRole.CITIZEN,
        };
        const accessToken = signAccessToken(this.jwtService, payload);
        await this.auditService.logSecurityEvent({
          eventType: SecurityEventType.TOKEN_REFRESH,
          actorId: citizen.id,
          success: true,
          metadata: { role: UserRole.CITIZEN },
        });
        return successResponse("Token refreshed successfully", { accessToken });
      }

      // Dashboard user (admin roles)
      const user = await this.userRepository.findOne({
        where: { id: sub, status: UserStatus.ACTIVE },
      });
      if (!user) throw new UnauthorizedException("User not found or inactive");

      const payload = {
        sub: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      };
      const accessToken = signAccessToken(this.jwtService, payload);

      await this.auditService.logSecurityEvent({
        eventType: SecurityEventType.TOKEN_REFRESH,
        actorId: user.id,
        success: true,
        metadata: { role: user.role },
      });

      return successResponse("Token refreshed successfully", { accessToken });
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
          const decoded = this.jwtService.decode(accessToken) as any;
          if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            const remaining = decoded.exp - now;
            if (remaining > 0) {
              await blacklistToken(accessToken, remaining);
            }
          }
        } catch (_) {}
      }

      if (refreshToken) {
        try {
          const decoded = this.jwtService.decode(refreshToken) as any;
          if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            const remaining = decoded.exp - now;
            if (remaining > 0) {
              await blacklistToken(refreshToken, remaining);
            }
          }
        } catch (_) {}
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

