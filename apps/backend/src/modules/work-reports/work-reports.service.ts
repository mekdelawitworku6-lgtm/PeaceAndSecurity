import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkReport } from "./entities/work-report.entity";
import {
  CreateWorkReportDto,
  UpdateWorkReportDto,
  ReviewWorkReportDto,
  WorkReportFilterDto,
} from "./dto/work-report.dto";
import { UserRole, WorkReportStatus, VIEWER_ROLE_SUFFIX } from "../../common/enums/enums";
import { successResponse } from "../../common/types/service-response";
import { User } from "../user/entities/user.entity";
import { Patrol } from "../patrol/entities/patrol.entity";

const STAFF_ROLES = new Set<string>([
  UserRole.SYSTEM_SUPER_ADMIN,
  UserRole.SYSTEM_ADMIN,
  UserRole.PEACE_SUPER_ADMIN,
  UserRole.PEACE_OFFICER_SUBCITY,
  UserRole.PEACE_OFFICER_WOREDA,
  UserRole.POLICE_COMMANDER_CITY,
  UserRole.POLICE_COMMANDER_SUBCITY,
  UserRole.POLICE_COMMANDER_WOREDA,
]);

const REVIEWER_ROLES = new Set<string>([
  UserRole.SYSTEM_SUPER_ADMIN,
  UserRole.SYSTEM_ADMIN,
  UserRole.PEACE_SUPER_ADMIN,
  UserRole.PEACE_OFFICER_SUBCITY,
  UserRole.PEACE_OFFICER_WOREDA,
  UserRole.POLICE_COMMANDER_CITY,
  UserRole.POLICE_COMMANDER_SUBCITY,
  UserRole.POLICE_COMMANDER_WOREDA,
]);

@Injectable()
export class WorkReportsService {
  constructor(
    @InjectRepository(WorkReport)
    private readonly workReportRepository: Repository<WorkReport>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patrol)
    private readonly patrolRepository: Repository<Patrol>,
  ) {}

  async create(user: { id: string; role: string }, dto: CreateWorkReportDto) {
    if (user.role === UserRole.CITIZEN) {
      throw new ForbiddenException("Citizens cannot submit work reports");
    }

    let reporterName: string | null = null;
    if (user.role === UserRole.PATROL) {
      const patrol = await this.patrolRepository.findOne({
        where: { id: user.id },
      });
      reporterName = patrol?.fullName ?? null;
    } else if (STAFF_ROLES.has(user.role)) {
      const staff = await this.userRepository.findOne({
        where: { id: user.id },
      });
      reporterName = staff?.fullName ?? null;
    }

    const report = this.workReportRepository.create({
      reporterId: user.id,
      reporterRole: user.role,
      reporterName,
      title: dto.title,
      description: dto.description,
      reportDate: dto.reportDate ?? new Date().toISOString().slice(0, 10),
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: WorkReportStatus.SUBMITTED,
    });

    const saved = await this.workReportRepository.save(report);
    return successResponse("Work report submitted successfully", saved);
  }

  async findAll(user: { id: string; role: string }, filter: WorkReportFilterDto) {
    const {
      reporterRole,
      status,
      reporterId,
      from,
      to,
      page = 1,
      limit = 10,
    } = filter;

    const qb = this.workReportRepository.createQueryBuilder("wr");

    if (user.role === UserRole.PATROL || user.role === UserRole.CITIZEN) {
      qb.andWhere("wr.reporterId = :reporterId", { reporterId: user.id });
    } else if (user.role.endsWith(VIEWER_ROLE_SUFFIX)) {
      qb.andWhere("1=1");
    } else if (!STAFF_ROLES.has(user.role)) {
      qb.andWhere("wr.reporterId = :reporterId", { reporterId: user.id });
    }

    if (reporterRole) qb.andWhere("wr.reporterRole = :reporterRole", { reporterRole });
    if (status) qb.andWhere("wr.status = :status", { status });
    if (reporterId) qb.andWhere("wr.reporterId = :reporterId", { reporterId });
    if (from) qb.andWhere("wr.reportDate >= :from", { from });
    if (to) qb.andWhere("wr.reportDate <= :to", { to });

    qb.orderBy("wr.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Work reports retrieved successfully",
      statusCode: 200,
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(user: { id: string; role: string }, id: string) {
    const report = await this.workReportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException("Work report not found");

    const isOwn = report.reporterId === user.id;
    const canView =
      isOwn ||
      STAFF_ROLES.has(user.role) ||
      user.role.endsWith(VIEWER_ROLE_SUFFIX);
    if (!canView) throw new ForbiddenException("Not allowed to view this report");

    return successResponse("Work report retrieved successfully", report);
  }

  async update(
    user: { id: string; role: string },
    id: string,
    dto: UpdateWorkReportDto,
  ) {
    const report = await this.workReportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException("Work report not found");
    if (report.reporterId !== user.id) {
      throw new ForbiddenException("Only the reporter can edit this report");
    }
    if (report.status !== WorkReportStatus.SUBMITTED) {
      throw new BadRequestException(
        "Only submitted reports can be edited",
      );
    }

    Object.assign(report, dto);
    const updated = await this.workReportRepository.save(report);
    return successResponse("Work report updated successfully", updated);
  }

  async review(
    user: { id: string; role: string },
    id: string,
    dto: ReviewWorkReportDto,
  ) {
    if (!REVIEWER_ROLES.has(user.role)) {
      throw new ForbiddenException("Only staff can review work reports");
    }

    const report = await this.workReportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException("Work report not found");

    report.status = dto.status;
    report.reviewNote = dto.reviewNote ?? report.reviewNote;
    report.reviewedById = user.id;
    report.reviewedAt = new Date();

    const saved = await this.workReportRepository.save(report);
    return successResponse("Work report reviewed successfully", saved);
  }

  async remove(id: string) {
    const report = await this.workReportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException("Work report not found");
    await this.workReportRepository.softDelete(id);
    return successResponse("Work report deleted successfully", { id });
  }
}