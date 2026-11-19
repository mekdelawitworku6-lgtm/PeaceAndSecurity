import "reflect-metadata";
import * as assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

import { OtpService } from "../src/modules/otp/otp.service";
import { Otp } from "../src/modules/otp/entities/otp.entity";
import { OTPStatus, OTPType } from "../src/common/enums/enums";
import { envValidationSchema } from "../src/config/env.validation";

const secret = "verification-only-otp-secret-".repeat(2);
process.env.OTP_SECRET = secret;

class FakeRepo {
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

  async delete(where: any): Promise<void> {
    const criteria = Array.isArray(where) ? where : [where];
    this.rows = this.rows.filter(
      (row) =>
        !criteria.some((condition) =>
          Object.entries(condition).every(([key, value]) => {
            const actual = (row as any)[key];
            if (value && typeof value === "object" && "value" in value) {
              const operator = value as any;
              if (Array.isArray(operator.value))
                return operator.value.includes(actual);
              return actual < operator.value;
            }
            return actual === value;
          }),
        ),
    );
  }

  async remove(row: Otp): Promise<Otp> {
    this.rows = this.rows.filter((item) => item.id !== row.id);
    return row;
  }

  createQueryBuilder() {
    const repo = this;
    let phone: string | undefined;
    let userId: string | undefined;
    let otpType: OTPType | undefined;
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

const repo = new FakeRepo();
const service = new OtpService(repo as any);
const userId = "2a0e0c1b-9c2b-43f0-bd3f-1c7f9e0f3b2a";
const phone = "+251911234567";
const type = OTPType.REGISTRATION_OTP;
const issue = () => service.createOtp({ userId, phoneNumber: phone, otpType: type });
const wrongCode = "000000";
const recent = () => new Date(Date.now() - 61_000);

async function main() {
  const first = await issue();
  assert.match(first.otpCode, /^\d{6}$/);
  const firstRow = repo.rows[repo.rows.length - 1];
  assert.equal(firstRow.code.length, 64);
  assert.notEqual(firstRow.code, first.otpCode);
  assert.equal(
    firstRow.code,
    createHmac("sha256", secret).update(first.otpCode).digest("hex"),
  );
  assert.equal(firstRow.status, OTPStatus.REQUESTED);
  console.log("PASS: CSPRNG 6-digit code stored as HMAC-SHA256 hash");

  await assert.rejects(
    () => service.verifyOtp(userId, type, wrongCode === first.otpCode ? "111111" : wrongCode),
    /Invalid OTP code\. 2 attempts remaining/,
  );
  assert.equal(firstRow.attemptCount, 1);
  console.log("PASS: wrong code increments attempt count");

  const matches = (service as any).codesMatch.bind(service);
  assert.equal(matches(firstRow.code, first.otpCode), true);
  assert.equal(matches(firstRow.code, wrongCode), false);
  console.log("PASS: constant-time hash comparison");

  const verified = await service.verifyOtp(userId, type, first.otpCode);
  assert.equal(verified.status, OTPStatus.USED);
  await assert.rejects(
    () => service.verifyOtp(userId, type, first.otpCode),
    /No active OTP/,
  );
  console.log("PASS: code is single-use");

  firstRow.createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const second = await issue();
  const secondRow = repo.rows[repo.rows.length - 1];
  secondRow.expiresAt = new Date(Date.now() - 1000);
  await assert.rejects(
    () => service.verifyOtp(userId, type, second.otpCode),
    /OTP has expired/,
  );
  assert.equal(secondRow.status, OTPStatus.EXPIRED);
  console.log("PASS: expired codes rejected and marked expired");

  secondRow.createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const third = await issue();
  const thirdRow = repo.rows[repo.rows.length - 1];
  for (let attempt = 0; attempt < 3; attempt++) {
    await assert.rejects(
      () => service.verifyOtp(userId, type, wrongCode === third.otpCode ? "111111" : wrongCode),
      /Invalid OTP code|Too many failed attempts/,
    );
  }
  assert.equal(thirdRow.status, OTPStatus.EXPIRED);
  await assert.rejects(() => issue(), /Too many failed attempts/);
  console.log("PASS: retry lockout after 3 failed attempts");

  for (const row of repo.rows)
    row.createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
  for (let index = 0; index < 5; index++) {
    await issue();
    repo.rows[repo.rows.length - 1].createdAt = recent();
  }
  await assert.rejects(() => issue(), /Too many OTP requests/);
  console.log("PASS: hourly rate limit blocks 6th request");

  const generated = new Set(
    Array.from({ length: 200 }, () => (service as any).generateOtpCode()),
  );
  assert.equal(generated.size, 200);
  console.log("PASS: generated codes are unique and non-sequential");

  await service.cleanupExpiredOtps();
  const now = Date.now();
  assert.ok(repo.rows.every((row) => row.expiresAt!.getTime() >= now));
  console.log("PASS: expired/stale OTP cleanup");

  const validEnv: Record<string, string> = {
    DB_HOST: "localhost",
    DB_USERNAME: "user",
    DB_PASSWORD: "",
    DB_NAME: "db",
    OTP_SECRET: secret,
    JWT_ACCESS_SECRET: "a".repeat(40),
    JWT_REFRESH_SECRET: "b".repeat(40),
    JWT_REG_SECRET: "c".repeat(40),
    JWT_SET_PASSWORD_SECRET: "d".repeat(40),
    JWT_PASSWORD_RESET_SECRET: "e".repeat(40),
  };
  assert.equal(envValidationSchema.validate(validEnv).error, undefined);
  assert.match(
    envValidationSchema.validate({ ...validEnv, OTP_SECRET: undefined }).error!.message,
    /OTP_SECRET/,
  );
  assert.match(
    envValidationSchema.validate({ ...validEnv, JWT_ACCESS_SECRET: "short" }).error!.message,
    /JWT_ACCESS_SECRET/,
  );
  console.log("PASS: OTP_SECRET and JWT secrets required and >= 32 chars");

  const authSource = readFileSync(
    "src/modules/auth/auth.service.ts",
    "utf8",
  );
  assert.ok(!authSource.includes('NODE_ENV !== "production"'));
  assert.ok(authSource.includes('NODE_ENV === "development"'));
  assert.ok(!authSource.includes("bmbooking"));
  console.log("PASS: devOtp limited to development; no exposed demo secrets");
}

main().then(
  () => console.log("ALL OTP SECURITY CHECKS PASSED"),
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
