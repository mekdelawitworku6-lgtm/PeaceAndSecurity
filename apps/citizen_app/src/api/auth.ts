/**
 * Mock auth API — returns fake data, no backend calls.
 * Login/register always succeed with mock user data.
 */
import type { LoginData, RegisterData } from "../types";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const MOCK_USER = {
  id: "citizen-demo-001",
  userCode: "CTZ-001",
  fullName: "Demo Citizen",
  phoneNumber: "+251911000000",
  role: "CITIZEN" as const,
  profileImage: null,
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
};

export async function loginCitizen(_phoneNumber: string, _pin: string): Promise<LoginData> {
  await delay();
  return {
    accessToken: "mock-token-abc123",
    refreshToken: "mock-refresh-xyz",
    user: { ...MOCK_USER },
  };
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber: string;
  profileImage?: { uri: string; name?: string | null; type?: string; file?: File } | null;
}

export async function registerCitizen(_payload: RegisterPayload): Promise<RegisterData> {
  await delay();
  return {
    registrationToken: "mock-reg-token",
    expiresIn: 300,
    citizen: { id: MOCK_USER.id, fullName: MOCK_USER.fullName, phoneNumber: MOCK_USER.phoneNumber },
  };
}

export async function verifyCitizenOtp(
  _registrationToken: string,
  _otpCode: string,
): Promise<{ setPinToken: string }> {
  await delay(300);
  return { setPinToken: "mock-set-pin-token" };
}

export async function setCitizenPin(_setPinToken: string, _pin: string): Promise<LoginData> {
  await delay(300);
  return {
    accessToken: "mock-token-abc123",
    refreshToken: "mock-refresh-xyz",
    user: { ...MOCK_USER },
  };
}

export async function resendCitizenOtp(_registrationToken: string): Promise<void> {
  await delay(300);
}

export async function changePinRequest(_currentPin: string, _newPin: string): Promise<void> {
  await delay(300);
}
