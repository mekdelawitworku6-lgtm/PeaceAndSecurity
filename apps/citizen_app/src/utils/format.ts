import { colors } from "../theme";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: colors.info,
  UNDER_REVIEW: "#6366f1",
  ASSIGNED: colors.accent,
  IN_PROGRESS: "#8b5cf6",
  RESOLVED: colors.success,
  CLOSED: "#64748b",
  REJECTED: colors.danger,
  ESCALATED: "#ea580c",
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  ESCALATED: "Escalated",
};

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function statusLabel(status?: string | null): string {
  if (!status) return "—";
  return STATUS_LABELS[status] || status;
}

export function statusColor(status?: string | null): string {
  if (!status) return colors.textMuted;
  return STATUS_COLORS[status] || colors.textMuted;
}

export function reportTypeLabel(reportType: unknown): string {
  if (!reportType) return "Report";
  if (typeof reportType === "string") return reportType.replace(/_/g, " ");
  const rt = reportType as { name?: string };
  if (rt.name) return rt.name.replace(/_/g, " ");
  return "Report";
}
