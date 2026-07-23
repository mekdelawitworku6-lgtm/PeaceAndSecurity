import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  reportId: string;

  @ManyToOne("Report", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "reportId" })
  report: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
