import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./entities/audit-log.entity";
import { successResponse, ServiceResponse } from "../../common/types/service-response";

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async findAll(query: {
    entity?: string;
    action?: string;
    actorId?: string;
    cityId?: string;
    subcityId?: string;
    woredaId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const qb = this.auditRepo.createQueryBuilder("audit");

    if (query.entity) {
      qb.andWhere("audit.entity = :entity", { entity: query.entity });
    }
    if (query.action) {
      qb.andWhere("audit.action = :action", { action: query.action });
    }
    if (query.actorId) {
      qb.andWhere("audit.actorId = :actorId", { actorId: query.actorId });
    }
    if (query.cityId) {
      qb.andWhere("audit.cityId = :cityId", { cityId: query.cityId });
    }
    if (query.subcityId) {
      qb.andWhere("audit.subcityId = :subcityId", { subcityId: query.subcityId });
    }
    if (query.woredaId) {
      qb.andWhere("audit.woredaId = :woredaId", { woredaId: query.woredaId });
    }
    if (query.startDate) {
      qb.andWhere("audit.timestamp >= :startDate", { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere("audit.timestamp <= :endDate", { endDate: query.endDate });
    }

    const [data, total] = await qb
      .orderBy("audit.timestamp", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return successResponse("Audit logs retrieved successfully", {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async findOne(id: string): Promise<ServiceResponse> {
    const log = await this.auditRepo.findOne({ where: { id } });
    if (!log) {
      return successResponse("Audit log not found", null, 404);
    }
    return successResponse("Audit log retrieved", log);
  }

  async getEntityTrail(
    entity: string,
    entityId: string,
  ): Promise<ServiceResponse> {
    const logs = await this.auditRepo.find({
      where: { entity, entityId },
      order: { timestamp: "ASC" },
    });

    return successResponse("Entity audit trail retrieved", logs);
  }
}
