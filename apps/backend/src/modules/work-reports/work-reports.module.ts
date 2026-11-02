import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkReport } from "./entities/work-report.entity";
import { WorkReportsService } from "./work-reports.service";
import { WorkReportsController } from "./work-reports.controller";
import { User } from "../user/entities/user.entity";
import { Patrol } from "../patrol/entities/patrol.entity";
import { Woreda } from "../geo/entities/woreda.entity";

@Module({
  imports: [TypeOrmModule.forFeature([WorkReport, User, Patrol, Woreda])],
  controllers: [WorkReportsController],
  providers: [WorkReportsService],
  exports: [WorkReportsService],
})
export class WorkReportsModule {}
