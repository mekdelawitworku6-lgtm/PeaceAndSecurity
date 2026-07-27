import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CamerasService } from "./cameras.service";
import { CamerasController } from "./cameras.controller";
import { Camera } from "./entities/camera.entity";
import { CameraAlert } from "./entities/camera-alert.entity";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Camera, CameraAlert]),
    NotificationsModule,
    AuditModule,
  ],
  controllers: [CamerasController],
  providers: [CamerasService],
  exports: [CamerasService],
})
export class CamerasModule {}
