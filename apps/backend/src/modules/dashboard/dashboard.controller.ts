import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { successResponse } from "../../common/types/service-response";
import { AuditService } from "../audit/audit.service";
import { DataAccessType } from "../../common/enums/enums";

@ApiTags("Dashboard")
@ApiBearerAuth()
@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly auditService: AuditService,
  ) { }

  @Get("stats")
  @ApiOperation({ summary: "Get dashboard statistics and trends" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  async getStats(@Req() req: any) {
    const stats = await this.dashboardService.getStats(req.user);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_DASHBOARD_STATS,
      targetEntity: "Dashboard",
      accessPath: req.originalUrl,
      description: `Viewed dashboard statistics`,
    });
    return successResponse("Dashboard statistics retrieved", stats);
  }

  @Get("fleet-locations")
  @ApiOperation({ summary: "Get real-time locations of all active patrols and citizens" })
  @ApiResponse({
    status: 200,
    description: "Fleet locations retrieved successfully",
  })
  async getFleetLocations(@Req() req: any) {
    const data = await this.dashboardService.getFleetLocations();
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_DASHBOARD_FLEET,
      targetEntity: "Patrol",
      accessPath: req.originalUrl,
      description: `Viewed fleet locations (real-time GPS)`,
    });
    return successResponse("Fleet locations retrieved", data);
  }

  @Get("recent-reports")
  @ApiOperation({ summary: "Get latest 10 reports" })
  @ApiResponse({
    status: 200,
    description: "Recent reports retrieved successfully",
  })
  async getRecentReports(@Req() req: any) {
    const data = await this.dashboardService.getRecentReports();
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_DASHBOARD_RECENT,
      targetEntity: "Report",
      accessPath: req.originalUrl,
      description: `Viewed recent reports`,
    });
    return successResponse("Recent reports retrieved", data);
  }

  @Get("analytics")
  @ApiOperation({ summary: "Get analytics data (time-range based)" })
  @ApiResponse({
    status: 200,
    description: "Analytics data retrieved successfully",
  })
  async getAnalytics(
    @Query("timeRange") timeRange: string,
    @Req() req: any,
  ) {
    const data = await this.dashboardService.getAnalytics(
      timeRange || "week",
      req.user,
    );
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_DASHBOARD_ANALYTICS,
      targetEntity: "Dashboard",
      accessPath: req.originalUrl,
      description: `Viewed analytics (${timeRange || "week"})`,
    });
    return successResponse("Analytics data retrieved", data);
  }
}
