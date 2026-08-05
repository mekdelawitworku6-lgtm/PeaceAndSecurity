import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "../config";
import {
  pushNotification,
  setUnreadCount,
} from "../store/notificationsSlice";
import {
  onMessage,
  requestConversationsRefresh,
} from "../store/chatSlice";
import { setChatSocket } from "./emit";
import type { AppNotification, Message, PatrolUser } from "../types";

let chatSocket: Socket | null = null;
let notificationSocket: Socket | null = null;
let currentUser: PatrolUser | null = null;
let dispatchFn: ((action: unknown) => unknown) | null = null;

export function setDispatch(fn: (action: unknown) => unknown): void {
  dispatchFn = fn;
}

export function connectSockets(token: string, user: PatrolUser): void {
  disconnectSockets();
  currentUser = user;

  notificationSocket = io(SOCKET_URL, { auth: { token } });
  notificationSocket.on("connect", () => {
    notificationSocket?.emit("authenticate", {
      userId: user.id,
      role: "PATROL",
    });
  });
  notificationSocket.on("notification", (notification: AppNotification) => {
    if (notification) dispatchFn?.(pushNotification(notification));
  });
  notificationSocket.on("unread_count", (payload: { count: number }) => {
    if (payload && typeof payload.count === "number") {
      dispatchFn?.(setUnreadCount(payload.count));
    }
  });

  chatSocket = io(`${SOCKET_URL}/chat`, { auth: { token } });
  setChatSocket(chatSocket);
  chatSocket.on("chat:message", (message: Message) => {
    if (message) dispatchFn?.(onMessage(message));
  });
  chatSocket.on("chat:typing", () => {
    // typing indicator handled by UI via socket subscribe; no global state needed
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
  setChatSocket(null);
  currentUser = null;
}

export function emitAuthenticate(): void {
  if (currentUser) {
    notificationSocket?.emit("authenticate", {
      userId: currentUser.id,
      role: "PATROL",
    });
  }
}
