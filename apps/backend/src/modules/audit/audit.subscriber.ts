import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  EntityManager,
} from "typeorm";
import * as crypto from "crypto";
import { AuditLog } from "./entities/audit-log.entity";
import { AuditAction, UserRole } from "../../common/enums/enums";
import { RequestContext } from "./request-context";

const AUDITED_ENTITIES = new Set([
  "User",
  "Report",
  "Patrol",
  "PatrolTeam",
  "City",
  "Subcity",
  "Woreda",
  "Camera",
  "ReportType",
  "Citizen",
  "Message",
  "Conversation",
  "Setting",
  "Notification",
  "ReportLog",
  "CameraAlert",
  "PatrolTeamMember",
]);

const EXCLUDED_FIELDS = new Set([
  "password",
  "pin",
  "fcmToken",
  "accessToken",
  "refreshToken",
  "registrationToken",
  "passwordResetToken",
  "otpCode",
  "otp",
  "__originalValues",
  "createdAt",
  "updatedAt",
]);

const AUDIT_REDACTED_FIELDS = new Set([
  "pin",
  "password",
  "otpCode",
  "otp",
  "fcmToken",
  "accessToken",
  "refreshToken",
  "registrationToken",
  "passwordResetToken",
]);

function computeRecordHash(id: string, timestamp: Date, entity: string, entityId: string, action: string, actorId: string, previousHash: string): string {
  const data = `${id || ""}|${timestamp?.toISOString() || ""}|${entity}|${entityId}|${action}|${actorId}|${previousHash}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  afterLoad(entity: any) {
    if (entity && typeof entity === "object") {
      entity.__originalValues = { ...entity };
    }
  }

  async afterInsert(event: InsertEvent<any>) {
    const entityName = event.metadata.name;
    if (!AUDITED_ENTITIES.has(entityName)) return;

    const ctx = RequestContext.getStore();
    const entity = event.entity;
    const geoFields = this.extractGeoFields(entity);
    const newValues = this.sanitizeValues(entity);

    const auditLog = new AuditLog();
    if (ctx?.userId) {
      auditLog.actorId = ctx.userId;
      auditLog.actorName = ctx.userName || "System";
      auditLog.actorRole = ctx.userRole || UserRole.SYSTEM_ADMIN;
    } else if (entityName === "Message") {
      auditLog.actorId = entity.senderId || "system";
      auditLog.actorName = entity.senderName || (entity.senderType === "citizen" ? "Citizen" : (entity.senderType === "patrol" ? "Patrol Officer" : "System"));
      auditLog.actorRole = entity.senderType === "citizen" ? UserRole.CITIZEN : (entity.senderType === "patrol" ? UserRole.PATROL : UserRole.SYSTEM_ADMIN);
    } else if (entityName === "Report") {
      auditLog.actorId = entity.reporterId || "anonymous";
      auditLog.actorName = entity.reporterPhoneNumber || (entity.isAnonymous ? "Anonymous Citizen" : "Citizen");
      auditLog.actorRole = UserRole.CITIZEN;
    } else {
      auditLog.actorId = "system";
      auditLog.actorName = "System";
      auditLog.actorRole = UserRole.SYSTEM_ADMIN;
    }
    auditLog.ipAddress = ctx?.ipAddress || "unknown";
    auditLog.entity = entityName;
    auditLog.entityId = entity.id;
    auditLog.action = AuditAction.CREATE;
    auditLog.cityId = geoFields.cityId;
    auditLog.subcityId = geoFields.subcityId;
    auditLog.woredaId = geoFields.woredaId;
    auditLog.newValues = newValues;
    auditLog.description = `Created ${entityName}`;

    // Request correlation
    auditLog.requestId = ctx?.requestId;
    auditLog.source = ctx?.source || "SYSTEM" as any;
    auditLog.requestMethod = ctx?.requestMethod;
    auditLog.requestPath = ctx?.requestPath;
    auditLog.userAgent = ctx?.userAgent;
    auditLog.deviceId = ctx?.deviceId;
    auditLog.devicePlatform = ctx?.devicePlatform;
    auditLog.appVersion = ctx?.appVersion;
    auditLog.sessionId = ctx?.sessionId;

    // Hash chain
    const previousHash = await this.getLastHash(event.manager);
    auditLog.previousHash = previousHash;
    auditLog.recordHash = computeRecordHash(
      auditLog.id, auditLog.timestamp, auditLog.entity, auditLog.entityId,
      auditLog.action, auditLog.actorId, previousHash,
    );

    await this.persistAuditLog(event.manager, auditLog);
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    const entityName = event.metadata.name;
    if (!AUDITED_ENTITIES.has(entityName)) return;

    const ctx = RequestContext.getStore();
    const entity = event.entity;
    const databaseEntity = event.databaseEntity;

    if (!entity || !databaseEntity) return;

    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};
    const changedFields: string[] = [];

    // Use entity columns from metadata for reliable field comparison
    const columns = event.metadata.columns.map(c => c.propertyName);

    for (const key of columns) {
      if (EXCLUDED_FIELDS.has(key)) continue;

      const oldVal = databaseEntity[key];
      const newVal = entity[key];

      // Deep comparison using JSON stringify
      const oldJson = JSON.stringify(oldVal);
      const newJson = JSON.stringify(newVal);

      if (oldJson !== newJson) {
        oldValues[key] = oldVal;
        newValues[key] = newVal;
        changedFields.push(key);
      }
    }

    if (changedFields.length === 0) return;

    const isSoftDelete =
      changedFields.includes("deletedAt") &&
      !oldValues.deletedAt &&
      newValues.deletedAt;

    const geoFields = this.extractGeoFields(entity);

    const auditLog = new AuditLog();
    auditLog.actorId = ctx?.userId || "system";
    auditLog.actorName = ctx?.userName || "System";
    auditLog.actorRole = ctx?.userRole || UserRole.SYSTEM_ADMIN;
    auditLog.ipAddress = ctx?.ipAddress || "unknown";
    auditLog.entity = entityName;
    auditLog.entityId = entity.id || databaseEntity.id;

    if (isSoftDelete) {
      auditLog.action = AuditAction.DELETE;
      auditLog.oldValues = { deletedAt: null };
      auditLog.newValues = { deletedAt: newValues.deletedAt };
      auditLog.description = `Deleted ${entityName} (soft delete)`;
    } else {
      auditLog.action = AuditAction.UPDATE;
      auditLog.oldValues = this.redactSensitiveFields(this.sanitizeValues(oldValues));
      auditLog.newValues = this.redactSensitiveFields(this.sanitizeValues(newValues));
      auditLog.changedFields = changedFields.filter(f => f !== "deletedAt" && f !== "updatedAt");
      auditLog.description = `Updated ${entityName}: ${auditLog.changedFields.join(", ")}`;
    }

    auditLog.cityId = geoFields.cityId;
    auditLog.subcityId = geoFields.subcityId;
    auditLog.woredaId = geoFields.woredaId;

    // Request correlation
    auditLog.requestId = ctx?.requestId;
    auditLog.source = ctx?.source || "SYSTEM" as any;
    auditLog.requestMethod = ctx?.requestMethod;
    auditLog.requestPath = ctx?.requestPath;
    auditLog.userAgent = ctx?.userAgent;
    auditLog.deviceId = ctx?.deviceId;
    auditLog.devicePlatform = ctx?.devicePlatform;
    auditLog.appVersion = ctx?.appVersion;
    auditLog.sessionId = ctx?.sessionId;

    // Hash chain
    const previousHash = await this.getLastHash(event.manager);
    auditLog.previousHash = previousHash;
    auditLog.recordHash = computeRecordHash(
      auditLog.id, auditLog.timestamp, auditLog.entity, auditLog.entityId,
      auditLog.action, auditLog.actorId, previousHash,
    );

    await this.persistAuditLog(event.manager, auditLog);
  }

  async beforeRemove(event: RemoveEvent<any>) {
    const entityName = event.metadata.name;
    if (!AUDITED_ENTITIES.has(entityName)) return;

    const ctx = RequestContext.getStore();
    const entity = event.entity;

    if (!entity) return;

    const geoFields = this.extractGeoFields(entity);
    const oldValues = this.redactSensitiveFields(this.sanitizeValues(entity));

    const auditLog = new AuditLog();
    auditLog.actorId = ctx?.userId || "system";
    auditLog.actorName = ctx?.userName || "System";
    auditLog.actorRole = ctx?.userRole || UserRole.SYSTEM_ADMIN;
    auditLog.ipAddress = ctx?.ipAddress || "unknown";
    auditLog.entity = entityName;
    auditLog.entityId = entity.id;
    auditLog.action = AuditAction.DELETE;
    auditLog.cityId = geoFields.cityId;
    auditLog.subcityId = geoFields.subcityId;
    auditLog.woredaId = geoFields.woredaId;
    auditLog.oldValues = oldValues;
    auditLog.description = `Deleted ${entityName}`;

    // Request correlation
    auditLog.requestId = ctx?.requestId;
    auditLog.source = ctx?.source || "SYSTEM" as any;
    auditLog.requestMethod = ctx?.requestMethod;
    auditLog.requestPath = ctx?.requestPath;
    auditLog.userAgent = ctx?.userAgent;
    auditLog.deviceId = ctx?.deviceId;
    auditLog.devicePlatform = ctx?.devicePlatform;
    auditLog.appVersion = ctx?.appVersion;
    auditLog.sessionId = ctx?.sessionId;

    // Hash chain
    const previousHash = await this.getLastHash(event.manager);
    auditLog.previousHash = previousHash;
    auditLog.recordHash = computeRecordHash(
      auditLog.id, auditLog.timestamp, auditLog.entity, auditLog.entityId,
      auditLog.action, auditLog.actorId, previousHash,
    );

    await this.persistAuditLog(event.manager, auditLog);
  }

  private async getLastHash(manager: EntityManager): Promise<string | null> {
    try {
      const repo = manager.getRepository(AuditLog);
      const last = await repo.findOne({ order: { timestamp: "DESC", id: "DESC" } });
      return last?.recordHash || null;
    } catch {
      return null;
    }
  }

  private extractGeoFields(entity: any): {
    cityId?: string;
    subcityId?: string;
    woredaId?: string;
  } {
    return {
      cityId: entity.cityId,
      subcityId: entity.subcityId,
      woredaId: entity.woredaId,
    };
  }

  private redactSensitiveFields(values: Record<string, any> | null): Record<string, any> | null {
    if (!values) return null;
    const redacted = { ...values };
    for (const key of Object.keys(redacted)) {
      if (AUDIT_REDACTED_FIELDS.has(key)) {
        redacted[key] = "[REDACTED]";
      }
    }
    return redacted;
  }

  private sanitizeValues(values: any): Record<string, any> {
    if (!values) return null;
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(values)) {
      if (EXCLUDED_FIELDS.has(key) || key.startsWith("__")) continue;
      try {
        JSON.stringify(value);
        sanitized[key] = value;
      } catch {
        sanitized[key] = "[non-serializable]";
      }
    }
    return sanitized;
  }

  private async persistAuditLog(manager: EntityManager, auditLog: AuditLog) {
    try {
      const repo = manager.getRepository(AuditLog);
      await repo.save(auditLog);
    } catch (error) {
      console.error("[AuditSubscriber] Failed to save audit log:", error);
    }
  }
}
