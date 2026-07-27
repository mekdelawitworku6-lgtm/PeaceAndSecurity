import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Conversation } from "./conversation.entity";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation, { nullable: false })
  @JoinColumn({ name: "conversationId" })
  conversation: Conversation;

  @Column()
  senderId: string;

  @Column()
  senderType: string; // "citizen" | "patrol" | "admin"

  @Column({ nullable: true })
  senderName: string;

  @Column("text")
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: "timestamp", nullable: true })
  readAt: Date;

  @Column({ type: "jsonb", default: [] })
  readBy: Array<{ userId: string; userName?: string; readAt: Date }>;

  @CreateDateColumn()
  createdAt: Date;
}
