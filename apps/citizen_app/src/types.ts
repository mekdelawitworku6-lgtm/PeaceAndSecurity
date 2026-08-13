export type Role = "CITIZEN" | "PATROL" | "SYSTEM_ADMIN" | "SYSTEM_SUPER_ADMIN";

export interface Citizen {
  id: string;
  userCode: string;
  fullName: string;
  phoneNumber: string;
  role: Role;
  profileImage?: string | null;
  status?: string;
  createdAt?: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: Citizen;
}

export interface RegisterData {
  registrationToken?: string;
  expiresIn?: number;
  citizen?: { id: string; fullName: string; phoneNumber: string };
}

export type AuthStatus = "idle" | "loading" | "signedIn" | "signedOut";

export interface AuthState {
  user: Citizen | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  isGuest?: boolean;
  error: string | null;
}

export type ReportStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED"
  | "ESCALATED";

export type NoiseAreaType = "RESIDENTIAL" | "COMMERCIAL";

export interface ReportType {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  residentialDecibelThreshold?: number;
  commercialDecibelThreshold?: number;
}

export interface AssignedPatrol {
  id: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string | null;
  assignedArea?: string;
}

export interface Report {
  id: string;
  caseId?: string;
  reporterId?: string;
  reporter?: Citizen | null;
  reporterPhoneNumber?: string;
  reportTypeId?: string;
  reportType?: ReportType | null;
  violationType?: string;
  reportDescription?: string;
  latitude: number;
  longitude: number;
  address?: string;
  area?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  audioUrls?: string[];
  evidenceUrls?: string[];
  decibelLevel?: number | null;
  noiseAreaType?: NoiseAreaType | null;
  noisePollutionStatus?: string;
  isAnonymous?: boolean;
  status: ReportStatus;
  assignedPatrolId?: string;
  assignedPatrol?: AssignedPatrol | null;
  assignedAt?: string;
  patrolNotes?: string;
  patrolImageUrls?: string[];
  patrolVideoUrls?: string[];
  patrolAudioUrls?: string[];
  patrolEvidenceUrls?: string[];
  rejectionReason?: string;
  incidentDateTime?: string;
  isOngoing?: boolean;
  isEmergency?: boolean;
  suspectInfo?: string;
  victimInfo?: string;
  witnessInfo?: string;
  deviceId?: string;
  devicePlatform?: string;
  appVersion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportLog {
  id: string;
  status?: ReportStatus;
  note?: string;
  changedById?: string;
  changedByType?: string;
  changedByName?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "citizen" | "patrol" | "admin";
  senderName?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  reportId: string;
  report?: Pick<Report, "id" | "caseId" | "violationType" | "reportType" | "reportDescription" | "status"> | null;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message | null;
  unreadCount?: number;
}

export interface MessagesResponse {
  data: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type NotificationTypeValue =
  | "REPORT_SUBMITTED"
  | "REPORT_ASSIGNED"
  | "REPORT_STATUS_UPDATED"
  | "PATROL_FOLLOW_UP"
  | "GENERAL";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationTypeValue;
  data?: { reportId?: string; caseId?: string; [key: string]: any } | null;
  isRead: boolean;
  userId?: string;
  patrolId?: string;
  citizenId?: string;
  createdAt: string;
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

export type DevicePlatformValue = "android" | "ios" | "web";
