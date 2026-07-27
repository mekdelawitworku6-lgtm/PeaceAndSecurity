import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuditService } from "../audit/audit.service";
import { DataAccessType } from "../../common/enums/enums";

@ApiTags("Chat")
@Controller("chat")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly auditService: AuditService,
  ) {}

  @Get("conversations")
  @ApiOperation({ summary: "Get all conversations" })
  async getAllConversations(@Request() req: any) {
    const result = await this.chatService.getAllConversations();
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_CONVERSATION_LIST,
      targetEntity: "Conversation",
      accessPath: req.originalUrl,
      description: `Listed all conversations`,
    });
    return result;
  }

  @Get("conversations/report/:reportId")
  @ApiOperation({ summary: "Get or create conversation for a report" })
  async getConversation(@Param("reportId") reportId: string, @Request() req: any) {
    const result = await this.chatService.getOrCreateConversation(reportId);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_CONVERSATION_MESSAGES,
      targetEntity: "Conversation",
      targetId: reportId,
      accessPath: req.originalUrl,
      description: `Viewed conversation for report`,
    });
    return result;
  }

  @Get("conversations/:id/messages")
  @ApiOperation({ summary: "Get messages for a conversation" })
  async getMessages(
    @Param("id") id: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Request() req?: any,
  ) {
    const result = await this.chatService.getMessages(id, page || 1, limit || 50);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_CONVERSATION_MESSAGES,
      targetEntity: "Conversation",
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed messages in conversation`,
    });
    return result;
  }

  @Post("conversations/:id/messages")
  @ApiOperation({ summary: "Send a message (REST fallback)" })
  async sendMessage(
    @Param("id") id: string,
    @Body() dto: Omit<SendMessageDto, "conversationId">,
    @Request() req: any,
  ) {
    const message = await this.chatService.sendMessage({
      ...dto,
      conversationId: id,
      senderId: req.user.id,
    });
    return { success: true, data: message };
  }

  @Patch("conversations/:id/read")
  @ApiOperation({ summary: "Mark messages as read" })
  async markAsRead(@Param("id") id: string, @Request() req: any) {
    return this.chatService.markAsRead(id, req.user.id, req.user.fullName || req.user.email);
  }
}
