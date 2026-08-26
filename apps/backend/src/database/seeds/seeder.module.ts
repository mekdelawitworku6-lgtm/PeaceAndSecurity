import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../modules/user/entities/user.entity";
import { ReportType } from "../../modules/report-types/entities/report-type.entity";
import { Conversation } from "../../modules/chat/entities/conversation.entity";
import { Message } from "../../modules/chat/entities/message.entity";
import { Report } from "../../modules/reports/entities/report.entity";
import { SecurityEvent } from "../../modules/audit/entities/security-event.entity";
import { DataAccessEvent } from "../../modules/audit/entities/data-access-event.entity";
import { AuditLog } from "../../modules/audit/entities/audit-log.entity";
import { City } from "../../modules/geo/entities/city.entity";
import { Subcity } from "../../modules/geo/entities/subcity.entity";
import { Woreda } from "../../modules/geo/entities/woreda.entity";
import { Patrol } from "../../modules/patrol/entities/patrol.entity";
import { Citizen } from "../../modules/citizen/entities/citizen.entity";
import { AdminSeederService } from "./admin-seeder.service";
import { ReportTypeSeederService } from "./report-type-seeder.service";
import { ChatSeederService } from "./chat-seeder.service";
import { AuditSeederService } from "./audit-seeder.service";
import { DemoDataSeederService } from "./demo-data-seeder.service";
import { GeoSeederService } from "./geo-seeder.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Patrol,
      Citizen,
      City,
      Subcity,
      Woreda,
      ReportType,
      Conversation,
      Message,
      Report,
      SecurityEvent,
      DataAccessEvent,
      AuditLog,
    ]),
  ],
  providers: [
    AdminSeederService,
    ReportTypeSeederService,
    ChatSeederService,
    AuditSeederService,
    DemoDataSeederService,
    GeoSeederService,
  ],
  exports: [
    AdminSeederService,
    ReportTypeSeederService,
    ChatSeederService,
    AuditSeederService,
    DemoDataSeederService,
    GeoSeederService,
  ],
})
export class SeederModule {}
