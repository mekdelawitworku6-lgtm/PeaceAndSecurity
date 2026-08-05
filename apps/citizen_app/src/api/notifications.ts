import { client } from "./client";
import type { AppNotification } from "../types";

export async function fetchNotificationsApi(limit = 20): Promise<AppNotification[]> {
  const res = await client.get<AppNotification[]>(`/notifications?limit=${limit}`);
  if (Array.isArray(res.data)) return res.data;
  return ((res.data as { data?: AppNotification[] }).data ?? []);
}

export async function fetchUnreadCountApi(): Promise<number> {
  const res = await client.get<{ count: number }>("/notifications/unread-count");
  return res.data.count ?? 0;
}

export async function markReadApi(id: string): Promise<void> {
  await client.post(`/notifications/${id}/mark-read`);
}

export async function markAllReadApi(): Promise<void> {
  await client.post("/notifications/mark-all-read");
}
