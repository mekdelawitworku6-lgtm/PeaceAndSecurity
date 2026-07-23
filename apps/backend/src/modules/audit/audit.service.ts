import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Response } from "express";
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

  /* ---------------- EXPORT CSV ---------------- */
  async exportCsv(
    query: { entity?: string; action?: string; startDate?: string; endDate?: string },
    res: Response,
  ): Promise<void> {
    const qb = this.auditRepo.createQueryBuilder("audit");

    if (query.entity) qb.andWhere("audit.entity = :entity", { entity: query.entity });
    if (query.action) qb.andWhere("audit.action = :action", { action: query.action });
    if (query.startDate) qb.andWhere("audit.timestamp >= :startDate", { startDate: query.startDate });
    if (query.endDate) qb.andWhere("audit.timestamp <= :endDate", { endDate: query.endDate });

    const logs = await qb.orderBy("audit.timestamp", "DESC").getMany();

    const header = "Timestamp,Actor,Role,Entity,Entity ID,Action,Description,IP Address\n";
    const rows = logs.map((l) =>
      [
        `"${l.timestamp}"`,
        `"${l.actorName || l.actorId}"`,
        `"${l.actorRole || ""}"`,
        `"${l.entity}"`,
        `"${l.entityId}"`,
        `"${l.action}"`,
        `"${(l.description || "").replace(/"/g, '""')}"`,
        `"${l.ipAddress || ""}"`,
      ].join(",")
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(header + rows);
  }

  /* ---------------- EXPORT PDF (HTML print) ---------------- */
  async exportPdf(
    query: { entity?: string; action?: string; startDate?: string; endDate?: string },
    res: Response,
  ): Promise<void> {
    const qb = this.auditRepo.createQueryBuilder("audit");

    if (query.entity) qb.andWhere("audit.entity = :entity", { entity: query.entity });
    if (query.action) qb.andWhere("audit.action = :action", { action: query.action });
    if (query.startDate) qb.andWhere("audit.timestamp >= :startDate", { startDate: query.startDate });
    if (query.endDate) qb.andWhere("audit.timestamp <= :endDate", { endDate: query.endDate });

    const logs = await qb.orderBy("audit.timestamp", "DESC").getMany();

    const html = `<!DOCTYPE html>
<html><head><title>Audit Logs Export</title>
<style>
  body{font-family:Arial,sans-serif;padding:20px;color:#1e293b}
  h1{font-size:18px;color:#0c2340;margin-bottom:4px}
  .meta{font-size:11px;color:#64748b;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{border:1px solid #e2e8f0;padding:6px 10px;text-align:left;font-size:11px}
  th{background:#f8fafc;font-weight:bold;color:#0c2340}
  tr:nth-child(even){background:#f9fafb}
</style></head><body>
<h1>Audit Logs Report</h1>
<div class="meta">Generated: ${new Date().toLocaleString()} ${query.entity ? `| Entity: ${query.entity}` : ""} ${query.action ? `| Action: ${query.action}` : ""}</div>
<table>
<tr><th>Timestamp</th><th>Actor</th><th>Role</th><th>Entity</th><th>Entity ID</th><th>Action</th><th>Description</th><th>IP</th></tr>
${logs.map((l) => `<tr>
  <td>${l.timestamp}</td>
  <td>${l.actorName || l.actorId}</td>
  <td>${l.actorRole || ""}</td>
  <td>${l.entity}</td>
  <td>${l.entityId}</td>
  <td>${l.action}</td>
  <td>${l.description || ""}</td>
  <td>${l.ipAddress || ""}</td>
</tr>`).join("")}
</table></body></html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }
}
