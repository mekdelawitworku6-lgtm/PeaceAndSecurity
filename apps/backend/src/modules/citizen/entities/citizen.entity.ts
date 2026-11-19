import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import { UserStatus, DevicePlatform, VerificationStatus, PreferredLanguage } from "../../../common/enums/enums";
import { BaseEntity } from "../../../common/baseentity/base.entity";


@Entity("citizens")
export class Citizen extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, nullable: true })
  userCode: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  /** Hashed PIN — used for mobile app login. Never exposed in responses. */
  @Column({ nullable: true, select: false })
  pin: string;

  @Column({ default: false })
  isPinSet: boolean;

  @Column({ nullable: true })
  profileImage: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: 0 })
  tokenVersion: number;

  @Column({ nullable: true })
  fcmToken: string;

  // ─── New Fields ─────────────────────────────────────────

  @Column({
    type: "enum",
    enum: PreferredLanguage,
    default: PreferredLanguage.AMHARIC,
  })
  preferredLanguage: PreferredLanguage;

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({
    type: "enum",
    enum: DevicePlatform,
    nullable: true,
  })
  devicePlatform: DevicePlatform;

  @Column({ nullable: true })
  appVersion: string;

  @Column({ nullable: true })
  deviceId: string;
}
