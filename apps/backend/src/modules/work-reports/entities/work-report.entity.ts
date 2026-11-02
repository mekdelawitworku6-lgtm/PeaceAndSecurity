import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { BaseEntity } from "../../../common/baseentity/base.entity";
import { WorkReportStatus } from "../../../common/enums/enums";

@Entity("work_reports")
export class WorkReport extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  reporterId: string;

  @Index()
  @Column()
  reporterRole: string;

  @Column({ nullable: true })
  reporterName: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "date", nullable: true })
  reportDate: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({
    type: "enum",
    enum: WorkReportStatus,
    default: WorkReportStatus.SUBMITTED,
  })
  status: WorkReportStatus;

  @Column({ nullable: true })
  reviewedById: string;

  @Column({ type: "timestamptz", nullable: true })
  reviewedAt: Date;

  @Column({ type: "text", nullable: true })
  reviewNote: string;

  @Index()
  @Column({ nullable: true })
  cityId: string;

  @Index()
  @Column({ nullable: true })
  subcityId: string;

  @Index()
  @Column({ nullable: true })
  woredaId: string;
}
