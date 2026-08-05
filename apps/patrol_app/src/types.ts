export type ReportStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED"
  | "ESCALATED";

export type UserRole = "CITIZEN" | "PATROL" | "SYSTEM_ADMIN" | "SYSTEM_SUPER_ADMIN";
export type AuthStatus = "idle" | "loading" | "signedIn" | "signedOut";
export type NoiseAreaType = "RESIDENTIAL" | "COMMERCIAL";
export type DevicePlatformValue = "android" | "ios" | "web";
export type NotificationTypeValue =
  | "REPORT_SUBMITTED"
  | "REPORT_ASSIGNED"
  | "REPORT_STATUS_UPDATED"
  | "PATROL_FOLLOW_UP"
  | "GENERAL";

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: PatrolUser;
}

export interface PatrolUser {
  id: string;
  userCode: string;
  fullName: string;
  phoneNumber: string;
  role: "PATROL";
  profileImage?: string | null;
  status?: string;
  assignedArea?: string | null;
  officeAddress?: string | null;
  officeLatitude?: number | null;
  officeLongitude?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
}

export interface AuthState {
  user: PatrolUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  error: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message?: string;
}

export interface PickedMedia {
  uri: string;
  name?: string | null;
  type?: string;
  file?: File;
}

export interface ReportType {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface Person {
  id?: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string | null;
}

export interface Report {
  id: string;
  caseId?: string;
  reporterId?: string | null;
  reporter?: Person | null;
  reporterPhoneNumber?: string | null;
  reportTypeId?: string | null;
  reportType?: { id?: string; name?: string } | null;
  violationType?: string | null;
  reportDescription?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  area?: string | null;
  cityId?: string | null;
  subcityId?: string | null;
  woredaId?: string | null;
  imageUrls: string[];
  videoUrls: string[];
  audioUrls: string[];
  evidenceUrls: string[];
  decibelLevel?: number | null;
  noiseAreaType?: string | null;
  noisePollutionStatus?: string | null;
  isAnonymous: boolean;
  status: ReportStatus;
  assignedPatrolId?: string | null;
  assignedPatrol?: Person | null;
  assignedAt?: string | null;
  inspectionStartedAt?: string | null;
  inspectionCompletedAt?: string | null;
  patrolNotes?: string | null;
  patrolImageUrls?: string[];
  patrolVideoUrls?: string[];
  patrolAudioUrls?: string[];
  patrolEvidenceUrls?: string[];
  rejectionReason?: string | null;
  incidentDateTime?: string | null;
  isOngoing: boolean;
  isEmergency: boolean;
  suspectInfo?: string | null;
  victimInfo?: string | null;
  witnessInfo?: string | null;
  deviceId?: string | null;
  devicePlatform?: string | null;
  appVersion?: string | null;
  ipAddress?: string | null;
  assignedDepartmentId?: string | null;
  investigationNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number | null;
}

export interface ReportLog {
  id: string;
  status?: string;
  note?: string | null;
  changedById?: string | null;
  changedByType?: string | null;
  createdAt: string;
}

export interface NearbyLocation {
  latitude: number;
  longitude: number;
  address?: string | null;
}

export interface NearbyReportsResponse {
  patrolOfficeLocation?: NearbyLocation | null;
  radiusKm?: number;
  total?: number;
  reports: Report[];
}

export interface Conversation {
  id: string;
  reportId: string;
  report?: Report | null;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message | null;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string | null;
  senderType?: string | null;
  senderName?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessagesResponse {
  data: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationTypeValue;
  data?: { reportId?: string; caseId?: string; status?: string; [key: string]: unknown } | null;
  isRead: boolean;
  createdAt: string;
  userId?: string | null;
  patrolId?: string | null;
  citizenId?: string | null;
}
