import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { BusinessEventType, UserStatus, UserRole } from "../../common/enums/enums";
import { CreateUserDto } from "./dto/create-user.dto";
import { sendSMS } from "../../common/utils/sms-sender";
import { normalizeEtPhone } from "../../common/utils/validator";
import { hashPassword } from "../../common/utils/password.util";
import { UserFilterDto } from "./dto/user-filter.dto";
import {
  ServiceResponse,
  successResponse,
} from "../../common/types/service-response";
import { generateRandomCode } from "../../common/utils/generator";
import { AuditService } from "../audit/audit.service";

export const CREATE_ACCESS: Record<string, UserRole[]> = {
  [UserRole.SYSTEM_SUPER_ADMIN]: [
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
  ],
  [UserRole.SYSTEM_ADMIN]: [
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
  ],
  [UserRole.PEACE_SUPER_ADMIN]: [
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
  ],
  [UserRole.POLICE_COMMANDER_CITY]: [
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
  ],
  [UserRole.PEACE_OFFICER_SUBCITY]: [
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_WOREDA,
    UserRole.PEACE_OFFICER_WOREDA_VIEWER,
    UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
  ],
  [UserRole.POLICE_COMMANDER_SUBCITY]: [
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_WOREDA,
    UserRole.PEACE_OFFICER_WOREDA_VIEWER,
    UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
  ],
  [UserRole.PEACE_OFFICER_WOREDA]: [],
  [UserRole.POLICE_COMMANDER_WOREDA]: [],
  [UserRole.SYSTEM_SUPER_ADMIN_VIEWER]: [],
  [UserRole.SYSTEM_ADMIN_VIEWER]: [],
  [UserRole.PEACE_SUPER_ADMIN_VIEWER]: [],
  [UserRole.PEACE_OFFICER_SUBCITY_VIEWER]: [],
  [UserRole.PEACE_OFFICER_WOREDA_VIEWER]: [],
  [UserRole.POLICE_COMMANDER_CITY_VIEWER]: [],
  [UserRole.POLICE_COMMANDER_SUBCITY_VIEWER]: [],
  [UserRole.POLICE_COMMANDER_WOREDA_VIEWER]: [],
  [UserRole.PATROL]: [],
  [UserRole.CITIZEN]: [],
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  /* ---------------- REGISTER DASHBOARD USER ---------------- */
  async register(
    dto: CreateUserDto,
    creator?: { id: string; role: string },
  ): Promise<ServiceResponse> {
    const normalizedPhone = dto.phoneNumber
      ? normalizeEtPhone(dto.phoneNumber)
      : null;
    const normalizedEmail = dto.email?.trim().toLowerCase();

    if (!normalizedPhone && !normalizedEmail) {
      throw new BadRequestException(
        "Either valid phone number or email is required",
      );
    }

    const existing = await this.userRepository.findOne({
      where: [
        ...(normalizedPhone ? [{ phoneNumber: normalizedPhone }] : []),
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ],
    });

    if (existing) {
      throw new ConflictException(
        "User with this phone or email already exists",
      );
    }

    const userRole = dto.role ?? UserRole.PEACE_OFFICER_SUBCITY;

    // Allow dashboard + viewer roles; patrol/citizen have their own endpoints
    const mobileRoles = [UserRole.PATROL, UserRole.CITIZEN];
    if (mobileRoles.includes(userRole)) {
      throw new BadRequestException(
        "Use the /patrols or /citizens endpoints to register patrol officers or citizens.",
      );
    }

    // Scope enforcement: a role can only create roles within its access map
    if (creator) {
      const allowed = CREATE_ACCESS[creator.role];
      if (!allowed || !allowed.includes(userRole)) {
        throw new ForbiddenException(
          `Role ${creator.role} is not allowed to create ${userRole} users`,
        );
      }
    }

    const isStaff = true;

    const passwordHash = dto.password
      ? await hashPassword(dto.password)
      : undefined;

    const user = this.userRepository.create({
      fullName: dto.fullName,
      userCode: generateRandomCode(8),
      phoneNumber: normalizedPhone,
      email: normalizedEmail,
      role: userRole,
      isStaffUser: isStaff,
      profileImage: dto.profileImage,
      permissions: dto.permissions || [],
      status: dto.password ? UserStatus.ACTIVE : UserStatus.PENDING,
      password: passwordHash,
      isPasswordSet: !!dto.password,
      isPhoneVerified: !!normalizedPhone,
      isEmailVerified: !!normalizedEmail,
      cityId: dto.cityId,
      subcityId: dto.subcityId,
      woredaId: dto.woredaId,
    });

    const saved = await this.userRepository.save(user);

    if (!dto.password && saved.phoneNumber) {
      try {
        await sendSMS({
          recipient: saved.phoneNumber,
          messageBody: `Your admin account has been created.\nEmail: ${saved.email ?? "N/A"}\nPlease login to the dashboard and set your password.`,
        });
      } catch {
        console.error("Failed to send registration SMS");
      }
    }

    return successResponse("Admin user created successfully.", {
      id: saved.id,
      userCode: saved.userCode,
      fullName: saved.fullName,
      phoneNumber: saved.phoneNumber,
      email: saved.email,
      role: saved.role,
      status: saved.status,
      isPasswordSet: saved.isPasswordSet,
    });
  }

  /* ---------------- GET PROFILE ---------------- */
  async getUserProfile(
    userId: string,
  ): Promise<ServiceResponse<Omit<User, "password">>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    return successResponse(
      "Profile retrieved successfully",
      this.sanitizeUser(user),
    );
  }

  /* ---------------- UPDATE PROFILE ---------------- */
  async updateUserProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<ServiceResponse<Omit<User, "password">>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (dto.phoneNumber) {
      const normalizedPhone = normalizeEtPhone(dto.phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid phone number format");
      dto.phoneNumber = normalizedPhone;
    }
    if (dto.email) {
      dto.email = dto.email.trim().toLowerCase();
    }

    Object.assign(user, dto);
    const updated = await this.userRepository.save(user);
    return successResponse(
      "Profile updated successfully",
      this.sanitizeUser(updated),
    );
  }

  /* ---------------- GET ALL USERS (PAGINATED) ---------------- */
  async getAllUsers(filterDto: UserFilterDto): Promise<any> {
    const {
      role,
      status,
      search,
      isStaffUser,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = filterDto;

    const query = this.userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.userCode",
        "user.fullName",
        "user.phoneNumber",
        "user.email",
        "user.role",
        "user.status",
        "user.isPhoneVerified",
        "user.isEmailVerified",
        "user.profileImage",
        "user.isStaffUser",
        "user.permissions",
        "user.createdAt",
        "user.updatedAt",
        "user.cityId",
        "user.subcityId",
        "user.woredaId",
        "user.isPasswordSet",
      ]);

    // Dashboard displays admin roles only — exclude patrol/citizen
    query.andWhere("user.role NOT IN (:...mobileRoles)", {
      mobileRoles: [UserRole.PATROL, UserRole.CITIZEN],
    });

    if (role) query.andWhere("user.role = :role", { role });
    if (status) query.andWhere("user.status = :status", { status });

    if (isStaffUser !== undefined) {
      query.andWhere("user.isStaffUser = :isStaffUser", { isStaffUser });
    }
    if (startDate)
      query.andWhere("user.createdAt >= :startDate", { startDate });
    if (endDate) query.andWhere("user.createdAt <= :endDate", { endDate });

    if (search && search.trim()) {
      query.andWhere(
        `(user.fullName ILIKE :search
          OR user.email ILIKE :search
          OR user.userCode ILIKE :search
          OR user.phoneNumber ILIKE :search)`,
        { search: `%${search.trim()}%` },
      );
    }

    query.orderBy(`user.${sortBy}`, sortOrder as "ASC" | "DESC");
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Users retrieved successfully",
      statusCode: 200,
      data,
      total,
      page,
      limit,
      totalPages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  /* ---------------- GET SINGLE USER BY PARAMS ---------------- */
  async getUser(
    params: Record<string, any>,
  ): Promise<ServiceResponse<Omit<User, "password">>> {
    if (!params || Object.keys(params).length === 0) {
      throw new BadRequestException(
        "At least one parameter is required to fetch a user",
      );
    }

    const normalizedParams: Record<string, any> = { ...params };
    if (normalizedParams.email) {
      normalizedParams.email = normalizedParams.email.trim().toLowerCase();
    }
    if (normalizedParams.phoneNumber) {
      normalizedParams.phoneNumber = normalizeEtPhone(
        normalizedParams.phoneNumber,
      );
    }

    const qb = this.userRepository.createQueryBuilder("user");
    Object.entries(normalizedParams).forEach(([key, value], index) => {
      qb.andWhere(`user.${key} = :v${index}`, { [`v${index}`]: value });
    });

    const user = await qb.getOne();
    if (!user) throw new NotFoundException("User not found");
    return successResponse(
      "User retrieved successfully",
      this.sanitizeUser(user),
    );
  }

  /* ---------------- TOGGLE STATUS ---------------- */
  async toggleUserStatus(
    id: string,
  ): Promise<ServiceResponse<Omit<User, "password">>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    user.status =
      user.status === UserStatus.ACTIVE
        ? UserStatus.DISABLED
        : UserStatus.ACTIVE;
    const updated = await this.userRepository.save(user);

    void this.auditService.logBusinessEvent({
      eventType: BusinessEventType.USER_STATUS_TOGGLED,
      entity: "User",
      entityId: user.id,
      description: `User status toggled to ${updated.status}`,
      metadata: { previousStatus: updated.status === UserStatus.ACTIVE ? "DISABLED" : "ACTIVE", newStatus: updated.status },
    });

    return successResponse(
      "User status updated successfully",
      this.sanitizeUser(updated),
    );
  }

  /* ---------------- DELETE USER (super admin only) ---------------- */
  async deleteUser(
    id: string,
  ): Promise<ServiceResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    if (user.role === UserRole.SYSTEM_SUPER_ADMIN) {
      throw new BadRequestException("Cannot delete a Super Admin user");
    }

    await this.userRepository.save({ ...user, deletedAt: new Date() });
    return successResponse("User deleted successfully", { id });
  }

  /* ---------------- RESET PASSWORD BY ADMIN (dashboard users only) ---------------- */
  async resetUserPassword(
    adminId: string,
    targetId: string,
  ): Promise<ServiceResponse> {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    const user = await this.userRepository.findOne({ where: { id: targetId } });

    if (!user) throw new NotFoundException("User not found");
    if (!admin) throw new NotFoundException("Admin not found");

    const isSystemAdmin =
      admin.role === UserRole.SYSTEM_SUPER_ADMIN ||
      admin.role === UserRole.SYSTEM_ADMIN;
    if (!isSystemAdmin) {
      throw new BadRequestException("Only system admins can reset passwords");
    }

    // Patrol / Citizen users are in separate tables — they should use the auth PIN reset
    if (user.role === UserRole.PATROL || user.role === UserRole.CITIZEN) {
      throw new BadRequestException(
        "Patrol and Citizen PINs are managed via the auth PIN endpoints or /patrols/:id and /citizens/:id.",
      );
    }

    const tempPassword = generateRandomCode(8);
    user.password = await hashPassword(tempPassword);
    user.isPasswordSet = true;
    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);

    if (user.phoneNumber) {
      const recipient = normalizeEtPhone(user.phoneNumber);
      if (recipient) {
        await sendSMS({
          recipient,
          messageBody: `Your password has been reset by admin. Temporary password: ${tempPassword}\nPlease login to the dashboard and change your password immediately.`,
        }).catch(() => void 0);
      }
    }

    return successResponse(
      "Password reset successfully. New password sent via SMS.",
      { tempPassword },
    );
  }

  /* ---------------- SANITIZER ---------------- */
  private sanitizeUser(user: User): Omit<User, "password"> {
    const { password, ...rest } = user as any;
    return rest;
  }
}
