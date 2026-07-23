import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/baseentity/base.entity";
import { Subcity } from "./subcity.entity";

@Entity("woredas")
export class Woreda extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  subcityId: string;

  @ManyToOne(() => Subcity, { nullable: false })
  @JoinColumn({ name: "subcityId" })
  subcity: Subcity;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ default: true })
  isActive: boolean;
}
