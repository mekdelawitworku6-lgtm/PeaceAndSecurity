import { ServiceResponse } from "../api-types";
import { User } from "../auth";
import { UserRole } from "../enums";
import { mockUsers } from "../mock-store";

export interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
}

class AuthService {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const identifier = credentials.email || credentials.phoneNumber || "";
    const found = mockUsers.findByCredentials(identifier, credentials.password);

    if (!found) {
      throw new Error("Invalid email/phone or password");
    }

    if (found.status === "DISABLED") {
      throw new Error("Account is disabled");
    }

    const accessToken = "mock-access-" + found.id;
    const refreshToken = "mock-refresh-" + found.id;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const user: User = {
      id: found.id,
      email: found.email || found.phoneNumber || "",
      fullName: found.fullName,
      role: found.role as UserRole,
      phoneNumber: found.phoneNumber,
      profileImage: found.profileImage,
      permissions: found.permissions || [],
      createdAt: found.createdAt || new Date().toISOString(),
      isPasswordSet: found.isPasswordSet,
      isPhoneVerified: found.isPhoneVerified ?? true,
      isEmailVerified: found.isEmailVerified ?? false,
    };

    return { user, accessToken, refreshToken };
  }

  async preLogin(
    email?: string,
    phoneNumber?: string
  ): Promise<{ isPasswordSet: boolean; setPasswordToken?: string }> {
    const identifier = email || phoneNumber || "";
    const items = mockUsers.getAll();
    const found = items.find(
      (u) => u.email === identifier || u.phoneNumber === identifier
    );
    if (!found) throw new Error("User not found");
    return {
      isPasswordSet: found.isPasswordSet ?? false,
      setPasswordToken: found.isPasswordSet ? undefined : "mock-set-password-token",
    };
  }

  async setPassword(
    _token: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    throw new Error("Password setting not available in offline mode");
  }

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  }

  async changePassword(
    _currentPassword: string,
    _newPassword: string
  ): Promise<ServiceResponse<any>> {
    return { success: true, message: "Password changed (mock)" };
  }
}

export const authService = new AuthService();
