import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import authReducer, { logout } from "./authSlice";
import reportsReducer from "./reportsSlice";
import notificationsReducer from "./notificationsSlice";
import chatReducer from "./chatSlice";
import { setAccessToken, setOnUnauthorized } from "./runtime";
import { setDispatch, connectSockets, disconnectSockets } from "../socket";
import { selectToken } from "./authSlice";
import type { PatrolUser } from "../types";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["reports.nearbyMeta"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

let previousToken: string | null = null;

store.subscribe(() => {
  const token = selectToken(store.getState());
  if (token !== previousToken) {
    previousToken = token;
    setAccessToken(token);
  }
});

setDispatch((action) => store.dispatch(action as never));
setOnUnauthorized(() => {
  void store.dispatch(logout());
});

export function startSession(user: PatrolUser, token: string): void {
  connectSockets(token, user);
}

export function stopSession(): void {
  disconnectSockets();
}
