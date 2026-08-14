import { UserStatus, UserRole, ROLE_LABELS } from "./enums";
export { UserStatus, UserRole, ROLE_LABELS };

// Roles a given creator is allowed to create (mirrors backend CREATE_ACCESS)
export const CREATABLE_ROLES: Record<string, UserRole[]> = {
  [UserRole.SYSTEM_SUPER_ADMIN]: [
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
    UserRole.SYSTEM_SUPER_ADMIN_VIEWER,
    UserRole.SYSTEM_ADMIN_VIEWER,
    UserRole.PEACE_SUPER_ADMIN_VIEWER,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.PEACE_OFFICER_WOREDA_VIEWER,
    UserRole.POLICE_COMMANDER_CITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
  ],
  [UserRole.SYSTEM_ADMIN]: [
    UserRole.SYSTEM_ADMIN,
    UserRole.SYSTEM_ADMIN_VIEWER,
  ],
  [UserRole.PEACE_SUPER_ADMIN]: [
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_SUPER_ADMIN_VIEWER,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.PEACE_OFFICER_WOREDA_VIEWER,
  ],
  [UserRole.PEACE_OFFICER_SUBCITY]: [
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.PEACE_OFFICER_WOREDA_VIEWER,
  ],
  [UserRole.PEACE_OFFICER_WOREDA]: [
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.PEACE_OFFICER_WOREDA_VIEWER,
  ],
  [UserRole.POLICE_COMMANDER_CITY]: [
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_CITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_WOREDA,
    UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
  ],
  [UserRole.POLICE_COMMANDER_SUBCITY]: [
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_WOREDA,
    UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
  ],
  [UserRole.POLICE_COMMANDER_WOREDA]: [
    UserRole.POLICE_COMMANDER_WOREDA,
    UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
  ],
};

export const getCreatableRoles = (creatorRole?: string | null): UserRole[] => {
  if (!creatorRole) return [];
  const roles = CREATABLE_ROLES[creatorRole];
  return roles ?? [creatorRole as UserRole];
};

export interface User {
  id: string;
  userCode?: string;
  email: string;
  fullName?: string;
  role: UserRole;
  phoneNumber?: string;
  password?: string;
  isPasswordSet?: boolean;
  address?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  status?: UserStatus;
  profileImage?: string;
  permissions?: string[];
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: string | Date;
  assignedArea?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isServerActive: boolean;
  isCheckingServer: boolean;
  login: (
    email?: string,
    password?: string,
    phoneNumber?: string
  ) => Promise<void>;
  loginWithData: (user: User) => void;
  logout: () => void;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SYSTEM_SUPER_ADMIN]: [
    "dashboard",
    "reports",
    "violations",
    "cameras",
    "staff_management",
    "settings",
  ],
  [UserRole.SYSTEM_ADMIN]: [
    "dashboard",
    "reports",
    "violations",
    "cameras",
    "staff_management",
    "settings",
  ],
  [UserRole.PATROL]: [
    "dashboard",
    "reports",
    "settings",
  ],
  [UserRole.CITIZEN]: [
    "reports",
  ],
  [UserRole.PEACE_SUPER_ADMIN]: [
    "dashboard",
    "reports",
    "staff_management",
    "geo_management",
    "audit_logs",
    "settings",
  ],
  [UserRole.PEACE_OFFICER_SUBCITY]: [
    "dashboard",
    "reports",
    "staff_management",
    "audit_logs",
    "settings",
  ],
  [UserRole.PEACE_OFFICER_WOREDA]: [
    "dashboard",
    "reports",
    "audit_logs",
    "settings",
  ],
  [UserRole.POLICE_COMMANDER_CITY]: [
    "dashboard",
    "reports",
    "staff_management",
    "geo_management",
    "audit_logs",
    "settings",
  ],
  [UserRole.POLICE_COMMANDER_SUBCITY]: [
    "dashboard",
    "reports",
    "staff_management",
    "audit_logs",
    "settings",
  ],
  [UserRole.POLICE_COMMANDER_WOREDA]: [
    "dashboard",
    "reports",
    "staff_management",
    "patrol_teams",
    "audit_logs",
  ],

  // Viewer roles (read-only access)
  [UserRole.SYSTEM_SUPER_ADMIN_VIEWER]: [
    "dashboard",
    "reports",
    "cameras",
    "audit_logs",
    "settings",
  ],
  [UserRole.SYSTEM_ADMIN_VIEWER]: [
    "dashboard",
    "reports",
    "cameras",
    "audit_logs",
    "settings",
  ],
  [UserRole.PEACE_SUPER_ADMIN_VIEWER]: [
    "dashboard",
    "reports",
    "audit_logs",
    "settings",
  ],
  [UserRole.PEACE_OFFICER_SUBCITY_VIEWER]: [
    "dashboard",
    "reports",
    "audit_logs",
    "settings",
  ],
  [UserRole.PEACE_OFFICER_WOREDA_VIEWER]: [
    "dashboard",
    "reports",
    "audit_logs",
    "settings",
  ],
  [UserRole.POLICE_COMMANDER_CITY_VIEWER]: [
    "dashboard",
    "reports",
    "audit_logs",
    "settings",
  ],
  [UserRole.POLICE_COMMANDER_SUBCITY_VIEWER]: [
    "dashboard",
    "reports",
    "audit_logs",
    "settings",
  ],
  [UserRole.POLICE_COMMANDER_WOREDA_VIEWER]: [
    "dashboard",
    "reports",
    "audit_logs",
    "settings",
  ],
};
