import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { mockNotifications } from '@/lib/mock-store'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  data: any
  isRead: boolean
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
}

export const loadNotifications = createAsyncThunk('notifications/load', async () => {
  const all = mockNotifications.getAll()
  const notifications = all.map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    data: n.data || null,
    isRead: n.read ?? false,
    createdAt: n.createdAt,
  }))
  const unreadCount = notifications.filter((n) => !n.isRead).length
  return { notifications, unreadCount }
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload)
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload
    },
    markAsRead(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, isRead: true } : n
      )
      state.unreadCount = Math.max(0, state.unreadCount - 1)
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }))
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
        state.loading = false
      })
      .addCase(loadNotifications.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { addNotification, setUnreadCount, markAsRead, markAllAsRead } = notificationSlice.actions

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { dispatch }) => {
    mockNotifications.markAsRead(id)
    dispatch(markAsRead(id))
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { dispatch }) => {
    mockNotifications.markAllRead()
    dispatch(markAllAsRead())
  }
)

export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications
export const selectUnreadCount = (state: { notifications: NotificationState }) => state.notifications.unreadCount
export const selectNotificationsLoading = (state: { notifications: NotificationState }) => state.notifications.loading

export default notificationSlice.reducer
