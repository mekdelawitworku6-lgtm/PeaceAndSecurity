import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { PatrolController } from "./patrol.controller";
import { PatrolService } from "./patrol.service";
import { Patrol } from "./entities/patrol.entity";
import { PatrolTeam } from "./entities/patrol-team.entity";
import { Woreda } from "../geo/entities/woreda.entity";
import { PatrolTeamController } from "./patrol-team.controller";
import { PatrolTeamService } from "./patrol-team.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Patrol, PatrolTeam, Woreda]),
    MulterModule.register({ storage: require("multer").memoryStorage() }),
    AuditModule,
  ],
  controllers: [PatrolController, PatrolTeamController],
  providers: [PatrolService, PatrolTeamService],
  exports: [PatrolService, PatrolTeamService],
})
export class PatrolModule {}
