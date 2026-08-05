import { client } from "./client";
import type { LoginData } from "../types";

export async function loginPatrol(phoneNumber: string, pin: string): Promise<LoginData> {
  const res = await client.post<{ data: LoginData }>("/auth/patrol/login", {
    phoneNumber,
    pin,
  });
  return res.data.data;
}

export async function changePinRequest(currentPin: string, newPin: string): Promise<void> {
  await client.patch("/auth/pin/change", { currentPin, newPin });
}
