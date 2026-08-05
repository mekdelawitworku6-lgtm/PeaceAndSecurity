import { configureStore } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer, { AUTH_STORAGE_KEY, logout } from "./authSlice";
import reportsReducer from "./reportsSlice";
import notificationsReducer from "./notificationsSlice";
import chatReducer from "./chatSlice";
import { setAccessToken, setOnUnauthorized } from "./runtime";
import { setDispatch } from "../socket";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

setDispatch((action) => store.dispatch(action as never));

let lastPersistedToken: string | null = null;

store.subscribe(() => {
  const { user, accessToken, refreshToken, status } = store.getState().auth;
  setAccessToken(accessToken);
  const key = accessToken ?? "";
  if (key !== lastPersistedToken) {
    lastPersistedToken = key;
    if (status === "signedIn" && user) {
      AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, accessToken, refreshToken }),
      ).catch(() => {});
    } else {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
    }
  }
});

setOnUnauthorized(() => {
  store.dispatch(logout() as never);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
