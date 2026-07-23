import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Chat client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage("chat:join")
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
    return { event: "chat:joined", data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage("chat:send")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      senderType: string;
      senderId?: string;
      senderName?: string;
    },
  ) {
    const message = await this.chatService.sendMessage({
      conversationId: data.conversationId,
      content: data.content,
      senderType: data.senderType,
      senderId: data.senderId,
      senderName: data.senderName,
    });

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit("chat:message", message);

    return { event: "chat:sent", data: message };
  }

  @SubscribeMessage("chat:typing")
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean; senderName?: string },
  ) {
    client
      .to(`conversation:${data.conversationId}`)
      .emit("chat:typing", data);
  }

  @SubscribeMessage("chat:read")
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await this.chatService.markAsRead(data.conversationId);
    this.server
      .to(`conversation:${data.conversationId}`)
      .emit("chat:read", { conversationId: data.conversationId });
  }

  // Method called from reports service when a report is created
  notifyNewConversation(reportId: string) {
    this.server.emit("chat:conversation_created", { reportId });
  }
}
