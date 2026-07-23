import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "../../../common/baseentity/base.entity";
import { Patrol } from "./patrol.entity";

@Entity("patrol_teams")
export class PatrolTeam extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column()
  woredaId: string;

  @Column({ nullable: true })
  leaderId: string;

  @ManyToOne(() => Patrol, { nullable: true })
  @JoinColumn({ name: "leaderId" })
  leader: Patrol;

  @ManyToMany(() => Patrol, { eager: true })
  @JoinTable({
    name: "patrol_team_members",
    joinColumn: { name: "teamId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "patrolId", referencedColumnName: "id" },
  })
  members: Patrol[];

  @Column({ default: true })
  isActive: boolean;
}
