import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';
import { ServiceResponse } from '../api-types';
import { User } from '../auth';
import { UserRole } from '../enums';

export interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
}

class AuthService {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const body: any = { password: credentials.password };
    if (credentials.email) body.email = credentials.email;
    if (credentials.phoneNumber) body.phoneNumber = credentials.phoneNumber;

    const response = await apiClient.post(API_ENDPOINTS.AUTH.USER_LOGIN, body);
    const { accessToken, refreshToken, user: rawUser } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    const user: User = {
      id: rawUser.id,
      email: rawUser.email || '',
      fullName: rawUser.fullName || '',
      role: rawUser.role as UserRole,
      phoneNumber: rawUser.phoneNumber,
      profileImage: rawUser.profileImage,
      permissions: rawUser.permissions || [],
      createdAt: rawUser.createdAt || new Date().toISOString(),
      isPasswordSet: rawUser.isPasswordSet ?? true,
      isPhoneVerified: rawUser.isPhoneVerified ?? false,
      isEmailVerified: rawUser.isEmailVerified ?? false,
    };

    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  }

  async preLogin(
    email?: string,
    phoneNumber?: string
  ): Promise<{ isPasswordSet: boolean; setPasswordToken?: string }> {
    const body: any = {};
    if (email) body.email = email;
    if (phoneNumber) body.phoneNumber = phoneNumber;

    const response = await apiClient.post(API_ENDPOINTS.AUTH.USER_PRE_LOGIN, body);
    return response.data.data;
  }

  async setPassword(
    _token: string,
    _password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    throw new Error('Password setting not available');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ServiceResponse<any>> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.USER_PASSWORD_CHANGE, {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}

export const authService = new AuthService();
