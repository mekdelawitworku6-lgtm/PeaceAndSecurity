import "reflect-metadata";
import * as assert from "node:assert/strict";

import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../src/modules/auth/auth.service";
import { OtpService } from "../src/modules/otp/otp.service";
import { Otp } from "../src/modules/otp/entities/otp.entity";
import { comparePassword } from "../src/common/utils/password.util";
import {
  OTPType,
  PINType,
  TokenType,
  UserRole,
  UserStatus,
  VerificationStatus,
} from "../src/common/enums/enums";

process.env.OTP_SECRET = "verification-only-otp-secret-".repeat(2);
process.env.JWT_ACCESS_SECRET = "jwt-access-secret-".repeat(2);
process.env.JWT_REFRESH_SECRET = "jwt-refresh-secret-".repeat(2);
process.env.JWT_SET_PASSWORD_SECRET = "jwt-set-password-secret-".repeat(2);
process.env.JWT_PASSWORD_RESET_SECRET = "jwt-password-reset-secret-".repeat(2);
process.env.JWT_REG_SECRET = "jwt-registration-secret-".repeat(2);

class OtpRepo {
  rows: Otp[] = [];
  private seq = 0;

  create(data: Partial<Otp>): Otp {
    return { id: `otp-${++this.seq}`, createdAt: new Date(), ...data } as Otp;
  }

  async save(row: Otp): Promise<Otp> {
    const index = this.rows.findIndex((item) => item.id === row.id);
    if (index === -1) this.rows.push(row);
    else this.rows[index] = row;
    return row;
  }

  async findOne(options: any): Promise<Otp | null> {
    const criteria = Array.isArray(options.where)
      ? options.where
      : [options.where];
    const sorted = [...this.rows].sort(
      (a, b) => +b.createdAt - +a.createdAt,
    );
    for (const row of sorted) {
      for (const condition of criteria) {
        if (
          Object.entries(condition).every(
            ([key, value]) => (row as any)[key] === value,
          )
        )
          return row;
      }
    }
    return null;
  }

  async delete(): Promise<void> {
    this.rows = [];
  }

  createQueryBuilder() {
    const repo = this;
    let phone: string | undefined;
    let userId: string | undefined;
    let otpType: string | undefined;
    let oneHourAgo: Date | undefined;

    return {
      where(_sql: string, params: any) {
        phone = params.phone;
        userId = params.userId;
        otpType = params.otpType;
        return this;
      },
      andWhere(_sql: string, params: any) {
        oneHourAgo = params.oneHourAgo;
        return this;
      },
      async getCount() {
        return repo.rows.filter(
          (row) =>
            (!phone || row.phoneNumber === phone) &&
            (!userId || row.userId === userId) &&
            (!otpType || row.otpType === otpType) &&
            (!oneHourAgo || row.createdAt >= oneHourAgo),
        ).length;
      },
    };
  }
}

class EntityRepo {
  constructor(public rows: any[]) { }

  async findOne(options: any): Promise<any | null> {
    const where = options.where as Record<string, any>;
    return (
      this.rows.find((row) =>
        Object.entries(where).every(([key, value]) => row[key] === value),
      ) ?? null
    );
  }

  async save(row: any): Promise<any> {
    const index = this.rows.findIndex((item) => item.id === row.id);
    if (index === -1) this.rows.push(row);
    else this.rows[index] = row;
    return row;
  }

  async increment(criteria: any, column: string, amount: number): Promise<void> {
    const row = this.rows.find((item) => item.id === criteria.id);
    if (row) row[column] = (row[column] ?? 0) + amount;
  }
}

const patrolPhone = "+251911234567";
const citizenPhone = "+251911234568";
const patrol = {
  id: "patrol-1",
  fullName: "Test Patrol",
  phoneNumber: patrolPhone,
  pin: "old-hash",
  isPinSet: true,
  status: UserStatus.ACTIVE,
  tokenVersion: 0,
};
const citizen = {
  id: "citizen-1",
  fullName: "Test Citizen",
  phoneNumber: citizenPhone,
  pin: "old-hash",
  isPinSet: true,
  status: UserStatus.ACTIVE,
  tokenVersion: 0,
};

const otpRepo = new OtpRepo();
const otpService = new OtpService(otpRepo as any);
const jwtService = new JwtService({});
const codes: string[] = [];
const originalCreate = otpService.createOtp.bind(otpService);
otpService.createOtp = async (dto: any) => {
  const result = await originalCreate(dto);
  codes.push(result.otpCode);
  return result;
};

const patrolRepo = new EntityRepo([patrol]);
const citizenRepo = new EntityRepo([citizen]);
const auth = new AuthService(
  new EntityRepo([]) as any,
  patrolRepo as any,
  citizenRepo as any,
  { query: async () => [] } as any,
  otpService,
  jwtService,
  { logSecurityEvent: async () => undefined } as any,
);

async function request(role: "patrol" | "citizen", pinType: PINType) {
  otpRepo.rows = [];
  const before = codes.length;
  const result = await auth.requestPinReset(
    role === "patrol" ? patrolPhone : citizenPhone,
    role,
    pinType,
  );
  assert.equal(result.success, true, result.message);
  return { token: result.data.resetToken, code: codes[before] };
}

function confirm(token: string, code: string, newPin = "482915") {
  return auth.confirmPinReset(token, code, newPin);
}

async function main() {
  const patrolReset = await request("patrol", PINType.RESET);
  const payload: any = jwtService.verify(patrolReset.token, {
    secret: process.env.JWT_PASSWORD_RESET_SECRET,
  });
  assert.equal(payload.type, TokenType.PIN_RESET);
  assert.equal(payload.pinType, PINType.RESET);
  assert.equal(payload.role, UserRole.PATROL);
  assert.equal((await confirm(patrolReset.token, patrolReset.code)).success, true);
  assert.equal(patrol.isPinSet, true);
  assert.equal(await comparePassword("482915", patrol.pin), true);
  assert.equal(patrol.tokenVersion, 1);
  const replay = await confirm(patrolReset.token, patrolReset.code);
  assert.equal(replay.success, false);
  console.log("PASS: patrol RESET flow verifies OTP, sets new PIN once, bumps token version");

  const setupAttempt = await auth.requestPinReset(
    patrolPhone,
    "patrol",
    PINType.SETUP,
  );
  assert.equal(setupAttempt.success, false);
  assert.match(setupAttempt.message, /only supports PIN resets/);
  console.log("PASS: public PIN-reset endpoint rejects SETUP requests");

  const derived = await request("citizen", PINType.RESET);
  const verified = await auth.verifyMobileOTP(
    derived.token,
    derived.code,
    OTPType.REGISTRATION_OTP,
  );
  assert.equal(verified.success, true, verified.message);
  const verifiedPayload: any = jwtService.verify(verified.data.setPinToken, {
    secret: process.env.JWT_SET_PASSWORD_SECRET,
  });
  assert.equal(verifiedPayload.sub, citizen.id);
  assert.equal(verifiedPayload.phoneNumber, citizen.phoneNumber);
  assert.equal(verifiedPayload.role, UserRole.CITIZEN);
  assert.equal(verified.data.accessToken, undefined);
  assert.equal(verified.data.refreshToken, undefined);
  assert.equal(citizen.verificationStatus, VerificationStatus.VERIFIED);
  console.log("PASS: OTP type comes from token and phone verification issues no session tokens");

  const citizenReset = await request("citizen", PINType.RESET);
  assert.equal((await confirm(citizenReset.token, citizenReset.code)).success, true);
  assert.equal(await comparePassword("482915", citizen.pin), true);
  console.log("PASS: citizen RESET flow verifies OTP and sets new PIN");

  const wrong = await request("patrol", PINType.RESET);
  const wrongResult = await confirm(wrong.token, "000000");
  assert.equal(wrongResult.success, false);
  assert.match(wrongResult.message, /Invalid OTP code/);
  console.log("PASS: wrong OTP is rejected");

  const tamperedToken = jwtService.sign(
    {
      sub: patrol.id,
      phoneNumber: "+251911111111",
      role: UserRole.PATROL,
      pinType: PINType.RESET,
      type: TokenType.PIN_RESET,
    },
    { secret: process.env.JWT_PASSWORD_RESET_SECRET },
  );
  const tampered = await request("patrol", PINType.RESET);
  const tamperedResult = await confirm(tamperedToken, tampered.code);
  assert.equal(tamperedResult.success, false);
  console.log("PASS: reset token is bound to the account phone number");

  const weakPin = await request("citizen", PINType.RESET);
  const weakResult = await confirm(weakPin.token, weakPin.code, "123456");
  assert.equal(weakResult.success, false);
  assert.match(weakResult.message, /too common/);
  console.log("PASS: weak/common PIN is rejected");

  otpRepo.rows = [];
  for (let index = 0; index < 5; index++) {
    const result = await auth.requestPinReset(patrolPhone, "patrol", PINType.RESET);
    assert.equal(result.success, true, result.message);
    otpRepo.rows[otpRepo.rows.length - 1].createdAt = new Date(
      Date.now() - 61_000,
    );
  }
  const limited = await auth.requestPinReset(patrolPhone, "patrol", PINType.RESET);
  assert.equal(limited.success, false);
  assert.match(limited.message, /Too many OTP requests/);
  console.log("PASS: reset requests still hit the hourly OTP rate limit");
}

main().then(
  () => console.log("ALL PIN RESET CHECKS PASSED"),
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
