import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { UserRole, UserStatus } from "../../../common/enums/enums";
import { BaseEntity } from "../../../common/baseentity/base.entity";

/**
 * User entity — stored in the `users` table.
 * Represents DASHBOARD users: admins, peace officers, and police commanders.
 * Patrol officers → patrols table (Patrol entity)
 * Citizen app users → citizens table (Citizen entity)
 */
@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, nullable: true })
  userCode: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: false })
  isPasswordSet: boolean;

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ default: 0 })
  tokenVersion: number;

  @Column({ nullable: true })
  profileImage: string;

  @Column("text", { array: true, default: () => "ARRAY[]::text[]" })
  permissions: string[];

  /** True for staff / admin users */
  @Column({ default: false })
  isStaffUser: boolean;

  @Column({ nullable: true })
  fcmToken: string;

  // ─── Geographic Hierarchy ─────────────────────────────────

  /** City this user belongs to (for PEACE_SUPER_ADMIN, POLICE_COMMANDER_CITY) */
  @Column({ nullable: true })
  cityId: string;

  /** Subcity this user belongs to (for PEACE_OFFICER_SUBCITY, POLICE_COMMANDER_SUBCITY) */
  @Column({ nullable: true })
  subcityId: string;

  /** Woreda this user belongs to (for PEACE_OFFICER_WOREDA, POLICE_COMMANDER_WOREDA) */
  @Column({ nullable: true })
  woredaId: string;

  /** Who created this user */
  @Column({ nullable: true })
  createdByUserId: string;
}
