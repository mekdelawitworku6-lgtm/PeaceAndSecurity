import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "../../modules/user/entities/user.entity";
import { Patrol } from "../../modules/patrol/entities/patrol.entity";
import { Citizen } from "../../modules/citizen/entities/citizen.entity";
import { City } from "../../modules/geo/entities/city.entity";
import { Subcity } from "../../modules/geo/entities/subcity.entity";
import { Woreda } from "../../modules/geo/entities/woreda.entity";
import {
  UserRole,
  UserStatus,
  PreferredLanguage,
  VerificationStatus,
  DevicePlatform,
} from "../../common/enums/enums";
import { hashPassword } from "../../common/utils/password.util";

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedAllRoles();
  }

  async seedAdmin() {
    await this.seedAllRoles();
  }

  async seedAllRoles() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const userRepo: Repository<User> = this.dataSource.getRepository(User);
    const patrolRepo: Repository<Patrol> = this.dataSource.getRepository(Patrol);
    const citizenRepo: Repository<Citizen> = this.dataSource.getRepository(Citizen);
    const cityRepo: Repository<City> = this.dataSource.getRepository(City);
    const subcityRepo: Repository<Subcity> = this.dataSource.getRepository(Subcity);
    const woredaRepo: Repository<Woreda> = this.dataSource.getRepository(Woreda);

    const defaultPassword = await hashPassword("admin123");
    const defaultPin = await hashPassword("1234");

    const city = await cityRepo.findOne({ where: { code: "AA" } });
    const subcity = await subcityRepo.findOne({ where: { code: "BOLE" } });
    const woreda = await woredaRepo.findOne({ where: { code: "WRD-01" } });

    const staffUsers = [
      {
        fullName: "System Super Admin",
        phoneNumber: process.env.SEED_ADMIN_PHONE ?? "+251900000000",
        email: (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase(),
        role: UserRole.SYSTEM_SUPER_ADMIN,
        userCode: "USR-0001",
      },
      {
        fullName: "System Admin",
        phoneNumber: "+251911000001",
        email: "sysadmin@peace.gov.et",
        role: UserRole.SYSTEM_ADMIN,
        userCode: "USR-0002",
      },
      {
        fullName: "Peace Super Admin",
        phoneNumber: "+251911000002",
        email: "peace.admin@peace.gov.et",
        role: UserRole.PEACE_SUPER_ADMIN,
        cityId: city?.id,
        userCode: "USR-0003",
      },
      {
        fullName: "Peace Officer Subcity",
        phoneNumber: "+251911000003",
        email: "peace.subcity@peace.gov.et",
        role: UserRole.PEACE_OFFICER_SUBCITY,
        cityId: city?.id,
        subcityId: subcity?.id,
        userCode: "USR-0004",
      },
      {
        fullName: "Peace Officer Woreda",
        phoneNumber: "+251911000004",
        email: "peace.woreda@peace.gov.et",
        role: UserRole.PEACE_OFFICER_WOREDA,
        cityId: city?.id,
        subcityId: subcity?.id,
        woredaId: woreda?.id,
        userCode: "USR-0005",
      },
      {
        fullName: "Police Commander City",
        phoneNumber: "+251911000005",
        email: "police.city@peace.gov.et",
        role: UserRole.POLICE_COMMANDER_CITY,
        cityId: city?.id,
        userCode: "USR-0006",
      },
      {
        fullName: "Police Commander Subcity",
        phoneNumber: "+251911000006",
        email: "police.subcity@peace.gov.et",
        role: UserRole.POLICE_COMMANDER_SUBCITY,
        cityId: city?.id,
        subcityId: subcity?.id,
        userCode: "USR-0007",
      },
      {
        fullName: "Police Commander Woreda",
        phoneNumber: "+251911000007",
        email: "police.woreda@peace.gov.et",
        role: UserRole.POLICE_COMMANDER_WOREDA,
        cityId: city?.id,
        subcityId: subcity?.id,
        woredaId: woreda?.id,
        userCode: "USR-0008",
      },
      // Viewers
      {
        fullName: "Super Admin Viewer",
        phoneNumber: "+251911000020",
        email: "viewer.super@peace.gov.et",
        role: UserRole.SYSTEM_SUPER_ADMIN_VIEWER,
        userCode: "USR-0020",
      },
      {
        fullName: "Admin Viewer",
        phoneNumber: "+251911000021",
        email: "viewer.admin@peace.gov.et",
        role: UserRole.SYSTEM_ADMIN_VIEWER,
        userCode: "USR-0021",
      },
      {
        fullName: "Peace Super Admin Viewer",
        phoneNumber: "+251911000022",
        email: "viewer.peace@peace.gov.et",
        role: UserRole.PEACE_SUPER_ADMIN_VIEWER,
        cityId: city?.id,
        userCode: "USR-0022",
      },
      {
        fullName: "Peace Subcity Viewer",
        phoneNumber: "+251911000023",
        email: "viewer.peace.sub@peace.gov.et",
        role: UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
        cityId: city?.id,
        subcityId: subcity?.id,
        userCode: "USR-0023",
      },
      {
        fullName: "Peace Woreda Viewer",
        phoneNumber: "+251911000024",
        email: "viewer.peace.wor@peace.gov.et",
        role: UserRole.PEACE_OFFICER_WOREDA_VIEWER,
        cityId: city?.id,
        subcityId: subcity?.id,
        woredaId: woreda?.id,
        userCode: "USR-0024",
      },
      {
        fullName: "Police City Viewer",
        phoneNumber: "+251911000025",
        email: "viewer.police.city@peace.gov.et",
        role: UserRole.POLICE_COMMANDER_CITY_VIEWER,
        cityId: city?.id,
        userCode: "USR-0025",
      },
      {
        fullName: "Police Subcity Viewer",
        phoneNumber: "+251911000026",
        email: "viewer.police.sub@peace.gov.et",
        role: UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
        cityId: city?.id,
        subcityId: subcity?.id,
        userCode: "USR-0026",
      },
      {
        fullName: "Police Woreda Viewer",
        phoneNumber: "+251911000027",
        email: "viewer.police.wor@peace.gov.et",
        role: UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
        cityId: city?.id,
        subcityId: subcity?.id,
        woredaId: woreda?.id,
        userCode: "USR-0027",
      },
    ];

    for (const u of staffUsers) {
      const existing = await userRepo.findOne({
        where: [{ email: u.email }, { phoneNumber: u.phoneNumber }],
      });

      if (existing) {
        existing.fullName = u.fullName;
        existing.phoneNumber = u.phoneNumber;
        existing.email = u.email;
        existing.role = u.role;
        existing.password = defaultPassword;
        existing.isPasswordSet = true;
        existing.isPhoneVerified = true;
        existing.isEmailVerified = true;
        existing.status = UserStatus.ACTIVE;
        existing.isStaffUser = true;
        existing.cityId = u.cityId ?? null as any;
        existing.subcityId = u.subcityId ?? null as any;
        existing.woredaId = u.woredaId ?? null as any;
        await userRepo.save(existing);
      } else {
        const user = userRepo.create({
          fullName: u.fullName,
          phoneNumber: u.phoneNumber,
          email: u.email,
          role: u.role,
          status: UserStatus.ACTIVE,
          isStaffUser: true,
          password: defaultPassword,
          isPasswordSet: true,
          isPhoneVerified: true,
          isEmailVerified: true,
          userCode: u.userCode,
          cityId: u.cityId,
          subcityId: u.subcityId,
          woredaId: u.woredaId,
        });
        await userRepo.save(user);
      }
    }
    console.log("✔ Seeded all 16 staff and viewer roles");

    // Seed Patrols
    const patrolsData = [
      { fullName: "Patrol Officer 1", phoneNumber: "+251911000011", email: "officer1@peace.gov.et", userCode: "PTR-0001" },
      { fullName: "Patrol Officer 2", phoneNumber: "+251911000012", email: "officer2@peace.gov.et", userCode: "PTR-0002" },
      { fullName: "Patrol Officer 3", phoneNumber: "+251911000013", email: "officer3@peace.gov.et", userCode: "PTR-0003" },
    ];

    for (const p of patrolsData) {
      const existing = await patrolRepo.findOne({
        where: [{ phoneNumber: p.phoneNumber }, { email: p.email }],
      });
      if (existing) {
        existing.pin = defaultPin;
        existing.isPinSet = true;
        existing.status = UserStatus.ACTIVE;
        existing.woredaId = woreda?.id;
        await patrolRepo.save(existing);
      } else {
        const patrol = patrolRepo.create({
          fullName: p.fullName,
          phoneNumber: p.phoneNumber,
          email: p.email,
          pin: defaultPin,
          isPinSet: true,
          status: UserStatus.ACTIVE,
          userCode: p.userCode,
          woredaId: woreda?.id,
        });
        await patrolRepo.save(patrol);
      }
    }
    console.log("✔ Seeded patrol test accounts");

    // Seed Citizens
    const citizensData = [
      { fullName: "Abebe Kebede", phoneNumber: "+251911000031", email: "abebe.kebede@gmail.com", userCode: "CIT-0001" },
      { fullName: "Hiwot Tesfaye", phoneNumber: "+251911000032", email: "hiwot.tesfaye@gmail.com", userCode: "CIT-0002" },
      { fullName: "Dawit Mekonnen", phoneNumber: "+251911000033", email: "dawit.mekonnen@gmail.com", userCode: "CIT-0003" },
    ];

    for (const c of citizensData) {
      const existing = await citizenRepo.findOne({
        where: [{ phoneNumber: c.phoneNumber }],
      });
      if (existing) {
        existing.pin = defaultPin;
        existing.isPinSet = true;
        existing.status = UserStatus.ACTIVE;
        await citizenRepo.save(existing);
      } else {
        const citizen = citizenRepo.create({
          fullName: c.fullName,
          phoneNumber: c.phoneNumber,
          email: c.email,
          pin: defaultPin,
          isPinSet: true,
          status: UserStatus.ACTIVE,
          verificationStatus: VerificationStatus.VERIFIED,
          devicePlatform: DevicePlatform.ANDROID,
          preferredLanguage: PreferredLanguage.AMHARIC,
          appVersion: "1.0.0",
          userCode: c.userCode,
        });
        await citizenRepo.save(citizen);
      }
    }
    console.log("✔ Seeded citizen test accounts");
  }
}

