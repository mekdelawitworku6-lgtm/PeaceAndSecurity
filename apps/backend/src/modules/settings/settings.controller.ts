import { Controller, Get, Put, Body, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SettingsService } from "./settings.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuditService } from "../audit/audit.service";
import { DataAccessType } from "../../common/enums/enums";

@ApiTags("Settings")
@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard("jwt"))
@Controller("settings")
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  async getAll(@Req() req: any) {
    const result = await this.settingsService.getAll();
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_SETTINGS,
      targetEntity: "Setting",
      accessPath: req.originalUrl,
      description: `Viewed all system settings`,
    });
    return result;
  }

  @Put()
  async updateMany(@Body() body: Record<string, string>) {
    await this.settingsService.setMany(body);
    return this.settingsService.getAll();
  }
}
