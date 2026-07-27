import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { DataAccessType, AuditSource, UserRole } from "../../../common/enums/enums";

@Entity("data_access_events")
@Index(["accessType"])
@Index(["actorId"])
@Index(["timestamp"])
@Index(["targetEntity", "targetId"])
export class DataAccessEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: "enum", enum: DataAccessType })
  accessType: DataAccessType;

  // ─── Who accessed ────────────────────────────────────────

  @Column()
  actorId: string;

  @Column({ nullable: true })
  actorName: string;

  @Column({ type: "enum", enum: UserRole, nullable: true })
  actorRole: UserRole;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: "enum", enum: AuditSource, default: AuditSource.WEB })
  source: AuditSource;

  // ─── What was accessed ───────────────────────────────────

  @Column()
  targetEntity: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ nullable: true })
  accessPath: string;

  @Column({ type: "text", nullable: true })
  description: string;

  // ─── Tamper evidence ─────────────────────────────────────

  @Column({ nullable: true })
  previousHash: string;

  @Column({ nullable: true })
  recordHash: string;
}
