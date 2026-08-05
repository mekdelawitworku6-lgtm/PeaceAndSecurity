import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  fetchConversationsApi,
  fetchMessagesApi,
  markConversationReadApi,
  sendMessageApi,
} from "../api/chat";
import { handleError } from "../api/client";
import { selectUser } from "./authSlice";
import type { RootState } from "./index";
import { sendChatMessage } from "../socket/emit";
import type { Conversation, Message, MessagesResponse } from "../types";

export interface ChatState {
  conversations: Conversation[];
  messagesByConv: Record<string, Message[]>;
  activeConversation: string | null;
  loading: boolean;
  error: string | null;
  refreshTick: number;
}

const initialState: ChatState = {
  conversations: [],
  messagesByConv: {},
  activeConversation: null,
  loading: false,
  error: null,
  refreshTick: 0,
};

export const fetchConversations = createAsyncThunk<
  Conversation[],
  void,
  { rejectValue: string }
>("chat/fetchConversations", async (_, { rejectWithValue }) => {
  try {
    return await fetchConversationsApi();
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const fetchMessages = createAsyncThunk<
  MessagesResponse,
  string,
  { rejectValue: string }
>("chat/fetchMessages", async (conversationId, { rejectWithValue }) => {
  try {
    return await fetchMessagesApi(conversationId);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const markRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("chat/markRead", async (conversationId, { rejectWithValue }) => {
  try {
    await markConversationReadApi(conversationId);
    return conversationId;
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export interface SendMessageThunkPayload {
  conversationId: string;
  content: string;
}

export const sendMessage = createAsyncThunk<
  { viaSocket: boolean; message: Message | null },
  SendMessageThunkPayload,
  { rejectValue: string }
>(
  "chat/sendMessage",
  async ({ conversationId, content }, { getState, rejectWithValue }) => {
    const user = selectUser(getState() as RootState);
    const senderName = user?.fullName;
    const sent = sendChatMessage({
      conversationId,
      content,
      senderType: "patrol",
      senderId: user?.id,
      senderName,
    });
    if (sent) {
      return { viaSocket: true, message: null };
    }
    try {
      const message = await sendMessageApi(conversationId, {
        content,
        senderType: "patrol",
        senderName,
      });
      return { viaSocket: false, message };
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

function bumpConversation(state: ChatState, message: Message) {
  state.conversations = state.conversations
    .map((c) =>
      c.id === message.conversationId
        ? { ...c, lastMessage: message, updatedAt: message.createdAt }
        : c,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
    );
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    onMessage(state, action: PayloadAction<Message>) {
      const message = action.payload;
      const list = state.messagesByConv[message.conversationId] ?? [];
      if (!list.some((m) => m.id === message.id)) {
        state.messagesByConv[message.conversationId] = [...list, message];
      }
      bumpConversation(state, message);
      const isActive = state.activeConversation === message.conversationId;
      if (!isActive) {
        state.conversations = state.conversations.map((c) =>
          c.id === message.conversationId && c.lastMessage
            ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
            : c,
        );
      }
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversation = action.payload;
    },
    onConversationUpdated(state, action: PayloadAction<Conversation>) {
      const conv = action.payload;
      state.conversations = [
        conv,
        ...state.conversations.filter((c) => c.id !== conv.id),
      ];
    },
    requestConversationsRefresh(state) {
      state.refreshTick += 1;
    },
    clearChatError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loading = false;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load conversations";
      })
      .addCase(fetchMessages.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesByConv[action.meta.arg] = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load messages";
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.conversations = state.conversations.map((c) =>
          c.id === id ? { ...c, unreadCount: 0 } : c,
        );
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { conversationId, content } = action.meta.arg;
        const optimistic: Message = {
          id: `pending-${conversationId}-${Date.now()}`,
          conversationId,
          senderType: "patrol",
          content,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        const list = state.messagesByConv[conversationId] ?? [];
        state.messagesByConv[conversationId] = [...list, optimistic];
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { viaSocket, message } = action.payload;
        const list = state.messagesByConv[action.meta.arg.conversationId] ?? [];
        if (viaSocket) {
          state.messagesByConv[action.meta.arg.conversationId] = list.filter(
            (m) => !m.id.startsWith("pending-"),
          );
        } else if (message) {
          state.messagesByConv[action.meta.arg.conversationId] = list.map((m) =>
            m.id.startsWith("pending-") ? message : m,
          );
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to send message";
        const list = state.messagesByConv[action.meta.arg.conversationId] ?? [];
        state.messagesByConv[action.meta.arg.conversationId] = list.filter(
          (m) => !m.id.startsWith("pending-"),
        );
      });
  },
});

export const {
  onMessage,
  setActiveConversation,
  onConversationUpdated,
  requestConversationsRefresh,
  clearChatError,
} = chatSlice.actions;

export const selectConversations = (state: { chat: ChatState }) => state.chat.conversations;
export const selectMessages = (state: { chat: ChatState }, convId: string) =>
  state.chat.messagesByConv[convId] ?? [];
export const selectChatLoading = (state: { chat: ChatState }) => state.chat.loading;
export const selectChatError = (state: { chat: ChatState }) => state.chat.error;
export const selectRefreshTick = (state: { chat: ChatState }) => state.chat.refreshTick;

export default chatSlice.reducer;
