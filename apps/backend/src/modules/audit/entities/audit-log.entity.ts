import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { AuditAction, AuditSource, UserRole } from "../../../common/enums/enums";

@Entity("audit_logs")
@Index(["entity", "entityId"])
@Index(["actorId"])
@Index(["timestamp"])
@Index(["cityId"])
@Index(["subcityId"])
@Index(["woredaId"])
@Index(["source"])
@Index(["requestId"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  // ─── Who ─────────────────────────────────────────────────

  @Column()
  actorId: string;

  @Column({ nullable: true })
  actorName: string;

  @Column({ type: "enum", enum: UserRole, nullable: true })
  actorRole: UserRole;

  @Column({ nullable: true })
  ipAddress: string;

  // ─── What ────────────────────────────────────────────────

  @Column()
  entity: string;

  @Column()
  entityId: string;

  @Column({ type: "enum", enum: AuditAction })
  action: AuditAction;

  // ─── Where (geographic scope) ────────────────────────────

  @Column({ nullable: true })
  cityId: string;

  @Column({ nullable: true })
  subcityId: string;

  @Column({ nullable: true })
  woredaId: string;

  // ─── Diff ────────────────────────────────────────────────

  @Column({ type: "jsonb", nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  newValues: Record<string, any>;

  @Column("text", { array: true, nullable: true })
  changedFields: string[];

  // ─── Context ─────────────────────────────────────────────

  @Column({ type: "text", nullable: true })
  description: string;

  // ─── Request correlation ─────────────────────────────────

  @Column({ nullable: true })
  requestId: string;

  @Column({ type: "enum", enum: AuditSource, default: AuditSource.SYSTEM })
  source: AuditSource;

  @Column({ nullable: true })
  requestMethod: string;

  @Column({ nullable: true })
  requestPath: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  devicePlatform: string;

  @Column({ nullable: true })
  appVersion: string;

  @Column({ default: true })
  success: boolean;

  @Column({ nullable: true })
  errorCode: string;

  @Column({ type: "text", nullable: true })
  reason: string;

  @Column({ nullable: true })
  sessionId: string;

  // ─── Tamper evidence (hash chain) ────────────────────────

  @Column({ nullable: true })
  previousHash: string;

  @Column({ nullable: true })
  recordHash: string;
}
