import {
  Controller,
  Get,
  Param,
  Query,
  Res,
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
import { UserRole } from "../../common/enums/enums";

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
  ) {
    return this.auditService.findAll(query);
  }

  @Get("export/csv")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Export audit logs as CSV" })
  async exportCsv(
    @Query() query: { entity?: string; action?: string; startDate?: string; endDate?: string },
    @Res() res: Response,
  ) {
    return this.auditService.exportCsv(query, res);
  }

  @Get("export/pdf")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Export audit logs as PDF (printable HTML)" })
  async exportPdf(
    @Query() query: { entity?: string; action?: string; startDate?: string; endDate?: string },
    @Res() res: Response,
  ) {
    return this.auditService.exportPdf(query, res);
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
  ) {
    return this.auditService.getEntityTrail(type, id);
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
  async findOne(@Param("id") id: string) {
    return this.auditService.findOne(id);
  }
}
