import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { SendMessageDto } from "./dto/send-message.dto";
import { successResponse, ServiceResponse } from "../../common/types/service-response";

import { Patrol } from "../patrol/entities/patrol.entity";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { NotificationType } from "../../common/enums/enums";
import { getDistance } from "../../common/utils/geo-util";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Patrol)
    private readonly patrolRepo: Repository<Patrol>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async getAllConversations(
    patrolId?: string,
    citizenId?: string,
  ): Promise<ServiceResponse> {
    const qb = this.conversationRepo
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.report", "report")
      .orderBy("conversation.createdAt", "DESC");

    if (patrolId) {
      qb.where("report.assignedPatrolId = :patrolId", { patrolId });
    } else if (citizenId) {
      qb.where("report.reporterId = :citizenId", { citizenId });
    }

    const conversations = await qb.getMany();

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
      relations: ["report"],
    });
    if (!conversation) throw new NotFoundException("Conversation not found");

    const message = this.messageRepo.create({
      conversationId: dto.conversationId,
      senderId: dto.senderId || "system",
      senderType: dto.senderType,
      senderName: dto.senderName,
      content: dto.content,
    });

    const saved = await this.messageRepo.save(message);

    // Notify all active patrols in 20km radius (and assigned patrol)
    if (dto.senderType === "citizen" && conversation.report) {
      const report = conversation.report;
      const repLat = Number(report.latitude);
      const repLon = Number(report.longitude);

      const activePatrols = await this.patrolRepo.find({
        where: { status: "ACTIVE" as any },
      });

      const notifiedPatrolIds = new Set<string>();
      if (report.assignedPatrolId) {
        notifiedPatrolIds.add(report.assignedPatrolId);
      }

      if (!isNaN(repLat) && !isNaN(repLon) && repLat !== 0 && repLon !== 0) {
        for (const patrol of activePatrols) {
          const pLat = Number(patrol.latitude ?? patrol.officeLatitude);
          const pLon = Number(patrol.longitude ?? patrol.officeLongitude);
          if (isNaN(pLat) || isNaN(pLon)) continue;

          const distKm = getDistance(repLat, repLon, pLat, pLon) / 1000;
          if (distKm <= 20) {
            notifiedPatrolIds.add(patrol.id);
          }
        }
      }

      for (const patrolId of notifiedPatrolIds) {
        const patrol = activePatrols.find((p) => p.id === patrolId);
        this.notificationsGateway.notifyUser(patrolId, "PATROL", {
          title: `New message on case ${report.caseId || "Report"}`,
          message: `${dto.senderName || "Citizen"}: ${dto.content}`,
          type: NotificationType.CHAT_MESSAGE,
          data: {
            conversationId: dto.conversationId,
            reportId: report.id,
            caseId: report.caseId,
          },
          fcmToken: patrol?.fcmToken,
        });
      }
    }

    return saved;
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
