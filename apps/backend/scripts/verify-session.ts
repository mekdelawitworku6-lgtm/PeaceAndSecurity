import "reflect-metadata";
import * as assert from "node:assert/strict";

process.env.JWT_ACCESS_SECRET = "jwt-access-secret-".repeat(2);
process.env.JWT_REFRESH_SECRET = "jwt-refresh-secret-".repeat(2);
process.env.JWT_REG_SECRET = "jwt-registration-secret-".repeat(2);
process.env.JWT_SET_PASSWORD_SECRET = "jwt-set-password-secret-".repeat(2);
process.env.JWT_PASSWORD_RESET_SECRET = "jwt-password-reset-secret-".repeat(2);

const redisUtil = require("../src/common/utils/redis.service");
Object.assign(redisUtil, {
  redisGet: async () => null,
  redisSet: async () => "OK",
  redisDel: async () => 1,
  isTokenBlacklisted: async () => false,
  blacklistToken: async () => undefined,
});

const { JwtService } = require("@nestjs/jwt");
const { AuthService } = require("../src/modules/auth/auth.service");
const { hashPassword } = require("../src/common/utils/password.util");
const { UserRole, UserStatus } = require("../src/common/enums/enums");

class EntityRepo {
  rows: any[];

  constructor(rows: any[]) {
    this.rows = rows;
  }

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

  async query(): Promise<any[]> {
    return [];
  }

  createQueryBuilder() {
    const repo = this;
    let criteria: Record<string, any> = {};
    return {
      addSelect() {
        return this;
      },
      where(_sql: string, params: Record<string, any>) {
        criteria = params ?? {};
        return this;
      },
      async getOne() {
        return (
          repo.rows.find((row) =>
            Object.entries(criteria).every(([key, value]) => {
              const column = key === "phone" ? "phoneNumber" : key;
              return row[column] === value;
            }),
          ) ?? null
        );
      },
    };
  }
}

async function main() {
  const phoneNumber = "+251911234567";
  const citizen = {
    id: "citizen-session-1",
    fullName: "Test Citizen",
    phoneNumber,
    pin: await hashPassword("482915"),
    isPinSet: true,
    status: UserStatus.ACTIVE,
    tokenVersion: 0,
  };
  const citizenRepo = new EntityRepo([citizen]);
  const jwtService = new JwtService({});
  const auth = new AuthService(
    new EntityRepo([]) as any,
    new EntityRepo([]) as any,
    citizenRepo as any,
    { query: async () => [] } as any,
    {} as any,
    jwtService,
    { logSecurityEvent: async () => undefined } as any,
  );

  const login = await auth.citizenLogin(phoneNumber, "482915");
  assert.equal(login.success, true, login.message);
  const accessPayload: any = jwtService.verify(login.data.accessToken, {
    secret: process.env.JWT_ACCESS_SECRET,
  });
  const refreshPayload: any = jwtService.verify(login.data.refreshToken, {
    secret: process.env.JWT_REFRESH_SECRET,
  });
  assert.equal(accessPayload.tokenVersion, 0);
  assert.equal(typeof accessPayload.jti, "string");
  assert.equal(refreshPayload.tokenVersion, 0);
  assert.equal(typeof refreshPayload.jti, "string");
  console.log("PASS: login tokens carry tokenVersion and jti");

  const changed = await auth.changePin(
    citizen.id,
    "482915",
    "839201",
    UserRole.CITIZEN,
  );
  assert.equal(changed.success, true, changed.message);
  assert.equal(citizen.tokenVersion, 1);
  console.log("PASS: PIN change invalidates existing token versions");

  const relogin = await auth.citizenLogin(phoneNumber, "839201");
  assert.equal(relogin.success, true, relogin.message);
  const nextPayload: any = jwtService.verify(relogin.data.accessToken, {
    secret: process.env.JWT_ACCESS_SECRET,
  });
  assert.equal(nextPayload.tokenVersion, 1);
  console.log("PASS: new login uses the bumped token version");

  const stale = await auth.refreshUserToken(login.data.refreshToken);
  assert.equal(stale.success, false);
  assert.match(stale.message, /terminated|revoked|User not found or inactive/i);
  console.log("PASS: stale refresh token is rejected after credential change");
}

main().then(
  () => console.log("ALL SESSION CHECKS PASSED"),
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
