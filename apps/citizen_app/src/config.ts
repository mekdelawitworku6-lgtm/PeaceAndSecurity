export const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://peaceandsecurityadmin.possibletechplc.com/api";
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "https://peaceandsecurityadmin.possibletechplc.com";
export const APP_VERSION = "1.0.0";

export const assetUrl = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `${SOCKET_URL}${u}`) : "";
