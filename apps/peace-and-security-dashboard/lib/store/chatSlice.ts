import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { chatService } from '@/lib/services/chat-service'

interface ChatState {
  conversations: any[]
  messages: any[]
  activeConversationId: string | null
  loading: boolean
  error: string | null
  messagesPage: number
  messagesTotalPages: number
  messagesTotal: number
  messagesLoading: boolean
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  activeConversationId: null,
  loading: false,
  error: null,
  messagesPage: 1,
  messagesTotalPages: 1,
  messagesTotal: 0,
  messagesLoading: false,
}

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    const response = await chatService.getConversations()
    return response.data
  }
)

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, page, limit }: { conversationId: string; page?: number; limit?: number }) => {
    const response = await chatService.getMessages(conversationId, { page: page || 1, limit: limit || 20 })
    return response.data
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, data }: { conversationId: string; data: { content: string } }) => {
    const response = await chatService.sendMessage(conversationId, data)
    return response.data
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload
      state.messages = []
      state.messagesPage = 1
      state.messagesTotalPages = 1
      state.messagesTotal = 0
    },
    addMessage(state, action: PayloadAction<any>) {
      state.messages.push(action.payload)
    },
    resetMessages(state) {
      state.messages = []
      state.messagesPage = 1
      state.messagesTotalPages = 1
      state.messagesTotal = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        const data = action.payload.data || action.payload || []
        state.conversations = Array.isArray(data) ? data : []
      })
      .addCase(fetchConversations.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
      .addCase(fetchMessages.pending, (state) => { state.messagesLoading = true })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false
        const payload = action.payload.data || action.payload
        if (payload?.data) {
          // Paginated response: { data: [...], total, page, totalPages }
          if (action.meta.arg?.page && action.meta.arg.page > 1) {
            // Prepend older messages (load more)
            state.messages = [...payload.data, ...state.messages]
          } else {
            state.messages = payload.data
          }
          state.messagesTotal = payload.total || 0
          state.messagesPage = payload.page || 1
          state.messagesTotalPages = payload.totalPages || 1
        } else if (Array.isArray(payload)) {
          state.messages = payload
          state.messagesTotal = payload.length
          state.messagesTotalPages = 1
          state.messagesPage = 1
        } else {
          state.messages = []
        }
      })
      .addCase(fetchMessages.rejected, (state) => { state.messagesLoading = false })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload.data || action.payload
        if (msg) state.messages.push(msg)
      })
  },
})

export const { setActiveConversation, addMessage, resetMessages } = chatSlice.actions
export const selectConversations = (state: { chat: ChatState }) => state.chat.conversations
export const selectMessages = (state: { chat: ChatState }) => state.chat.messages
export const selectActiveConversationId = (state: { chat: ChatState }) => state.chat.activeConversationId
export const selectChatLoading = (state: { chat: ChatState }) => state.chat.loading
export const selectMessagesPage = (state: { chat: ChatState }) => state.chat.messagesPage
export const selectMessagesTotalPages = (state: { chat: ChatState }) => state.chat.messagesTotalPages
export const selectMessagesTotal = (state: { chat: ChatState }) => state.chat.messagesTotal
export const selectMessagesLoading = (state: { chat: ChatState }) => state.chat.messagesLoading

export default chatSlice.reducer
