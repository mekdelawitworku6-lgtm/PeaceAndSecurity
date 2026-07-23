import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from "typeorm";
import { AuditLog } from "./entities/audit-log.entity";
import { AuditAction, UserRole } from "../../common/enums/enums";
import { RequestContext } from "./request-context";

// Entities that should be audited
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
]);

// Sensitive fields to exclude from audit logs
const EXCLUDED_FIELDS = new Set([
  "password",
  "pin",
  "fcmToken",
  "accessToken",
  "refreshToken",
]);

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  private auditRepository: any;

  afterLoad(entity: any) {
    // Store original values for comparison during updates
    if (entity && typeof entity === "object") {
      entity.__originalValues = { ...entity };
    }
  }

  async beforeInsert(event: InsertEvent<any>) {
    const entityName = event.metadata.name;
    if (!AUDITED_ENTITIES.has(entityName)) return;

    const ctx = RequestContext.getStore();
    const entity = event.entity;

    // Extract geo fields if they exist
    const geoFields = this.extractGeoFields(entity);

    const newValues = this.sanitizeValues(entity);

    const auditLog = new AuditLog();
    auditLog.actorId = ctx?.userId || "system";
    auditLog.actorName = ctx?.userName || "System";
    auditLog.actorRole = ctx?.userRole || UserRole.SYSTEM_ADMIN;
    auditLog.ipAddress = ctx?.ipAddress || "unknown";
    auditLog.entity = entityName;
    auditLog.entityId = entity.id || "pending";
    auditLog.action = AuditAction.CREATE;
    auditLog.cityId = geoFields.cityId;
    auditLog.subcityId = geoFields.subcityId;
    auditLog.woredaId = geoFields.woredaId;
    auditLog.newValues = newValues;
    auditLog.description = `Created ${entityName}`;

    // Save asynchronously (non-blocking)
    this.saveAuditLog(auditLog);
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    const entityName = event.metadata.name;
    if (!AUDITED_ENTITIES.has(entityName)) return;

    const ctx = RequestContext.getStore();
    const entity = event.entity;
    const databaseEntity = event.databaseEntity;

    if (!entity || !databaseEntity) return;

    // Compare old and new values
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};
    const changedFields: string[] = [];

    for (const key of Object.keys(entity)) {
      if (key.startsWith("__") || EXCLUDED_FIELDS.has(key)) continue;

      const oldVal = databaseEntity[key];
      const newVal = entity[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        oldValues[key] = oldVal;
        newValues[key] = newVal;
        changedFields.push(key);
      }
    }

    if (changedFields.length === 0) return;

    const geoFields = this.extractGeoFields(entity);

    const auditLog = new AuditLog();
    auditLog.actorId = ctx?.userId || "system";
    auditLog.actorName = ctx?.userName || "System";
    auditLog.actorRole = ctx?.userRole || UserRole.SYSTEM_ADMIN;
    auditLog.ipAddress = ctx?.ipAddress || "unknown";
    auditLog.entity = entityName;
    auditLog.entityId = entity.id || databaseEntity.id;
    auditLog.action = AuditAction.UPDATE;
    auditLog.cityId = geoFields.cityId;
    auditLog.subcityId = geoFields.subcityId;
    auditLog.woredaId = geoFields.woredaId;
    auditLog.oldValues = this.sanitizeValues(oldValues);
    auditLog.newValues = this.sanitizeValues(newValues);
    auditLog.changedFields = changedFields;
    auditLog.description = `Updated ${entityName}: ${changedFields.join(", ")}`;

    this.saveAuditLog(auditLog);
  }

  async beforeRemove(event: RemoveEvent<any>) {
    const entityName = event.metadata.name;
    if (!AUDITED_ENTITIES.has(entityName)) return;

    const ctx = RequestContext.getStore();
    const entity = event.entity;

    if (!entity) return;

    const geoFields = this.extractGeoFields(entity);
    const oldValues = this.sanitizeValues(entity);

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

    this.saveAuditLog(auditLog);
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

  private sanitizeValues(values: any): Record<string, any> {
    if (!values) return null;
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(values)) {
      if (EXCLUDED_FIELDS.has(key) || key.startsWith("__")) continue;
      // Only include serializable values
      try {
        JSON.stringify(value);
        sanitized[key] = value;
      } catch {
        sanitized[key] = "[non-serializable]";
      }
    }
    return sanitized;
  }

  private async saveAuditLog(auditLog: AuditLog) {
    try {
      // Get the audit repository from the connection
      if (!this.auditRepository) {
        const connection = require("typeorm").getConnection();
        this.auditRepository = connection.getRepository(AuditLog);
      }
      await this.auditRepository.save(auditLog);
    } catch (error) {
      console.error("Failed to save audit log:", error);
    }
  }
}
