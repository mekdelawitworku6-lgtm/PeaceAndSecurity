import { client } from "./client";
import type { Conversation, Message, MessagesResponse } from "../types";

export async function fetchConversationsApi(): Promise<Conversation[]> {
  const res = await client.get<{ data: Conversation[] }>("/chat/conversations");
  return res.data.data ?? [];
}

export async function openConversationApi(reportId: string): Promise<Conversation> {
  const res = await client.get<{ data: Conversation }>(
    `/chat/conversations/report/${reportId}`,
  );
  return res.data.data;
}

export async function fetchMessagesApi(
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<MessagesResponse> {
  const res = await client.get<{ data: MessagesResponse }>(
    `/chat/conversations/${conversationId}/messages`,
    { params: { page, limit } },
  );
  return res.data.data;
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
  const res = await client.post<{ data: Message }>(
    `/chat/conversations/${conversationId}/messages`,
    payload,
  );
  return res.data.data;
}

export async function markConversationReadApi(conversationId: string): Promise<void> {
  await client.patch(`/chat/conversations/${conversationId}/read`);
}
