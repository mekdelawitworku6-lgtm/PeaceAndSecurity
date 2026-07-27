import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { SecurityEvent } from "../../modules/audit/entities/security-event.entity";
import { DataAccessEvent } from "../../modules/audit/entities/data-access-event.entity";
import { AuditLog } from "../../modules/audit/entities/audit-log.entity";
import { User } from "../../modules/user/entities/user.entity";
import {
  SecurityEventType,
  DataAccessType,
  AuditAction,
  AuditSource,
  UserRole,
} from "../../common/enums/enums";

@Injectable()
export class AuditSeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedSecurityEvents();
    await this.seedDataAccessEvents();
    await this.seedAuditLogs();
  }

  async seedSecurityEvents() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const repo: Repository<SecurityEvent> = this.dataSource.getRepository(SecurityEvent);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Security events already exist — skipping");
      return;
    }

    const userRepo: Repository<User> = this.dataSource.getRepository(User);
    const admin = await userRepo.findOne({ where: { email: "admin@example.com" } });
    const adminId = admin?.id || "system";
    const adminName = admin?.fullName || "System Admin";

    const events = [
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 168 },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 144 },
      { eventType: SecurityEventType.LOGIN_FAILURE, actorName: "unknown@example.com", actorRole: null, success: false, hoursAgo: 140, reason: "Invalid credentials" },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 120 },
      { eventType: SecurityEventType.PASSWORD_CHANGED, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 100 },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 72 },
      { eventType: SecurityEventType.TOKEN_REFRESH, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 71 },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 48 },
      { eventType: SecurityEventType.LOGIN_FAILURE, actorName: "attacker@evil.com", actorRole: null, success: false, hoursAgo: 40, reason: "User not found" },
      { eventType: SecurityEventType.LOGIN_FAILURE, actorName: "attacker@evil.com", actorRole: null, success: false, hoursAgo: 39, reason: "User not found" },
      { eventType: SecurityEventType.LOGIN_FAILURE, actorName: "attacker@evil.com", actorRole: null, success: false, hoursAgo: 38, reason: "User not found" },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 24 },
      { eventType: SecurityEventType.OTP_REQUESTED, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 20 },
      { eventType: SecurityEventType.OTP_VERIFIED, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 19 },
      { eventType: SecurityEventType.PASSWORD_RESET_COMPLETED, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 18 },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 12 },
      { eventType: SecurityEventType.TOKEN_REFRESH, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 11 },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 6 },
      { eventType: SecurityEventType.TOKEN_REFRESH, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 5 },
      { eventType: SecurityEventType.LOGIN_SUCCESS, actorName: adminName, actorRole: UserRole.SYSTEM_SUPER_ADMIN, success: true, hoursAgo: 1 },
    ];

    for (const data of events) {
      const event = repo.create({
        timestamp: new Date(Date.now() - data.hoursAgo * 3600000),
        eventType: data.eventType,
        actorId: adminId,
        actorName: data.actorName,
        actorRole: data.actorRole,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
        source: AuditSource.WEB,
        targetUserId: adminId,
        targetUserName: adminName,
        success: data.success,
        reason: data.reason || null,
      });
      await repo.save(event);
    }

    console.log("✔ Seeded 20 security events");
  }

  async seedDataAccessEvents() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const repo: Repository<DataAccessEvent> = this.dataSource.getRepository(DataAccessEvent);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Data access events already exist — skipping");
      return;
    }

    const userRepo: Repository<User> = this.dataSource.getRepository(User);
    const admin = await userRepo.findOne({ where: { email: "admin@example.com" } });
    const adminId = admin?.id || "system";
    const adminName = admin?.fullName || "System Admin";

    const events = [
      { accessType: DataAccessType.VIEW_DASHBOARD_STATS, targetEntity: "Dashboard", description: "Viewed dashboard statistics", hoursAgo: 168 },
      { accessType: DataAccessType.VIEW_REPORT_LIST, targetEntity: "Report", description: "Viewed all reports list", hoursAgo: 167 },
      { accessType: DataAccessType.VIEW_REPORT_DETAIL, targetEntity: "Report", targetId: "rpt-001", description: "Viewed report detail", hoursAgo: 166 },
      { accessType: DataAccessType.VIEW_USER_LIST, targetEntity: "User", description: "Viewed all users list", hoursAgo: 160 },
      { accessType: DataAccessType.VIEW_CITIZEN_LIST, targetEntity: "Citizen", description: "Viewed all citizens list", hoursAgo: 150 },
      { accessType: DataAccessType.VIEW_CITIZEN_PROFILE, targetEntity: "Citizen", targetId: "cit-001", description: "Viewed citizen profile", hoursAgo: 149 },
      { accessType: DataAccessType.VIEW_PATROL_LIST, targetEntity: "Patrol", description: "Viewed all patrol officers list", hoursAgo: 140 },
      { accessType: DataAccessType.VIEW_PATROL_TEAM_LIST, targetEntity: "PatrolTeam", description: "Viewed all patrol teams list", hoursAgo: 130 },
      { accessType: DataAccessType.VIEW_CONVERSATION_LIST, targetEntity: "Conversation", description: "Viewed all conversations", hoursAgo: 120 },
      { accessType: DataAccessType.VIEW_CONVERSATION_MESSAGES, targetEntity: "Conversation", targetId: "conv-001", description: "Viewed messages in conversation", hoursAgo: 119 },
      { accessType: DataAccessType.VIEW_REPORT_LIST, targetEntity: "Report", description: "Viewed all reports list", hoursAgo: 100 },
      { accessType: DataAccessType.EXPORT_CSV, targetEntity: "AuditLog", description: "Exported audit logs to CSV", hoursAgo: 90 },
      { accessType: DataAccessType.VIEW_AUDIT_LOGS, targetEntity: "AuditLog", description: "Viewed audit logs", hoursAgo: 80 },
      { accessType: DataAccessType.VIEW_DASHBOARD_STATS, targetEntity: "Dashboard", description: "Viewed dashboard statistics", hoursAgo: 72 },
      { accessType: DataAccessType.VIEW_REPORT_LIST, targetEntity: "Report", description: "Viewed all reports list", hoursAgo: 60 },
      { accessType: DataAccessType.VIEW_REPORT_DETAIL, targetEntity: "Report", targetId: "rpt-002", description: "Viewed report detail", hoursAgo: 59 },
      { accessType: DataAccessType.VIEW_USER_LIST, targetEntity: "User", description: "Viewed all users list", hoursAgo: 48 },
      { accessType: DataAccessType.VIEW_CITIZEN_LIST, targetEntity: "Citizen", description: "Viewed all citizens list", hoursAgo: 36 },
      { accessType: DataAccessType.VIEW_CONVERSATION_LIST, targetEntity: "Conversation", description: "Viewed all conversations", hoursAgo: 24 },
      { accessType: DataAccessType.VIEW_CONVERSATION_MESSAGES, targetEntity: "Conversation", targetId: "conv-002", description: "Viewed messages in conversation", hoursAgo: 23 },
      { accessType: DataAccessType.VIEW_PATROL_LIST, targetEntity: "Patrol", description: "Viewed all patrol officers list", hoursAgo: 12 },
      { accessType: DataAccessType.VIEW_DASHBOARD_STATS, targetEntity: "Dashboard", description: "Viewed dashboard statistics", hoursAgo: 6 },
      { accessType: DataAccessType.VIEW_AUDIT_LOGS, targetEntity: "AuditLog", description: "Viewed audit logs", hoursAgo: 3 },
      { accessType: DataAccessType.EXPORT_PDF, targetEntity: "AuditLog", description: "Exported audit logs to PDF", hoursAgo: 2 },
      { accessType: DataAccessType.VIEW_REPORT_LIST, targetEntity: "Report", description: "Viewed all reports list", hoursAgo: 1 },
    ];

    for (const data of events) {
      const event = repo.create({
        timestamp: new Date(Date.now() - data.hoursAgo * 3600000),
        accessType: data.accessType,
        actorId: adminId,
        actorName: adminName,
        actorRole: UserRole.SYSTEM_SUPER_ADMIN,
        ipAddress: "192.168.1.100",
        source: AuditSource.WEB,
        targetEntity: data.targetEntity,
        targetId: data.targetId || null,
        accessPath: `/api/${data.targetEntity.toLowerCase()}s`,
        description: data.description,
      });
      await repo.save(event);
    }

    console.log("✔ Seeded 25 data access events");
  }

  async seedAuditLogs() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const repo: Repository<AuditLog> = this.dataSource.getRepository(AuditLog);
    const existing = await repo.count();
    if (existing > 0) {
      console.log("• Audit logs already exist — skipping");
      return;
    }

    const userRepo: Repository<User> = this.dataSource.getRepository(User);
    const admin = await userRepo.findOne({ where: { email: "admin@example.com" } });
    const adminId = admin?.id || "system";
    const adminName = admin?.fullName || "System Admin";

    const logs = [
      { entity: "ReportType", action: AuditAction.CREATE, entityId: "rpt-001", description: "Created report type: Noise Complaint", hoursAgo: 168 },
      { entity: "ReportType", action: AuditAction.CREATE, entityId: "rpt-002", description: "Created report type: Littering", hoursAgo: 167 },
      { entity: "ReportType", action: AuditAction.CREATE, entityId: "rpt-003", description: "Created report type: Vandalism", hoursAgo: 166 },
      { entity: "City", action: AuditAction.CREATE, entityId: "city-001", description: "Created city: Addis Ababa", hoursAgo: 160 },
      { entity: "Subcity", action: AuditAction.CREATE, entityId: "sub-001", description: "Created subcity: Bole", hoursAgo: 155 },
      { entity: "Woreda", action: AuditAction.CREATE, entityId: "wor-001", description: "Created woreda: Woreda 03", hoursAgo: 150 },
      { entity: "User", action: AuditAction.CREATE, entityId: "usr-001", description: "Registered patrol officer: Sgt. Tadesse", hoursAgo: 140 },
      { entity: "User", action: AuditAction.CREATE, entityId: "usr-002", description: "Registered patrol officer: Officer Fatuma", hoursAgo: 139 },
      { entity: "PatrolTeam", action: AuditAction.CREATE, entityId: "team-001", description: "Created patrol team: Alpha Team", hoursAgo: 130 },
      { entity: "Citizen", action: AuditAction.CREATE, entityId: "cit-001", description: "Registered citizen: Abebe Kebede", hoursAgo: 120 },
      { entity: "Citizen", action: AuditAction.CREATE, entityId: "cit-002", description: "Registered citizen: Hiwot Tesfaye", hoursAgo: 119 },
      { entity: "Report", action: AuditAction.CREATE, entityId: "rep-001", description: "Citizen submitted report: Noise", hoursAgo: 110 },
      { entity: "Report", action: AuditAction.UPDATE, entityId: "rep-001", description: "Report assigned to patrol", hoursAgo: 105, oldValues: { status: "PENDING" }, newValues: { status: "ASSIGNED" } },
      { entity: "User", action: AuditAction.UPDATE, entityId: "usr-001", description: "Toggled patrol officer status to active", hoursAgo: 100 },
      { entity: "Report", action: AuditAction.UPDATE, entityId: "rep-001", description: "Patrol accepted report", hoursAgo: 95, oldValues: { status: "ASSIGNED" }, newValues: { status: "IN_PROGRESS" } },
      { entity: "Report", action: AuditAction.UPDATE, entityId: "rep-001", description: "Report closed by patrol", hoursAgo: 70, oldValues: { status: "IN_PROGRESS" }, newValues: { status: "CLOSED" } },
      { entity: "ReportType", action: AuditAction.UPDATE, entityId: "rpt-001", description: "Updated noise thresholds", hoursAgo: 60, oldValues: { residentialThreshold: 40 }, newValues: { residentialThreshold: 45 } },
      { entity: "City", action: AuditAction.UPDATE, entityId: "city-001", description: "Updated city name", hoursAgo: 50, oldValues: { name: "Addis" }, newValues: { name: "Addis Ababa" } },
      { entity: "Camera", action: AuditAction.CREATE, entityId: "cam-001", description: "Registered camera: Bole Road Camera", hoursAgo: 40 },
      { entity: "Camera", action: AuditAction.UPDATE, entityId: "cam-001", description: "Updated camera status to active", hoursAgo: 35, oldValues: { status: "INACTIVE" }, newValues: { status: "ACTIVE" } },
      { entity: "Citizen", action: AuditAction.UPDATE, entityId: "cit-001", description: "Updated citizen profile", hoursAgo: 30, oldValues: { phoneVerified: false }, newValues: { phoneVerified: true } },
      { entity: "User", action: AuditAction.UPDATE, entityId: "usr-002", description: "Changed user role", hoursAgo: 25, oldValues: { role: "PATROL_OFFICER" }, newValues: { role: "PEACE_OFFICER_WOREDA" } },
      { entity: "PatrolTeam", action: AuditAction.UPDATE, entityId: "team-001", description: "Added member to patrol team", hoursAgo: 20 },
      { entity: "Setting", action: AuditAction.UPDATE, entityId: "set-001", description: "Updated system settings", hoursAgo: 15, oldValues: { maintenanceMode: false }, newValues: { maintenanceMode: false } },
      { entity: "Report", action: AuditAction.CREATE, entityId: "rep-002", description: "Citizen submitted report: Littering", hoursAgo: 10 },
      { entity: "Report", action: AuditAction.UPDATE, entityId: "rep-002", description: "Report assigned to patrol", hoursAgo: 8, oldValues: { status: "PENDING" }, newValues: { status: "ASSIGNED" } },
      { entity: "City", action: AuditAction.DELETE, entityId: "city-del-001", description: "Deleted city (soft delete)", hoursAgo: 5 },
      { entity: "Report", action: AuditAction.UPDATE, entityId: "rep-002", description: "Report escalated to supervisor", hoursAgo: 3, oldValues: { priority: "NORMAL" }, newValues: { priority: "HIGH" } },
      { entity: "User", action: AuditAction.UPDATE, entityId: "usr-001", description: "Updated patrol officer location", hoursAgo: 2 },
      { entity: "PatrolTeam", action: AuditAction.DELETE, entityId: "team-del-001", description: "Deleted patrol team (soft delete)", hoursAgo: 1 },
    ];

    for (const data of logs) {
      const log = repo.create({
        timestamp: new Date(Date.now() - data.hoursAgo * 3600000),
        entity: data.entity,
        entityId: data.entityId,
        action: data.action,
        actorId: adminId,
        actorName: adminName,
        actorRole: UserRole.SYSTEM_SUPER_ADMIN,
        ipAddress: "192.168.1.100",
        source: AuditSource.WEB,
        description: data.description,
        oldValues: data.oldValues || null,
        newValues: data.newValues || null,
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        recordHash: "",
      });
      await repo.save(log);
    }

    console.log("✔ Seeded 30 audit log entries");
  }
}
