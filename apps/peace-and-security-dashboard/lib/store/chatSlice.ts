import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { chatService } from '@/lib/services/chat-service'

interface ChatState {
  conversations: any[]
  messages: any[]
  activeConversationId: string | null
  loading: boolean
  error: string | null
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  activeConversationId: null,
  loading: false,
  error: null,
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
  async (conversationId: string) => {
    const response = await chatService.getMessages(conversationId)
    return response.data
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, data }: { conversationId: string; data: { content: string; messageType?: string } }) => {
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
    },
    addMessage(state, action: PayloadAction<any>) {
      state.messages.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = action.payload.data || action.payload || []
      })
      .addCase(fetchConversations.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.data || action.payload || []
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.data || action.payload)
      })
  },
})

export const { setActiveConversation, addMessage } = chatSlice.actions
export const selectConversations = (state: { chat: ChatState }) => state.chat.conversations
export const selectMessages = (state: { chat: ChatState }) => state.chat.messages
export const selectActiveConversationId = (state: { chat: ChatState }) => state.chat.activeConversationId
export const selectChatLoading = (state: { chat: ChatState }) => state.chat.loading

export default chatSlice.reducer
