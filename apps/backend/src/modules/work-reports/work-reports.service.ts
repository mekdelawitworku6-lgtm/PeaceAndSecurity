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
import { UserRole, WorkReportStatus } from "../../common/enums/enums";
import { successResponse } from "../../common/types/service-response";
import { User } from "../user/entities/user.entity";
import { Patrol } from "../patrol/entities/patrol.entity";
import { Woreda } from "../geo/entities/woreda.entity";

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

// Hierarchy level per role: 0 = city/top, 1 = subcity, 2 = woreda.
// Visibility is top-to-bottom + horizontal: a role sees reports from
// the same level and below, never from above.
const ROLE_LEVEL: Record<string, number> = {
  [UserRole.SYSTEM_SUPER_ADMIN]: 0,
  [UserRole.SYSTEM_ADMIN]: 0,
  [UserRole.PEACE_SUPER_ADMIN]: 0,
  [UserRole.POLICE_COMMANDER_CITY]: 0,
  [UserRole.SYSTEM_SUPER_ADMIN_VIEWER]: 0,
  [UserRole.SYSTEM_ADMIN_VIEWER]: 0,
  [UserRole.PEACE_SUPER_ADMIN_VIEWER]: 0,
  [UserRole.POLICE_COMMANDER_CITY_VIEWER]: 0,
  [UserRole.PEACE_OFFICER_SUBCITY]: 1,
  [UserRole.POLICE_COMMANDER_SUBCITY]: 1,
  [UserRole.PEACE_OFFICER_SUBCITY_VIEWER]: 1,
  [UserRole.POLICE_COMMANDER_SUBCITY_VIEWER]: 1,
  [UserRole.PEACE_OFFICER_WOREDA]: 2,
  [UserRole.POLICE_COMMANDER_WOREDA]: 2,
  [UserRole.PEACE_OFFICER_WOREDA_VIEWER]: 2,
  [UserRole.POLICE_COMMANDER_WOREDA_VIEWER]: 2,
  [UserRole.PATROL]: 3,
};

function visibleReporterRoles(role: string): string[] {
  const level = ROLE_LEVEL[role];
  if (level === undefined) return [];
  return Object.keys(ROLE_LEVEL).filter((r) => ROLE_LEVEL[r] >= level);
}

@Injectable()
export class WorkReportsService {
  constructor(
    @InjectRepository(WorkReport)
    private readonly workReportRepository: Repository<WorkReport>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patrol)
    private readonly patrolRepository: Repository<Patrol>,
    @InjectRepository(Woreda)
    private readonly woredaRepository: Repository<Woreda>,
  ) {}

  async create(user: { id: string; role: string }, dto: CreateWorkReportDto) {
    if (user.role === UserRole.CITIZEN) {
      throw new ForbiddenException("Citizens cannot submit work reports");
    }

    let reporterName: string | null = null;
    let cityId: string | null = null;
    let subcityId: string | null = null;
    let woredaId: string | null = null;

    if (user.role === UserRole.PATROL) {
      const patrol = await this.patrolRepository.findOne({
        where: { id: user.id },
      });
      reporterName = patrol?.fullName ?? null;
      woredaId = patrol?.woredaId ?? null;
      if (woredaId) {
        const woreda = await this.woredaRepository.findOne({
          where: { id: woredaId },
          relations: ["subcity"],
        });
        subcityId = woreda?.subcityId ?? null;
        cityId = woreda?.subcity?.cityId ?? null;
      }
    } else if (STAFF_ROLES.has(user.role)) {
      const staff = await this.userRepository.findOne({
        where: { id: user.id },
      });
      reporterName = staff?.fullName ?? null;
      cityId = staff?.cityId ?? null;
      subcityId = staff?.subcityId ?? null;
      woredaId = staff?.woredaId ?? null;
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
      cityId: cityId ?? undefined,
      subcityId: subcityId ?? undefined,
      woredaId: woredaId ?? undefined,
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
      search,
      page = 1,
      limit = 10,
    } = filter;

    const qb = this.workReportRepository.createQueryBuilder("wr");

    if (user.role === UserRole.PATROL || user.role === UserRole.CITIZEN) {
      qb.andWhere("wr.reporterId = :reporterId", { reporterId: user.id });
    } else if (ROLE_LEVEL[user.role] !== undefined) {
      const roles = visibleReporterRoles(user.role);
      qb.andWhere(
        "(wr.reporterRole IN (:...roles) OR wr.reporterId = :uid)",
        { roles, uid: user.id },
      );

      const staff = await this.userRepository.findOne({ where: { id: user.id } });
      if (staff?.woredaId) {
        qb.andWhere(
          "(wr.woredaId = :woredaId OR wr.reporterId = :uid)",
          { woredaId: staff.woredaId, uid: user.id },
        );
      } else if (staff?.subcityId) {
        qb.andWhere(
          "(wr.subcityId = :subcityId OR wr.reporterId = :uid)",
          { subcityId: staff.subcityId, uid: user.id },
        );
      } else if (staff?.cityId) {
        qb.andWhere(
          "(wr.cityId = :cityId OR wr.cityId IS NULL OR wr.reporterId = :uid)",
          { cityId: staff.cityId, uid: user.id },
        );
      }
    } else {
      qb.andWhere("wr.reporterId = :reporterId", { reporterId: user.id });
    }

    if (reporterRole) qb.andWhere("wr.reporterRole = :reporterRole", { reporterRole });
    if (status) qb.andWhere("wr.status = :status", { status });
    if (reporterId) qb.andWhere("wr.reporterId = :reporterId", { reporterId });
    if (from) qb.andWhere("wr.reportDate >= :from", { from });
    if (to) qb.andWhere("wr.reportDate <= :to", { to });

    if (search && search.trim()) {
      qb.andWhere(
        "(wr.title ILIKE :search OR wr.reporterName ILIKE :search)",
        { search: `%${search.trim()}%` },
      );
    }

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
      (ROLE_LEVEL[user.role] !== undefined &&
        ROLE_LEVEL[report.reporterRole] !== undefined &&
        ROLE_LEVEL[report.reporterRole] >= ROLE_LEVEL[user.role]);
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

    const reviewerLevel = ROLE_LEVEL[user.role];
    const reportLevel = ROLE_LEVEL[report.reporterRole];
    if (reportLevel === undefined || reviewerLevel === undefined || reportLevel < reviewerLevel) {
      throw new ForbiddenException("Not allowed to review this report");
    }

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