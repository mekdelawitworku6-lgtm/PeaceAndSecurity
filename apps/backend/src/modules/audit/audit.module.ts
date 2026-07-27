import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";
import { AuditLog } from "./entities/audit-log.entity";
import { SecurityEvent } from "./entities/security-event.entity";
import { DataAccessEvent } from "./entities/data-access-event.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, SecurityEvent, DataAccessEvent])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
