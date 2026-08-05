import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchConversationsApi,
  fetchMessagesApi,
  markConversationReadApi,
  sendMessageApi,
} from "../api/chat";
import { handleError } from "../api/client";
import { sendChatMessage } from "../socket";
import type { Conversation, Message } from "../types";
import type { RootState } from "./index";

export interface TypingInfo {
  isTyping: boolean;
  senderName?: string;
}

export interface ChatState {
  conversations: Conversation[];
  messagesByConv: Record<string, Message[]>;
  activeConversation: string | null;
  loading: boolean;
  sending: boolean;
  error: string | null;
  typing: Record<string, TypingInfo>;
  needsRefresh: boolean;
}

const initialState: ChatState = {
  conversations: [],
  messagesByConv: {},
  activeConversation: null,
  loading: false,
  sending: false,
  error: null,
  typing: {},
  needsRefresh: false,
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
  Message[],
  string,
  { rejectValue: string }
>("chat/fetchMessages", async (conversationId, { rejectWithValue }) => {
  try {
    const res = await fetchMessagesApi(conversationId);
    return res.data;
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export interface SendMessageInput {
  convId: string;
  content: string;
  senderType: "citizen" | "patrol" | "admin";
  senderName?: string;
}

export const sendMessage = createAsyncThunk<
  Message | null,
  SendMessageInput,
  { state: RootState; rejectValue: string }
>("chat/sendMessage", async (input, { dispatch, getState, rejectWithValue }) => {
  const user = getState().auth.user;
  const sent = sendChatMessage({
    conversationId: input.convId,
    content: input.content,
    senderType: input.senderType,
    senderId: user?.id,
    senderName: input.senderName,
  });
  if (sent) return null;
  try {
    const msg = await sendMessageApi(input.convId, {
      content: input.content,
      senderType: input.senderType,
      senderName: input.senderName,
    });
    dispatch(onMessage(msg));
    return msg;
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const markConversationRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("chat/markRead", async (conversationId, { dispatch, rejectWithValue }) => {
  try {
    await markConversationReadApi(conversationId);
    dispatch(markConversationReadLocally({ conversationId }));
    return conversationId;
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    onMessage(state, action: PayloadAction<Message>) {
      const msg = action.payload;
      if (!msg || !msg.id || !msg.conversationId) return;
      const list = state.messagesByConv[msg.conversationId] ?? [];
      if (list.some((m) => m.id === msg.id)) return;
      state.messagesByConv[msg.conversationId] = [...list, msg];

      const conv = state.conversations.find((c) => c.id === msg.conversationId);
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        if (state.activeConversation !== conv.id && !msg.isRead) {
          conv.unreadCount = (conv.unreadCount ?? 0) + 1;
        }
      } else {
        state.needsRefresh = true;
      }
    },
    onConversationUpdated(state, action: PayloadAction<Conversation>) {
      const incoming = action.payload;
      const idx = state.conversations.findIndex((c) => c.id === incoming.id);
      if (idx >= 0) state.conversations[idx] = incoming;
      else state.conversations.unshift(incoming);
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversation = action.payload;
    },
    setTyping(
      state,
      action: PayloadAction<{ conversationId: string; isTyping: boolean; senderName?: string }>,
    ) {
      const { conversationId, isTyping, senderName } = action.payload;
      if (isTyping) state.typing[conversationId] = { isTyping, senderName };
      else delete state.typing[conversationId];
    },
    requestConversationsRefresh(state) {
      state.needsRefresh = true;
    },
    setNeedsRefresh(state, action: PayloadAction<boolean>) {
      state.needsRefresh = action.payload;
    },
    markConversationReadLocally(state, action: PayloadAction<{ conversationId: string }>) {
      const { conversationId } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) conv.unreadCount = 0;
      const msgs = state.messagesByConv[conversationId];
      if (msgs) {
        state.messagesByConv[conversationId] = msgs.map((m) => ({ ...m, isRead: true }));
      }
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
        state.loading = false;
        state.conversations = action.payload;
        state.needsRefresh = false;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load conversations";
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messagesByConv[action.meta.arg] = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load messages";
      })
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.sending = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload ?? "Failed to send message";
      })
      .addCase(markConversationRead.fulfilled, () => {});
  },
});

export const {
  onMessage,
  onConversationUpdated,
  setActiveConversation,
  setTyping,
  requestConversationsRefresh,
  setNeedsRefresh,
  markConversationReadLocally,
  clearChatError,
} = chatSlice.actions;

export const selectConversations = (state: { chat: ChatState }) => state.chat.conversations;
export const selectMessagesByConv = (state: { chat: ChatState }) => state.chat.messagesByConv;
export const selectActiveConversation = (state: { chat: ChatState }) => state.chat.activeConversation;
export const selectChatLoading = (state: { chat: ChatState }) => state.chat.loading;
export const selectChatSending = (state: { chat: ChatState }) => state.chat.sending;
export const selectChatError = (state: { chat: ChatState }) => state.chat.error;
export const selectChatNeedsRefresh = (state: { chat: ChatState }) => state.chat.needsRefresh;
export const selectTyping = (state: { chat: ChatState }) => state.chat.typing;

export default chatSlice.reducer;
