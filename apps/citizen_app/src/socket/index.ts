import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../config";
import {
  pushNotification,
  setUnreadCount,
} from "../store/notificationsSlice";
import {
  onMessage,
  requestConversationsRefresh,
  setTyping,
} from "../store/chatSlice";
import type { AppNotification, Citizen, Message } from "../types";

let chatSocket: Socket | null = null;
let notificationSocket: Socket | null = null;
let currentUser: Citizen | null = null;
let dispatchFn: ((action: unknown) => unknown) | null = null;

export function setDispatch(fn: (action: unknown) => unknown): void {
  dispatchFn = fn;
}

export function connectSockets(token: string, user: Citizen): void {
  disconnectSockets();
  currentUser = user;

  notificationSocket = io(SOCKET_URL, { auth: { token } });
  notificationSocket.on("connect", () => {
    notificationSocket?.emit("authenticate", {
      userId: user.id,
      role: user.role || "CITIZEN",
    });
  });
  notificationSocket.on("notification", (notification: AppNotification) => {
    if (notification) dispatchFn?.(pushNotification(notification));
  });
  notificationSocket.on("unread_count", (payload: { count: number }) => {
    dispatchFn?.(setUnreadCount(payload?.count ?? 0));
  });

  chatSocket = io(`${SOCKET_URL}/chat`, { auth: { token } });
  chatSocket.on("chat:message", (message: Message) => {
    if (message) dispatchFn?.(onMessage(message));
  });
  chatSocket.on("chat:typing", (data: { conversationId: string; isTyping: boolean; senderName?: string }) => {
    if (data?.conversationId) dispatchFn?.(setTyping(data));
  });
  chatSocket.on("chat:conversation_created", () => {
    dispatchFn?.(requestConversationsRefresh());
  });
}

export function disconnectSockets(): void {
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
  }
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
  currentUser = null;
}

export function emitAuthenticate(): void {
  if (currentUser) {
    notificationSocket?.emit("authenticate", {
      userId: currentUser.id,
      role: currentUser.role || "CITIZEN",
    });
  }
}

export function joinConversation(conversationId: string): void {
  chatSocket?.emit("chat:join", { conversationId });
}

export function leaveConversation(conversationId: string): void {
  chatSocket?.emit("chat:leave", { conversationId });
}

export interface SendChatSocketPayload {
  conversationId: string;
  content: string;
  senderType: "citizen" | "patrol" | "admin";
  senderId?: string;
  senderName?: string;
}

export function sendChatMessage(payload: SendChatSocketPayload): boolean {
  if (chatSocket?.connected) {
    chatSocket.emit("chat:send", payload);
    return true;
  }
  return false;
}

export function emitTyping(conversationId: string, isTyping: boolean, senderName?: string): void {
  chatSocket?.emit("chat:typing", { conversationId, isTyping, senderName });
}
