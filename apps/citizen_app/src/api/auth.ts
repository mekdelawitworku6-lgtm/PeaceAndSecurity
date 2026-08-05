import { client } from "./client";
import { appendMedia, appendString } from "../utils/media";
import type { LoginData, RegisterData } from "../types";

export async function loginCitizen(phoneNumber: string, pin: string): Promise<LoginData> {
  const res = await client.post<{ data: LoginData }>("/auth/citizen/login", {
    phoneNumber,
    pin,
  });
  return res.data.data;
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber: string;
  profileImage?: { uri: string; name?: string | null; type?: string; file?: File } | null;
}

export async function registerCitizen(payload: RegisterPayload): Promise<RegisterData> {
  const fd = new FormData();
  appendString(fd, "fullName", payload.fullName);
  appendString(fd, "phoneNumber", payload.phoneNumber);
  if (payload.profileImage) {
    appendMedia(fd, "profileImage", [payload.profileImage], "image/jpeg");
  }
  const res = await client.post<{ data: RegisterData }>("/auth/citizen/register", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function verifyCitizenOtp(
  registrationToken: string,
  otpCode: string,
): Promise<{ setPinToken: string }> {
  const res = await client.post<{ data: { setPinToken: string } }>(
    "/auth/citizen/verify",
    { otpCode, otpType: "REGISTRATION-OTP" },
    { headers: { Authorization: `Bearer ${registrationToken}` } },
  );
  return res.data.data;
}

export async function setCitizenPin(setPinToken: string, pin: string): Promise<LoginData> {
  const res = await client.post<{ data: LoginData }>(
    "/auth/citizen/set-pin",
    { pin },
    { headers: { Authorization: `Bearer ${setPinToken}` } },
  );
  return res.data.data;
}

export async function resendCitizenOtp(registrationToken: string): Promise<void> {
  await client.post<{ data: void }>(
    "/auth/citizen/resend-otp",
    { otpType: "REGISTRATION-OTP" },
    { headers: { Authorization: `Bearer ${registrationToken}` } },
  );
}

export async function changePinRequest(currentPin: string, newPin: string): Promise<void> {
  await client.patch("/auth/pin/change", { currentPin, newPin });
}
