import axios from "axios";
import { API_URL } from "../config";
import { getAccessToken, onUnauthorized } from "../store/runtime";

export const client = axios.create({ baseURL: API_URL, timeout: 30000 });

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (
      data &&
      typeof data === "object" &&
      "success" in data &&
      (data as { success: boolean }).success === false
    ) {
      const body = data as { message?: unknown };
      const message =
        typeof body.message === "string" ? body.message : "Request failed";
      return Promise.reject(new Error(message));
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(new Error(extractMessage(error)));
  },
);

function extractMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (data) {
      if (typeof data.message === "string") return data.message;
      if (Array.isArray(data.message)) return data.message.join(", ");
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function handleError(e: unknown): string {
  return extractMessage(e);
}
