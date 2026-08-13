/**
 * Mock chat API — returns fake data, no backend calls.
 */
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "./mockData";
import type { Conversation, Message, MessagesResponse } from "../types";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let msgCounter = MOCK_MESSAGES.length;

export async function fetchConversationsApi(): Promise<Conversation[]> {
  await delay();
  return [...MOCK_CONVERSATIONS];
}

export async function openConversationApi(_reportId: string): Promise<Conversation> {
  await delay();
  return MOCK_CONVERSATIONS[0];
}

export async function fetchMessagesApi(
  _conversationId: string,
  page = 1,
  limit = 50,
): Promise<MessagesResponse> {
  await delay();
  return {
    data: [...MOCK_MESSAGES],
    total: MOCK_MESSAGES.length,
    page,
    limit,
    totalPages: 1,
  };
}

export interface SendMessageApiPayload {
  content: string;
  senderType: "citizen" | "patrol" | "admin";
  senderName?: string;
}

export async function sendMessageApi(
  conversationId: string,
  payload: SendMessageApiPayload,
): Promise<Message> {
  await delay(500);
  msgCounter += 1;
  const msg: Message = {
    id: `m${msgCounter}`,
    conversationId,
    senderId: "citizen1",
    senderType: payload.senderType,
    senderName: payload.senderName ?? "You",
    content: payload.content,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  MOCK_MESSAGES.push(msg);
  return msg;
}

export async function markConversationReadApi(_conversationId: string): Promise<void> {
  await delay(100);
}
