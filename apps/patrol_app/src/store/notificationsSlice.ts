import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
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
    return await fetchNotificationsApi();
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

export const markRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/markRead", async (id, { rejectWithValue }) => {
  try {
    await markReadApi(id);
    return id;
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const markAllRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notifications/markAllRead", async (_, { rejectWithValue }) => {
  try {
    await markAllReadApi();
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification(state, action: PayloadAction<AppNotification>) {
      const n = action.payload;
      state.items = [n, ...state.items.filter((x) => x.id !== n.id)];
      if (!n.isRead) state.unreadCount += 1;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load notifications";
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        );
        state.unreadCount = Math.max(
          0,
          state.items.filter((n) => !n.isRead).length,
        );
      })
      .addCase(markAllRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllRead.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to mark all as read";
      });
  },
});

export const { pushNotification, setUnreadCount } = notificationsSlice.actions;

export const selectNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items;
export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) =>
  state.notifications.loading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) =>
  state.notifications.error;

export default notificationsSlice.reducer;
