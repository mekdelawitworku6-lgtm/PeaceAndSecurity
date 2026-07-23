import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/baseentity/base.entity";

@Entity("cities")
export class City extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ default: true })
  isActive: boolean;
}
