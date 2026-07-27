import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Response } from "express";
import * as crypto from "crypto";
import { AuditLog } from "./entities/audit-log.entity";
import { SecurityEvent } from "./entities/security-event.entity";
import { DataAccessEvent } from "./entities/data-access-event.entity";
import {
  SecurityEventType,
  DataAccessType,
  BusinessEventType,
  AuditSource,
  UserRole,
} from "../../common/enums/enums";
import { RequestContext } from "./request-context";
import { successResponse, ServiceResponse } from "../../common/types/service-response";

function computeHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(SecurityEvent)
    private readonly securityEventRepo: Repository<SecurityEvent>,
    @InjectRepository(DataAccessEvent)
    private readonly dataAccessEventRepo: Repository<DataAccessEvent>,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // Security Event Logging
  // ═══════════════════════════════════════════════════════════

  async logSecurityEvent(params: {
    eventType: SecurityEventType;
    actorId?: string;
    actorName?: string;
    actorRole?: UserRole;
    ipAddress?: string;
    userAgent?: string;
    source?: AuditSource;
    targetUserId?: string;
    targetUserName?: string;
    success?: boolean;
    reason?: string;
    metadata?: Record<string, any>;
    sessionId?: string;
  }): Promise<void> {
    try {
      const ctx = RequestContext.getStore();
      const previousHash = await this.getLastSecurityEventHash();

      const event = this.securityEventRepo.create({
        eventType: params.eventType,
        actorId: params.actorId || ctx?.userId || "system",
        actorName: params.actorName || ctx?.userName || "System",
        actorRole: params.actorRole || ctx?.userRole,
        ipAddress: params.ipAddress || ctx?.ipAddress || "unknown",
        userAgent: params.userAgent || ctx?.userAgent,
        source: params.source || ctx?.source || AuditSource.SYSTEM,
        targetUserId: params.targetUserId,
        targetUserName: params.targetUserName,
        success: params.success !== false,
        reason: params.reason,
        metadata: params.metadata,
        sessionId: params.sessionId || ctx?.sessionId,
        previousHash,
        recordHash: computeHash(
          `${params.eventType}|${params.actorId || "system"}|${params.success !== false}|${Date.now()}|${previousHash}`,
        ),
      });

      await this.securityEventRepo.save(event);
    } catch (error) {
      console.error("[AuditService] Failed to log security event:", error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Data Access Event Logging
  // ═══════════════════════════════════════════════════════════

  async logDataAccess(params: {
    accessType: DataAccessType;
    actorId?: string;
    actorName?: string;
    actorRole?: UserRole;
    ipAddress?: string;
    source?: AuditSource;
    targetEntity: string;
    targetId?: string;
    accessPath?: string;
    description?: string;
  }): Promise<void> {
    try {
      const ctx = RequestContext.getStore();
      const previousHash = await this.getLastDataAccessHash();

      const event = this.dataAccessEventRepo.create({
        accessType: params.accessType,
        actorId: params.actorId || ctx?.userId || "system",
        actorName: params.actorName || ctx?.userName || "System",
        actorRole: params.actorRole || ctx?.userRole,
        ipAddress: params.ipAddress || ctx?.ipAddress || "unknown",
        source: params.source || ctx?.source || AuditSource.WEB,
        targetEntity: params.targetEntity,
        targetId: params.targetId,
        accessPath: params.accessPath || ctx?.requestPath,
        description: params.description,
        previousHash,
        recordHash: computeHash(
          `${params.accessType}|${params.targetEntity}|${params.targetId || ""}|${Date.now()}|${previousHash}`,
        ),
      });

      await this.dataAccessEventRepo.save(event);
    } catch (error) {
      console.error("[AuditService] Failed to log data access event:", error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Business Event Logging (appended to audit_logs with description)
  // ═══════════════════════════════════════════════════════════

  async logBusinessEvent(params: {
    eventType: BusinessEventType;
    entity: string;
    entityId: string;
    description: string;
    metadata?: Record<string, any>;
    cityId?: string;
    subcityId?: string;
    woredaId?: string;
  }): Promise<void> {
    try {
      const ctx = RequestContext.getStore();
      const previousHash = await this.getLastHash();

      const auditLog = new AuditLog();
      auditLog.actorId = ctx?.userId || "system";
      auditLog.actorName = ctx?.userName || "System";
      auditLog.actorRole = ctx?.userRole || UserRole.SYSTEM_ADMIN;
      auditLog.ipAddress = ctx?.ipAddress || "unknown";
      auditLog.entity = params.entity;
      auditLog.entityId = params.entityId;
      auditLog.action = "UPDATE" as any;
      auditLog.cityId = params.cityId;
      auditLog.subcityId = params.subcityId;
      auditLog.woredaId = params.woredaId;
      auditLog.description = `[${params.eventType}] ${params.description}`;
      auditLog.newValues = params.metadata || {};
      auditLog.requestId = ctx?.requestId;
      auditLog.source = ctx?.source || AuditSource.SYSTEM;
      auditLog.requestMethod = ctx?.requestMethod;
      auditLog.requestPath = ctx?.requestPath;
      auditLog.userAgent = ctx?.userAgent;
      auditLog.deviceId = ctx?.deviceId;
      auditLog.devicePlatform = ctx?.devicePlatform;
      auditLog.appVersion = ctx?.appVersion;
      auditLog.sessionId = ctx?.sessionId;
      auditLog.previousHash = previousHash;
      auditLog.recordHash = computeHash(
        `BUSINESS|${params.eventType}|${params.entity}|${params.entityId}|${Date.now()}|${previousHash}`,
      );

      await this.auditRepo.save(auditLog);
    } catch (error) {
      console.error("[AuditService] Failed to log business event:", error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Query methods
  // ═══════════════════════════════════════════════════════════

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

  // ─── Security Events queries ──────────────────────────────

  async findSecurityEvents(query: {
    eventType?: string;
    actorId?: string;
    success?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const qb = this.securityEventRepo.createQueryBuilder("se");

    if (query.eventType) qb.andWhere("se.eventType = :eventType", { eventType: query.eventType });
    if (query.actorId) qb.andWhere("se.actorId = :actorId", { actorId: query.actorId });
    if (query.success !== undefined) qb.andWhere("se.success = :success", { success: query.success });
    if (query.startDate) qb.andWhere("se.timestamp >= :startDate", { startDate: query.startDate });
    if (query.endDate) qb.andWhere("se.timestamp <= :endDate", { endDate: query.endDate });

    const [data, total] = await qb
      .orderBy("se.timestamp", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return successResponse("Security events retrieved", {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  // ─── Data Access Events queries ───────────────────────────

  async findDataAccessEvents(query: {
    accessType?: string;
    actorId?: string;
    targetEntity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const qb = this.dataAccessEventRepo.createQueryBuilder("dae");

    if (query.accessType) qb.andWhere("dae.accessType = :accessType", { accessType: query.accessType });
    if (query.actorId) qb.andWhere("dae.actorId = :actorId", { actorId: query.actorId });
    if (query.targetEntity) qb.andWhere("dae.targetEntity = :targetEntity", { targetEntity: query.targetEntity });
    if (query.startDate) qb.andWhere("dae.timestamp >= :startDate", { startDate: query.startDate });
    if (query.endDate) qb.andWhere("dae.timestamp <= :endDate", { endDate: query.endDate });

    const [data, total] = await qb
      .orderBy("dae.timestamp", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return successResponse("Data access events retrieved", {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  // ─── Hash chain verification ──────────────────────────────

  async verifyAuditChain(): Promise<ServiceResponse> {
    const logs = await this.auditRepo.find({ order: { timestamp: "ASC", id: "ASC" } });
    let prevHash = "";
    let broken = false;
    let brokenAt: string | null = null;

    for (const log of logs) {
      if (log.previousHash !== prevHash) {
        broken = true;
        brokenAt = log.id;
        break;
      }
      prevHash = log.recordHash || "";
    }

    return successResponse("Audit chain verification complete", {
      valid: !broken,
      totalRecords: logs.length,
      brokenAt,
    });
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

    const header = "Timestamp,Actor,Role,Entity,Entity ID,Action,Description,IP Address,Source,Request ID\n";
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
        `"${l.source || ""}"`,
        `"${l.requestId || ""}"`,
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
<tr><th>Timestamp</th><th>Actor</th><th>Role</th><th>Entity</th><th>Entity ID</th><th>Action</th><th>Description</th><th>IP</th><th>Source</th><th>Request ID</th></tr>
${logs.map((l) => `<tr>
  <td>${l.timestamp}</td>
  <td>${l.actorName || l.actorId}</td>
  <td>${l.actorRole || ""}</td>
  <td>${l.entity}</td>
  <td>${l.entityId}</td>
  <td>${l.action}</td>
  <td>${l.description || ""}</td>
  <td>${l.ipAddress || ""}</td>
  <td>${l.source || ""}</td>
  <td>${l.requestId || ""}</td>
</tr>`).join("")}
</table></body></html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  // ─── Internal hash helpers ────────────────────────────────

  private async getLastHash(): Promise<string | null> {
    const [last] = await this.auditRepo.find({ order: { timestamp: "DESC", id: "DESC" }, take: 1 });
    return last?.recordHash || null;
  }

  private async getLastSecurityEventHash(): Promise<string | null> {
    const [last] = await this.securityEventRepo.find({ order: { timestamp: "DESC", id: "DESC" }, take: 1 });
    return last?.recordHash || null;
  }

  private async getLastDataAccessHash(): Promise<string | null> {
    const [last] = await this.dataAccessEventRepo.find({ order: { timestamp: "DESC", id: "DESC" }, take: 1 });
    return last?.recordHash || null;
  }
}
