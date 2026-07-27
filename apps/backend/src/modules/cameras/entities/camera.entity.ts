import {
  Entity,
  Column,
} from "typeorm";
import { BaseEntity } from "../../../common/baseentity/base.entity";

@Entity("cameras")
export class Camera extends BaseEntity {
  @Column({ unique: true })
  cameraId: string; // Hardware ID or similar

  @Column()
  locationName: string;

  @Column("decimal", { precision: 10, scale: 7 })
  latitude: number;

  @Column("decimal", { precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  streamUrl: string; // RTSP or HLS URL

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata: any; // Additional camera info
}
