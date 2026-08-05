export const colors = {
  primary: "#0d2d82",
  primaryDark: "#081a4d",
  primaryLight: "#eef1fb",
  primarySoft: "#dbe2f7",
  background: "#f6f8fc",
  card: "#ffffff",
  border: "#e4e9f2",
  divider: "#eef1f6",
  text: "#0f172a",
  textBody: "#475569",
  textMuted: "#94a3b8",
  accent: "#f59e0b",
  success: "#16a34a",
  danger: "#dc2626",
  info: "#2563eb",
  white: "#ffffff",
  black: "#000000",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  card: 16,
  button: 12,
  input: 12,
  chip: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: "800" as const, color: colors.text, lineHeight: 32 },
  h2: { fontSize: 22, fontWeight: "700" as const, color: colors.text, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "700" as const, color: colors.text, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.textBody, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: "600" as const, color: colors.text, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: "400" as const, color: colors.textBody, lineHeight: 18 },
  smallMedium: { fontSize: 13, fontWeight: "600" as const, color: colors.text, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: "400" as const, color: colors.textMuted, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: "600" as const, color: colors.text, lineHeight: 18 },
};

export const shadows = {
  card: {
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};
