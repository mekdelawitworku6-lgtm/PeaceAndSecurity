import { BadRequestException, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { createHmac, randomInt, timingSafeEqual } from "crypto";

import { Otp } from "./entities/otp.entity";
import { CreateOtpDto } from "./dto/create-otp.dto";
import { normalizeEmail, normalizeEtPhone } from "common/utils/validator";
import { OTPStatus, OTPType } from "common/enums/enums";
import {
  Repository,
  LessThan,
  In,
  FindOneOptions,
  FindOptionsWhere,
} from "typeorm";

const OTP_EXPIRY_MS = 2 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;
const OTP_LOCKOUT_MS = 15 * 60 * 1000;
const OTP_MAX_PER_HOUR = 5;
const OTP_RETENTION_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
  ) { }

  private getSecret(): string {
    const secret = process.env.OTP_SECRET;
    if (!secret) {
      throw new Error("OTP_SECRET is not configured");
    }
    return secret;
  }

  private hashOtp(code: string): Buffer {
    return createHmac("sha256", this.getSecret()).update(code).digest();
  }

  private codesMatch(storedHash: string, code: string): boolean {
    const expected = Buffer.from(storedHash, "hex");
    const actual = this.hashOtp(code);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private generateOtpCode(): string {
    return randomInt(100000, 1000000).toString();
  }

  private getExpiryTime(): Date {
    return new Date(Date.now() + OTP_EXPIRY_MS);
  }

  async createOtp(dto: CreateOtpDto) {
    const { userId, otpType } = dto;

    const email = normalizeEmail(dto.email);
    const phone = normalizeEtPhone(dto.phoneNumber);

    if (!email && !phone) {
      throw new BadRequestException(
        "Provide a valid email or phoneNumber for OTP.",
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyCounts = await Promise.all([
      phone
        ? this.otpRepository
          .createQueryBuilder("otp")
          .where("otp.phoneNumber = :phone", { phone })
          .andWhere("otp.createdAt >= :oneHourAgo", { oneHourAgo })
          .getCount()
        : Promise.resolve(0),
      this.otpRepository
        .createQueryBuilder("otp")
        .where("otp.userId = :userId AND otp.otpType = :otpType", {
          userId,
          otpType,
        })
        .andWhere("otp.createdAt >= :oneHourAgo", { oneHourAgo })
        .getCount(),
    ]);

    if (hourlyCounts.some((count) => count >= OTP_MAX_PER_HOUR)) {
      throw new BadRequestException(
        "Too many OTP requests. Please wait an hour before requesting more codes.",
      );
    }

    const existing = await this.otpRepository.findOne({
      where: { userId, otpType },
      order: { createdAt: "DESC" },
    });

    if (existing) {
      const now = new Date();
      const diffSeconds = (now.getTime() - existing.createdAt.getTime()) / 1000;

      if (existing.attemptCount >= OTP_MAX_ATTEMPTS) {
        const lockDiffMs = now.getTime() - existing.createdAt.getTime();
        if (lockDiffMs < OTP_LOCKOUT_MS) {
          throw new BadRequestException(
            `Too many failed attempts. Please try again in ${Math.ceil((OTP_LOCKOUT_MS - lockDiffMs) / 60000)} minutes.`,
          );
        }
      }

      if (existing.status === OTPStatus.REQUESTED && diffSeconds < OTP_RESEND_COOLDOWN_MS / 1000) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000 - diffSeconds)} seconds before requesting a new OTP.`,
        );
      }

      if (existing.status === OTPStatus.REQUESTED) {
        existing.status = OTPStatus.EXPIRED;
        await this.otpRepository.save(existing);
      }
    }

    const code = this.generateOtpCode();
    const otp = this.otpRepository.create({
      userId,
      otpType,
      email: email ?? null,
      phoneNumber: phone ?? null,
      code: this.hashOtp(code).toString("hex"),
      status: OTPStatus.REQUESTED,
      attemptCount: 0,
      expiresAt: this.getExpiryTime(),
    });

    await this.otpRepository.save(otp);

    return {
      message: "OTP sent successfully",
      otpCode: code,
      expiresAt: otp.expiresAt,
      channel: phone ? "PHONE" : "EMAIL",
    };
  }

  async verifyOtp(userId: string, otpType: OTPType, code: string): Promise<Otp> {
    return this.verifyOtpWithCriteria({ userId, otpType }, code);
  }

  async verifyOtpWithCriteria(
    criteria: Partial<Otp> | Partial<Otp>[],
    code: string,
  ): Promise<Otp> {
    const where = Array.isArray(criteria)
      ? criteria.map((entry) => ({ ...entry, status: OTPStatus.REQUESTED }))
      : { ...criteria, status: OTPStatus.REQUESTED };

    const otp = await this.otpRepository.findOne({
      where: where as FindOptionsWhere<Otp> | FindOptionsWhere<Otp>[],
      order: { createdAt: "DESC" },
    });

    if (!otp) throw new BadRequestException("No active OTP found. Please request a new one.");

    if (otp.expiresAt && otp.expiresAt <= new Date()) {
      await this.expireOtp(otp);
      throw new BadRequestException("OTP has expired.");
    }

    if (otp.attemptCount >= OTP_MAX_ATTEMPTS) {
      await this.expireOtp(otp);
      throw new BadRequestException(
        "Too many failed attempts. Please request a new OTP.",
      );
    }

    if (!this.codesMatch(otp.code, code)) {
      otp.attemptCount += 1;
      await this.otpRepository.save(otp);

      const remaining = OTP_MAX_ATTEMPTS - otp.attemptCount;
      if (remaining <= 0) {
        await this.expireOtp(otp);
        throw new BadRequestException(
          "Too many failed attempts. Request a new OTP.",
        );
      }
      throw new BadRequestException(`Invalid OTP code. ${remaining} attempts remaining.`);
    }

    await this.consumeOtp(otp);
    return otp;
  }

  private async expireOtp(otp: Otp): Promise<void> {
    otp.status = OTPStatus.EXPIRED;
    await this.otpRepository.save(otp);
  }

  async consumeOtp(otp: Otp): Promise<void> {
    if (otp.status !== OTPStatus.USED) {
      otp.status = OTPStatus.USED;
      await this.otpRepository.save(otp);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredOtps(): Promise<void> {
    const staleThreshold = new Date(Date.now() - OTP_RETENTION_MS);
    await this.otpRepository.delete({ expiresAt: LessThan(new Date()) });
    await this.otpRepository.delete({
      status: In([OTPStatus.USED, OTPStatus.EXPIRED]),
      createdAt: LessThan(staleThreshold),
    });
  }

  async findOneOtp(
    criteria: Partial<Otp> | Partial<Otp>[],
  ): Promise<Otp | null> {
    if (Array.isArray(criteria) && criteria.length === 0) {
      throw new BadRequestException("where cannot be an empty array");
    }
    if (!Array.isArray(criteria) && Object.keys(criteria).length === 0) {
      throw new BadRequestException("where cannot be empty");
    }

    const options: FindOneOptions<Otp> = {
      where: criteria as FindOptionsWhere<Otp> | FindOptionsWhere<Otp>[],
      order: { createdAt: "DESC" },
    };

    return this.otpRepository.findOne(options);
  }

  async removeBulkOtps(where: Partial<Otp>) {
    await this.otpRepository.delete(where);
  }

  async deleteOneOtpLatest(
    criteria: Partial<Otp> | Partial<Otp>[],
  ): Promise<Otp | null> {
    if (Array.isArray(criteria) && criteria.length === 0) {
      throw new BadRequestException("where cannot be an empty array");
    }
    if (!Array.isArray(criteria) && Object.keys(criteria).length === 0) {
      throw new BadRequestException("where cannot be empty");
    }

    const entity = await this.otpRepository.findOne({
      where: criteria as FindOptionsWhere<Otp> | FindOptionsWhere<Otp>[],
      order: { createdAt: "DESC" },
    });
    if (!entity) return null;

    await this.otpRepository.remove(entity);
    return entity;
  }
}
