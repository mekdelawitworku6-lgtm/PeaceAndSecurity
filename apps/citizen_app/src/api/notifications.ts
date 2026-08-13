/**
 * Mock notifications API — returns fake data, no backend calls.
 */
import { MOCK_NOTIFICATIONS } from "./mockData";
import type { AppNotification } from "../types";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function fetchNotificationsApi(_limit = 20): Promise<AppNotification[]> {
  await delay();
  return [...MOCK_NOTIFICATIONS];
}

export async function fetchUnreadCountApi(): Promise<number> {
  await delay(100);
  return MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
}

export async function markReadApi(id: string): Promise<void> {
  await delay(100);
  const item = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  if (item) item.isRead = true;
}

export async function markAllReadApi(): Promise<void> {
  await delay(200);
  MOCK_NOTIFICATIONS.forEach((n) => { n.isRead = true; });
}
