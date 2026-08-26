import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "../../modules/user/entities/user.entity";
import { ReportType } from "../../modules/report-types/entities/report-type.entity";
import { Citizen } from "../../modules/citizen/entities/citizen.entity";
import { Report } from "../../modules/reports/entities/report.entity";
import { ReportLog } from "../../modules/reports/entities/report-log.entity";
import { Conversation } from "../../modules/chat/entities/conversation.entity";
import { Message } from "../../modules/chat/entities/message.entity";
import { Camera } from "../../modules/cameras/entities/camera.entity";
import { CameraAlert } from "../../modules/cameras/entities/camera-alert.entity";
import { Notification } from "../../modules/notifications/entities/notification.entity";
import { Setting } from "../../modules/settings/setting.entity";
import { Patrol } from "../../modules/patrol/entities/patrol.entity";
import { City } from "../../modules/geo/entities/city.entity";
import { Subcity } from "../../modules/geo/entities/subcity.entity";
import { Woreda } from "../../modules/geo/entities/woreda.entity";
import { AdminSeederService } from "./admin-seeder.service";
import { ReportTypeSeederService } from "./report-type-seeder.service";
import { DemoDataSeederService } from "./demo-data-seeder.service";
import { GeoSeederService } from "./geo-seeder.service";

dotenv.config();

async function runSeeds() {
    const dataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || "postgres",
        password: String(process.env.DB_PASSWORD ?? "postgres"),
        database: process.env.DB_NAME || "peace_and_security",
        entities: [
            User,
            ReportType,
            Citizen,
            Report,
            ReportLog,
            Conversation,
            Message,
            Camera,
            CameraAlert,
            Notification,
            Setting,
            Patrol,
            City,
            Subcity,
            Woreda,
        ],
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log("✔ Database connected for seeding");

        const geoSeeder = new GeoSeederService(dataSource);
        const reportTypeSeeder = new ReportTypeSeederService(dataSource);
        const adminSeeder = new AdminSeederService(dataSource);
        const demoSeeder = new DemoDataSeederService(dataSource);

        console.log("\n--- Seeding Geo Hierarchy ---");
        await geoSeeder.seedGeoHierarchy();

        console.log("\n--- Seeding Report Types ---");
        await reportTypeSeeder.seedReportTypes();

        console.log("\n--- Seeding Roles & Users ---");
        await adminSeeder.seedAllRoles();

        console.log("\n--- Seeding Settings ---");
        await demoSeeder.seedSettings();

        console.log("\n✔ All seeding operations complete");
    } catch (error) {
        console.error("✘ Seeding failed:", error);
        process.exit(1);
    } finally {
        await dataSource.destroy();
    }
}

runSeeds();
