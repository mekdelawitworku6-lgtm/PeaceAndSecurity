import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/baseentity/base.entity";
import { City } from "./city.entity";

@Entity("subcities")
export class Subcity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  cityId: string;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: "cityId" })
  city: City;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ default: true })
  isActive: boolean;
}
