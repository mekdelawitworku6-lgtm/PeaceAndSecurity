import type { TextStyle, ViewStyle } from "react-native";

export const colors = {
  primary: "#0d2d82",
  primaryDark: "#081a4d",
  primaryLight: "#eef1fb",
  primarySoft: "#dbe2f7",
  background: "#f6f8fc",
  card: "#ffffff",
  border: "#e4e9f2",
  divider: "#eef1f6",
  heading: "#0f172a",
  body: "#475569",
  muted: "#94a3b8",
  accent: "#f59e0b",
  success: "#16a34a",
  danger: "#dc2626",
  info: "#2563eb",
  white: "#ffffff",
  black: "#000000",
};

export const statusColors: Record<string, string> = {
  SUBMITTED: "#2563eb",
  UNDER_REVIEW: "#6366f1",
  ASSIGNED: "#f59e0b",
  IN_PROGRESS: "#8b5cf6",
  RESOLVED: "#16a34a",
  CLOSED: "#64748b",
  REJECTED: "#dc2626",
  ESCALATED: "#ea580c",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  display: { fontSize: 30, fontWeight: "800", color: colors.heading } as TextStyle,
  title: { fontSize: 22, fontWeight: "700", color: colors.heading } as TextStyle,
  heading: { fontSize: 18, fontWeight: "700", color: colors.heading } as TextStyle,
  subtitle: { fontSize: 16, fontWeight: "600", color: colors.heading } as TextStyle,
  body: { fontSize: 15, lineHeight: 22, color: colors.body } as TextStyle,
  label: { fontSize: 13, fontWeight: "600", color: colors.heading } as TextStyle,
  small: { fontSize: 12, lineHeight: 17, color: colors.muted } as TextStyle,
  caption: { fontSize: 11, color: colors.muted } as TextStyle,
};

export const shadows = {
  card: {
    shadowColor: "#0d2d82",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } as ViewStyle,
};
