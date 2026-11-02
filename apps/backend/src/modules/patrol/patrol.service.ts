import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Patrol } from "./entities/patrol.entity";
import { CreatePatrolDto } from "./dto/create-patrol.dto";
import { UpdatePatrolDto } from "./dto/update-patrol.dto";
import { BusinessEventType, UserStatus } from "../../common/enums/enums";
import {
  ServiceResponse,
  successResponse,
} from "../../common/types/service-response";
import { generateRandomCode } from "../../common/utils/generator";
import { hashPassword } from "../../common/utils/password.util";
import { normalizeEtPhone } from "../../common/utils/validator";
import { sendSMS } from "../../common/utils/sms-sender";
import { getDistance } from "../../common/utils/geo-util";
import { processUploads } from "../../common/utils/file-upload.util";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class PatrolService {
  constructor(
    @InjectRepository(Patrol)
    private readonly patrolRepository: Repository<Patrol>,
    private readonly auditService: AuditService,
  ) { }

  async create(
    dto: CreatePatrolDto,
    file?: any,
    creator?: { id: string; role?: string; woredaId?: string },
  ): Promise<ServiceResponse> {
    if (file) {
      const [asset] = await processUploads(
        file,
        { baseDir: "uploads", publicBase: "/", makeThumb: false, quality: 82 },
        "profiles",
      );
      dto.profileImage = asset?.url;
    }
    const normalizedPhone = normalizeEtPhone(dto.phoneNumber);
    if (!normalizedPhone)
      throw new BadRequestException("Invalid Ethiopian phone number format");

    const normalizedEmail = dto.email?.trim()
      ? dto.email.trim().toLowerCase()
      : null;

    const existingPhone = await this.patrolRepository.findOne({
      where: { phoneNumber: normalizedPhone },
    });
    if (existingPhone)
      throw new ConflictException("Phone number already registered to another patrol officer");

    if (normalizedEmail) {
      const existingEmail = await this.patrolRepository.findOne({
        where: { email: normalizedEmail },
      });
      if (existingEmail)
        throw new ConflictException("Email address already registered to another patrol officer");
    }

    const rawPin = dto.pin?.trim() || "1234";
    const hashedPin = await hashPassword(rawPin);

    const patrol = this.patrolRepository.create({
      fullName: dto.fullName,
      phoneNumber: normalizedPhone,
      email: normalizedEmail,
      pin: hashedPin,
      isPinSet: true,
      userCode: generateRandomCode(8),
      status: UserStatus.ACTIVE,
      officeAddress: dto.officeAddress,
      officeLatitude: dto.officeLatitude,
      officeLongitude: dto.officeLongitude,
      assignedArea: dto.assignedArea,
      commanderId: dto.commanderId || creator?.id,
      woredaId: dto.woredaId || (creator as any)?.woredaId,
      profileImage: dto.profileImage,
    });

    const saved = await this.patrolRepository.save(patrol);

    void this.auditService.logBusinessEvent({
      eventType: BusinessEventType.PATROL_DISPATCHED,
      entity: "Patrol",
      entityId: saved.id,
      description: `Patrol officer dispatched for duty`,
      metadata: { fullName: dto.fullName, assignedArea: dto.assignedArea },
    });

    sendSMS({
      recipient: normalizedPhone,
      messageBody: `Welcome, ${dto.fullName}! Your patrol account has been created. Your login PIN is ${rawPin}. Please download the Patrol app to sign in.`,
    }).catch(() => void 0);

    const { pin, ...result } = saved as any;
    return successResponse("Patrol officer registered successfully", result);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const qb = this.patrolRepository.createQueryBuilder("patrol");

    if (query.search) {
      qb.andWhere(
        "(patrol.fullName ILIKE :search OR patrol.phoneNumber ILIKE :search OR patrol.assignedArea ILIKE :search)",
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere("patrol.status = :status", { status: query.status });
    }

    if (query.startDate) {
      qb.andWhere("patrol.createdAt >= :startDate", { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere("patrol.createdAt <= :endDate", { endDate: query.endDate });
    }

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "ASC" ? "ASC" : "DESC";
    const safeSortBy = ["createdAt", "fullName", "phoneNumber", "status", "assignedArea"].includes(sortBy)
      ? sortBy
      : "createdAt";

    const [data, total] = await qb
      .orderBy(`patrol.${safeSortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const items = data.map(({ pin, ...safe }: any) => safe);

    return {
      success: true,
      message: "Patrol officers retrieved successfully",
      statusCode: 200,
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ServiceResponse> {
    const patrol = await this.patrolRepository.findOne({ where: { id } });
    if (!patrol)
      throw new NotFoundException(`Patrol officer with ID ${id} not found`);
    const { pin, ...result } = patrol as any;
    return successResponse("Patrol officer retrieved successfully", result);
  }

  async getPatrolById(id: string): Promise<Patrol | null> {
    return this.patrolRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdatePatrolDto, file?: any): Promise<ServiceResponse> {
    const patrol = await this.patrolRepository.findOne({ where: { id } });
    if (!patrol)
      throw new NotFoundException(`Patrol officer with ID ${id} not found`);

    if (file) {
      const [asset] = await processUploads(
        file,
        { baseDir: "uploads", publicBase: "/", makeThumb: false, quality: 82 },
        "profiles",
      );
      dto.profileImage = asset?.url;
    }

    if (dto.phoneNumber) {
      const normalizedPhone = normalizeEtPhone(dto.phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid Ethiopian phone number format");
      dto.phoneNumber = normalizedPhone;
    }

    Object.assign(patrol, dto);
    const updated = await this.patrolRepository.save(patrol);
    const { pin, ...result } = updated as any;
    return successResponse("Patrol officer updated successfully", result);
  }

  async remove(id: string): Promise<ServiceResponse> {
    const patrol = await this.patrolRepository.findOne({ where: { id } });
    if (!patrol)
      throw new NotFoundException(`Patrol officer with ID ${id} not found`);
    await this.patrolRepository.save({ ...patrol, deletedAt: new Date() });
    return successResponse("Patrol officer deleted successfully");
  }

  async updateLocation(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<ServiceResponse> {
    const patrol = await this.patrolRepository.findOne({ where: { id } });
    if (!patrol) throw new NotFoundException("Patrol officer not found");

    patrol.latitude = latitude;
    patrol.longitude = longitude;
    patrol.lastLocationUpdate = new Date();
    await this.patrolRepository.save(patrol);

    return successResponse("Location updated", { latitude, longitude });
  }

  async findNearby(
    lat: number,
    lon: number,
    radiusKm = 10,
  ): Promise<ServiceResponse> {
    const allPatrols = await this.patrolRepository.find({
      where: { status: UserStatus.ACTIVE },
    });

    const nearby = allPatrols
      .map((p) => {
        const pLat = Number(p.latitude ?? p.officeLatitude);
        const pLon = Number(p.longitude ?? p.officeLongitude);

        if (isNaN(pLat) || isNaN(pLon)) return null;

        const distanceKm = getDistance(lat, lon, pLat, pLon) / 1000;
        return {
          ...p,
          distanceKm,
        };
      })
      .filter((p): p is any => p !== null && p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Remove sensitive info
    const safeItems = nearby.map(({ pin, ...safe }) => safe);

    return successResponse("Nearby patrol officers retrieved", safeItems);
  }

  async getPatrolProfile(id: string): Promise<ServiceResponse> {
    const patrol = await this.patrolRepository.findOne({ where: { id } });
    if (!patrol) throw new NotFoundException("Patrol officer not found");
    const { pin, ...result } = patrol as any;
    return successResponse("Profile retrieved successfully", result);
  }

  async updatePatrolProfile(
    id: string,
    dto: UpdatePatrolDto,
  ): Promise<ServiceResponse> {
    const patrol = await this.patrolRepository.findOne({ where: { id } });
    if (!patrol) throw new NotFoundException("Patrol officer not found");

    if (dto.phoneNumber) {
      const normalizedPhone = normalizeEtPhone(dto.phoneNumber);
      if (!normalizedPhone)
        throw new BadRequestException("Invalid Ethiopian phone number format");

      const existing = await this.patrolRepository.findOne({
        where: { phoneNumber: normalizedPhone },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Phone number already in use");
      }
      patrol.phoneNumber = normalizedPhone;
    }

    if (dto.fullName) patrol.fullName = dto.fullName;
    if (dto.email) patrol.email = dto.email;
    if (dto.profileImage) patrol.profileImage = dto.profileImage;
    if (dto.officeAddress) patrol.officeAddress = dto.officeAddress;
    if (dto.officeLatitude !== undefined)
      patrol.officeLatitude = dto.officeLatitude;
    if (dto.officeLongitude !== undefined)
      patrol.officeLongitude = dto.officeLongitude;
    if (dto.assignedArea) patrol.assignedArea = dto.assignedArea;

    const updated = await this.patrolRepository.save(patrol);
    const { pin, ...result } = updated as any;
    return successResponse("Profile updated successfully", result);
  }
}
