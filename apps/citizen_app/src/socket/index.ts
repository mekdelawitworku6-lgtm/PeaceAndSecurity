/**
 * Socket stub for mock mode — no real WebSocket connections.
 * All exports are safe no-ops to keep the rest of the code compiling.
 */

export function setDispatch(_fn: (action: unknown) => unknown): void {}

export function connectSockets(_token: string, _user: unknown): void {}

export function disconnectSockets(): void {}

export function emitAuthenticate(): void {}

export function joinConversation(_conversationId: string): void {}

export function leaveConversation(_conversationId: string): void {}

export interface SendChatSocketPayload {
  conversationId: string;
  content: string;
  senderType: "citizen" | "patrol" | "admin";
  senderId?: string;
  senderName?: string;
}

export function sendChatMessage(_payload: SendChatSocketPayload): boolean {
  return false;
}

export function emitTyping(_conversationId: string, _isTyping: boolean, _senderName?: string): void {}
