import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { SendMessageDto } from "./dto/send-message.dto";
import { successResponse, ServiceResponse } from "../../common/types/service-response";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async getAllConversations(): Promise<ServiceResponse> {
    const conversations = await this.conversationRepo.find({
      order: { createdAt: "DESC" },
      relations: ["report"],
    });

    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepo.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: "DESC" },
        });
        const unreadCount = await this.messageRepo.count({
          where: { conversationId: conv.id, isRead: false },
        });
        return { ...conv, lastMessage: lastMessage || null, unreadCount };
      })
    );

    return successResponse("Conversations retrieved", enriched);
  }

  async getOrCreateConversation(reportId: string): Promise<ServiceResponse> {
    let conversation = await this.conversationRepo.findOne({
      where: { reportId },
    });

    if (!conversation) {
      conversation = this.conversationRepo.create({ reportId });
      conversation = await this.conversationRepo.save(conversation);
    }

    return successResponse("Conversation retrieved", conversation);
  }

  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<ServiceResponse> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");

    const skip = (page - 1) * limit;
    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: "ASC" },
      skip,
      take: limit,
    });

    return successResponse("Messages retrieved", {
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async sendMessage(dto: SendMessageDto): Promise<Message> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: dto.conversationId },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");

    const message = this.messageRepo.create({
      conversationId: dto.conversationId,
      senderId: dto.senderId || "system",
      senderType: dto.senderType,
      senderName: dto.senderName,
      content: dto.content,
    });

    return this.messageRepo.save(message);
  }

  async markAsRead(conversationId: string, readerId?: string, readerName?: string): Promise<ServiceResponse> {
    const unreadMessages = await this.messageRepo.find({
      where: { conversationId, isRead: false },
    });

    const now = new Date();
    for (const msg of unreadMessages) {
      if (readerId && msg.senderId !== readerId) {
        const alreadyRead = (msg.readBy || []).some((r) => r.userId === readerId);
        if (!alreadyRead) {
          msg.readBy = [...(msg.readBy || []), { userId: readerId, userName: readerName, readAt: now }];
        }
      }
      msg.isRead = true;
      msg.readAt = now;
    }
    if (unreadMessages.length > 0) {
      await this.messageRepo.save(unreadMessages);
    }

    return successResponse("Messages marked as read");
  }

  async getUnreadCount(conversationId: string): Promise<number> {
    return this.messageRepo.count({
      where: { conversationId, isRead: false },
    });
  }
}
