/**
 * Centralized mock data for the citizen app (no backend required).
 * All screens use this data when running in guest/demo mode.
 */
import type {
  AppNotification,
  Conversation,
  Message,
  Report,
  ReportLog,
  ReportType,
} from "../types";

// ─── Report Types ─────────────────────────────────────────────────────
export const MOCK_REPORT_TYPES: ReportType[] = [
  { id: "t1", name: "Robbery / Theft / Crime", isActive: true },
  { id: "t2", name: "Illegal Weapons", isActive: true },
  { id: "t3", name: "Forgery / Fraud / Illegal Money", isActive: true },
  { id: "t4", name: "Security Threat", isActive: true },
  { id: "t5", name: "Street Children / Begging", isActive: true },
  { id: "t6", name: "Disruptive / Illegal Activity", isActive: true },
  { id: "t7", name: "Illegal Business / Broker Activity", isActive: true },
  { id: "t8", name: "Event / Holiday Security Screen", isActive: true },
  { id: "t9", name: "Institution Inspection Request", isActive: true },
  { id: "t10", name: "Noise Pollution", isActive: true },
];

// ─── Reports ──────────────────────────────────────────────────────────
let reportCounter = 5;
const now = new Date().toISOString();
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

export const MOCK_MY_REPORTS: Report[] = [
  {
    id: "r1",
    caseId: "PSB-2026-0584",
    violationType: "Robbery / Theft / Crime",
    reportType: { id: "t1", name: "Robbery / Theft / Crime" },
    reportDescription: "Suspicious activity near Meskel Square parking area late at night.",
    latitude: 9.0107,
    longitude: 38.7612,
    address: "Meskel Square, Addis Ababa",
    status: "IN_PROGRESS",
    isEmergency: false,
    isAnonymous: false,
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
  },
  {
    id: "r2",
    caseId: "PSB-2026-0571",
    violationType: "Illegal Weapons",
    reportType: { id: "t2", name: "Illegal Weapons" },
    reportDescription: "Observed concealed weapons near Bole Airport entrance.",
    latitude: 8.9892,
    longitude: 38.7865,
    address: "Bole Road, near Airport",
    status: "UNDER_REVIEW",
    isEmergency: true,
    isAnonymous: true,
    createdAt: oneDayAgo,
    updatedAt: oneDayAgo,
  },
  {
    id: "r3",
    caseId: "PSB-2026-0560",
    violationType: "Security Threat",
    reportType: { id: "t4", name: "Security Threat" },
    reportDescription: "Unattended bag near Mexico Square bus stop, crowd gathering.",
    latitude: 9.0125,
    longitude: 38.745,
    address: "Mexico Square, Addis Ababa",
    status: "RESOLVED",
    isEmergency: false,
    isAnonymous: false,
    createdAt: twoDaysAgo,
    updatedAt: oneDayAgo,
  },
];

export const MOCK_NEARBY_REPORTS: Report[] = [
  ...MOCK_MY_REPORTS,
  {
    id: "r4",
    caseId: "PSB-2026-0545",
    violationType: "Disruptive / Illegal Activity",
    reportType: { id: "t6", name: "Disruptive / Illegal Activity" },
    reportDescription: "Loud construction work happening past midnight.",
    latitude: 9.02,
    longitude: 38.75,
    address: "Churchill Ave, 1202",
    status: "ASSIGNED",
    isEmergency: false,
    isAnonymous: false,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: "r5",
    caseId: "PSB-2026-0533",
    violationType: "Illegal Business / Broker Activity",
    reportType: { id: "t7", name: "Illegal Business / Broker Activity" },
    reportDescription: "Unlicensed brokers operating near Piassa Market entrance.",
    latitude: 9.035,
    longitude: 38.752,
    address: "Piassa Market",
    status: "SUBMITTED",
    isEmergency: false,
    isAnonymous: true,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
];

// ─── Report History / Logs ────────────────────────────────────────────
export const MOCK_REPORT_HISTORY: ReportLog[] = [
  {
    id: "log1",
    status: "SUBMITTED",
    note: "Report submitted by citizen.",
    changedByType: "citizen",
    changedByName: "You",
    createdAt: twoDaysAgo,
  },
  {
    id: "log2",
    status: "UNDER_REVIEW",
    note: "Report is being reviewed by the assigned security unit.",
    changedByType: "admin",
    changedByName: "Bole Sub-City Security",
    createdAt: oneDayAgo,
  },
  {
    id: "log3",
    status: "IN_PROGRESS",
    note: "Patrol unit dispatched to the area.",
    changedByType: "patrol",
    changedByName: "Officer Tadesse",
    createdAt: twoHoursAgo,
  },
];

// ─── Notifications ────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Report Assigned",
    message: "Your report PSB-2026-0584 has been assigned to Bole Sub-City Security Unit.",
    type: "REPORT_ASSIGNED",
    data: { reportId: "r1", caseId: "PSB-2026-0584" },
    isRead: false,
    createdAt: twoHoursAgo,
  },
  {
    id: "n2",
    title: "Status Updated",
    message: "Your report PSB-2026-0560 has been resolved. Thank you for your contribution!",
    type: "REPORT_STATUS_UPDATED",
    data: { reportId: "r3", caseId: "PSB-2026-0560" },
    isRead: false,
    createdAt: oneDayAgo,
  },
  {
    id: "n3",
    title: "Patrol Follow-up",
    message: "Officer Tadesse left a note on case PSB-2026-0571. Check chat for details.",
    type: "PATROL_FOLLOW_UP",
    data: { reportId: "r2", caseId: "PSB-2026-0571" },
    isRead: true,
    createdAt: twoDaysAgo,
  },
];

// ─── Conversations / Chat ─────────────────────────────────────────────
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    reportId: "r1",
    report: {
      id: "r1",
      caseId: "PSB-2026-0584",
      violationType: "Robbery / Theft / Crime",
      reportType: { id: "t1", name: "Robbery / Theft / Crime" },
      reportDescription: "Suspicious activity near Meskel Square parking area.",
      status: "IN_PROGRESS",
    },
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
    lastMessage: {
      id: "m2",
      conversationId: "conv1",
      senderId: "patrol1",
      senderType: "patrol",
      senderName: "Officer Tadesse",
      content: "We have dispatched a patrol unit to the area. Stay safe.",
      isRead: true,
      createdAt: twoHoursAgo,
    },
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    conversationId: "conv1",
    senderId: "citizen1",
    senderType: "citizen",
    senderName: "You",
    content: "I noticed some suspicious activity near the parking lot. Please investigate.",
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "m2",
    conversationId: "conv1",
    senderId: "patrol1",
    senderType: "patrol",
    senderName: "Officer Tadesse",
    content: "We have dispatched a patrol unit to the area. Stay safe.",
    isRead: true,
    createdAt: twoHoursAgo,
  },
];

// ─── Helper to create a new report from user submission ───────────────
export function createMockReport(payload: {
  violationType: string;
  reportDescription: string;
  latitude: number;
  longitude: number;
  address?: string;
  isAnonymous?: boolean;
  isEmergency?: boolean;
  isOngoing?: boolean;
}): Report {
  reportCounter += 1;
  const report: Report = {
    id: `r${Date.now()}`,
    caseId: `PSB-2026-${String(580 + reportCounter).padStart(4, "0")}`,
    violationType: payload.violationType,
    reportType: MOCK_REPORT_TYPES.find((t) => t.name === payload.violationType) ?? {
      id: "t99",
      name: payload.violationType,
    },
    reportDescription: payload.reportDescription,
    latitude: payload.latitude,
    longitude: payload.longitude,
    address: payload.address ?? "Addis Ababa, Ethiopia",
    status: "SUBMITTED",
    isAnonymous: payload.isAnonymous ?? false,
    isEmergency: payload.isEmergency ?? false,
    isOngoing: payload.isOngoing ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  // Add to the beginning of my reports
  MOCK_MY_REPORTS.unshift(report);
  MOCK_NEARBY_REPORTS.unshift(report);
  return report;
}
