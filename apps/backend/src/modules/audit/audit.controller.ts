import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole, DataAccessType } from "../../common/enums/enums";

@ApiTags("Audit Logs")
@Controller("audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiOperation({ summary: "Get audit logs (scoped by geographic level)" })
  async findAll(
    @Query() query: {
      entity?: string;
      action?: string;
      actorId?: string;
      cityId?: string;
      subcityId?: string;
      woredaId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
    @Req() req: any,
  ) {
    const result = await this.auditService.findAll(query);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_AUDIT_LOGS,
      targetEntity: "AuditLog",
      accessPath: req.originalUrl,
      description: `Viewed audit logs${query.entity ? ` for ${query.entity}` : ""}`,
    });
    return result;
  }

  @Get("export/csv")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Export audit logs as CSV" })
  async exportCsv(
    @Query() query: { entity?: string; action?: string; startDate?: string; endDate?: string },
    @Res() res: Response,
    @Req() req: any,
  ) {
    await this.auditService.logDataAccess({
      accessType: DataAccessType.EXPORT_CSV,
      targetEntity: "AuditLog",
      accessPath: req.originalUrl,
      description: `Exported audit logs to CSV`,
    });
    return this.auditService.exportCsv(query, res);
  }

  @Get("export/pdf")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Export audit logs as PDF (printable HTML)" })
  async exportPdf(
    @Query() query: { entity?: string; action?: string; startDate?: string; endDate?: string },
    @Res() res: Response,
    @Req() req: any,
  ) {
    await this.auditService.logDataAccess({
      accessType: DataAccessType.EXPORT_PDF,
      targetEntity: "AuditLog",
      accessPath: req.originalUrl,
      description: `Exported audit logs to PDF`,
    });
    return this.auditService.exportPdf(query, res);
  }

  @Get("security-events")
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiOperation({ summary: "Get security events (login, OTP, password changes)" })
  async findSecurityEvents(
    @Query() query: {
      eventType?: string;
      actorId?: string;
      success?: boolean;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
    @Req() req: any,
  ) {
    const result = await this.auditService.findSecurityEvents(query);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_AUDIT_LOGS,
      targetEntity: "SecurityEvent",
      accessPath: req.originalUrl,
      description: `Viewed security events`,
    });
    return result;
  }

  @Get("data-access-events")
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiOperation({ summary: "Get data access events (who viewed what)" })
  async findDataAccessEvents(
    @Query() query: {
      accessType?: string;
      actorId?: string;
      targetEntity?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
    @Req() req: any,
  ) {
    const result = await this.auditService.findDataAccessEvents(query);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_AUDIT_LOGS,
      targetEntity: "DataAccessEvent",
      accessPath: req.originalUrl,
      description: `Viewed data access events`,
    });
    return result;
  }

  @Get("verify-chain")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Verify audit log hash chain integrity" })
  async verifyChain(@Req() req: any) {
    const result = await this.auditService.verifyAuditChain();
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_AUDIT_LOGS,
      targetEntity: "AuditLog",
      accessPath: req.originalUrl,
      description: `Verified audit chain integrity`,
    });
    return result;
  }

  @Get("entity/:type/:id")
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiOperation({ summary: "Get full audit trail for a specific record" })
  async getEntityTrail(
    @Param("type") type: string,
    @Param("id") id: string,
    @Req() req: any,
  ) {
    const result = await this.auditService.getEntityTrail(type, id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_AUDIT_LOGS,
      targetEntity: type,
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed audit trail for ${type} record`,
    });
    return result;
  }

  @Get(":id")
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiOperation({ summary: "Get single audit log with full diff" })
  async findOne(@Param("id") id: string, @Req() req: any) {
    const result = await this.auditService.findOne(id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_AUDIT_LOGS,
      targetEntity: "AuditLog",
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed single audit log record`,
    });
    return result;
  }
}
