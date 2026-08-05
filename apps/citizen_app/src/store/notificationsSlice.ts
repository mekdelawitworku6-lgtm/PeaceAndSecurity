import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchNotificationsApi,
  fetchUnreadCountApi,
  markAllReadApi,
  markReadApi,
} from "../api/notifications";
import { handleError } from "../api/client";
import type { AppNotification } from "../types";

export interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  AppNotification[],
  void,
  { rejectValue: string }
>("notifications/fetch", async (_, { rejectWithValue }) => {
  try {
    return await fetchNotificationsApi(50);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notifications/unreadCount", async (_, { rejectWithValue }) => {
  try {
    return await fetchUnreadCountApi();
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const markRead = createAsyncThunk<string, string, { rejectValue: string }>(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await markReadApi(id);
      return id;
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

export const markAllRead = createAsyncThunk<void, void, { rejectValue: string }>(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllReadApi();
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification(state, action: PayloadAction<AppNotification>) {
      const n = action.payload;
      if (!n || !n.id || state.items.some((i) => i.id === n.id)) return;
      state.items = [n, ...state.items];
      if (!n.isRead) state.unreadCount += 1;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    clearNotificationsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load notifications";
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          if (state.unreadCount > 0) state.unreadCount -= 1;
        }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export const { pushNotification, setUnreadCount, clearNotificationsError } =
  notificationsSlice.actions;

export const selectNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items;
export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) =>
  state.notifications.loading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) =>
  state.notifications.error;

export default notificationsSlice.reducer;
