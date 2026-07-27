import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => require("../../modules/user/entities/user.entity").User, {
    nullable: true,
  })
  @JoinColumn({ name: "createdById" })
  createdBy?: import("../../modules/user/entities/user.entity").User;

  @ManyToOne(() => require("../../modules/user/entities/user.entity").User, {
    nullable: true,
  })
  @JoinColumn({ name: "approvedById" })
  approvedBy?: import("../../modules/user/entities/user.entity").User;

  @ManyToOne(() => require("../../modules/user/entities/user.entity").User, {
    nullable: true,
  })
  @JoinColumn({ name: "updatedById" })
  updatedBy?: import("../../modules/user/entities/user.entity").User;
}
