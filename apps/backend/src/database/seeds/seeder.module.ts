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
import { AdminSeederService } from "./admin-seeder.service";
import { ReportTypeSeederService } from "./report-type-seeder.service";
import { ChatSeederService } from "./chat-seeder.service";
import { AuditSeederService } from "./audit-seeder.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
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
  ],
  exports: [
    AdminSeederService,
    ReportTypeSeederService,
    ChatSeederService,
    AuditSeederService,
  ],
})
export class SeederModule {}
