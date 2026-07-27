import { UserStatus, UserRole, ROLE_LABELS } from "./enums";
export { UserStatus, UserRole, ROLE_LABELS };

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
};
