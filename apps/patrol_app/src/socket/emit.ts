import type { Socket } from "socket.io-client";

let chatSocket: Socket | null = null;

export function setChatSocket(socket: Socket | null): void {
  chatSocket = socket;
}

export function getChatSocket(): Socket | null {
  return chatSocket;
}

export function isChatConnected(): boolean {
  return !!chatSocket?.connected;
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

export function emitChatRead(conversationId: string, readerId?: string, readerName?: string): void {
  chatSocket?.emit("chat:read", { conversationId, readerId, readerName });
}
