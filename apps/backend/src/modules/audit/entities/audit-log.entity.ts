import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { AuditAction, UserRole } from "../../../common/enums/enums";

@Entity("audit_logs")
@Index(["entity", "entityId"])
@Index(["actorId"])
@Index(["timestamp"])
@Index(["cityId"])
@Index(["subcityId"])
@Index(["woredaId"])
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
}
