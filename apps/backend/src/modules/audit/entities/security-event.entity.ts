import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { SecurityEventType, AuditSource, UserRole } from "../../../common/enums/enums";

@Entity("security_events")
@Index(["eventType"])
@Index(["actorId"])
@Index(["timestamp"])
@Index(["targetUserId"])
@Index(["success"])
export class SecurityEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: "enum", enum: SecurityEventType })
  eventType: SecurityEventType;

  // ─── Who performed the action ────────────────────────────

  @Column({ nullable: true })
  actorId: string;

  @Column({ nullable: true })
  actorName: string;

  @Column({ type: "enum", enum: UserRole, nullable: true })
  actorRole: UserRole;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: "enum", enum: AuditSource, default: AuditSource.SYSTEM })
  source: AuditSource;

  // ─── Who was acted upon (if different) ───────────────────

  @Column({ nullable: true })
  targetUserId: string;

  @Column({ nullable: true })
  targetUserName: string;

  // ─── Result ──────────────────────────────────────────────

  @Column({ default: true })
  success: boolean;

  @Column({ type: "text", nullable: true })
  reason: string;

  // ─── Additional context ──────────────────────────────────

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  sessionId: string;

  // ─── Tamper evidence ─────────────────────────────────────

  @Column({ nullable: true })
  previousHash: string;

  @Column({ nullable: true })
  recordHash: string;
}
