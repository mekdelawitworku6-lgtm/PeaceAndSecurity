export enum UserStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    DISABLED = "DISABLED",
}

/**
 * Peace & Security System Roles:
 * - SYSTEM_SUPER_ADMIN: Full system access, can manage all admins
 * - SYSTEM_ADMIN:       Admin access, manages patrols and reports
 * - PATROL:             Field officer, accesses via Patrol mobile app
 * - CITIZEN:            Public user, submits reports via Citizen mobile app
 * - PEACE_SUPER_ADMIN:  City-level Peace & Security Super Admin
 * - PEACE_OFFICER_SUBCITY: Subcity Peace Officer
 * - PEACE_OFFICER_WOREDA: Woreda Peace Officer
 * - POLICE_COMMANDER_CITY: City-level Police Commander
 * - POLICE_COMMANDER_SUBCITY: Subcity Police Commander
 * - POLICE_COMMANDER_WOREDA: Woreda Police Commander
 */
export enum UserRole {
  SYSTEM_SUPER_ADMIN = "SYSTEM_SUPER_ADMIN",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  PATROL = "PATROL",
  CITIZEN = "CITIZEN",

  // Peace & Security hierarchy
  PEACE_SUPER_ADMIN = "PEACE_SUPER_ADMIN",
  PEACE_OFFICER_SUBCITY = "PEACE_OFFICER_SUBCITY",
  PEACE_OFFICER_WOREDA = "PEACE_OFFICER_WOREDA",

  // Police hierarchy
  POLICE_COMMANDER_CITY = "POLICE_COMMANDER_CITY",
  POLICE_COMMANDER_SUBCITY = "POLICE_COMMANDER_SUBCITY",
  POLICE_COMMANDER_WOREDA = "POLICE_COMMANDER_WOREDA",
}

export const ROLE_LABELS: Record<string, string> = {
  [UserRole.SYSTEM_SUPER_ADMIN]: "System Super Admin",
  [UserRole.SYSTEM_ADMIN]: "System Admin",
  [UserRole.PATROL]: "Patrol Officer",
  [UserRole.CITIZEN]: "Citizen",
  [UserRole.PEACE_SUPER_ADMIN]: "Peace Super Admin",
  [UserRole.PEACE_OFFICER_SUBCITY]: "Peace Officer Subcity",
  [UserRole.PEACE_OFFICER_WOREDA]: "Peace Officer Woreda",
  [UserRole.POLICE_COMMANDER_CITY]: "Police Commander City",
  [UserRole.POLICE_COMMANDER_SUBCITY]: "Police Commander Subcity",
  [UserRole.POLICE_COMMANDER_WOREDA]: "Police Commander Woreda",
};

export enum OTPType {
    FORGOT_PASSWORD_OTP = "FORGOT-PASSWORD-OTP",
    REGISTRATION_OTP = "REGISTRATION-OTP",
}

export enum ReportStatus {
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
    REJECTED = "REJECTED",
}

export enum OTPStatus {
    REQUESTED = "REQUESTED",
    EXPIRED = "EXPIRED",
    USED = "USED",
}

export enum TokenType {
    ACCESS = "ACCESS",
    REFRESH = "REFRESH",
    PASSWORD_RESET = "PASSWORD_RESET",
    REGISTRATION = "REGISTRATION",
    SET_PASSWORD = "SET_PASSWORD",
}

export enum EvidenceType {
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  BOTH = "BOTH",
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}
