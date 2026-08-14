import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { processUploads } from "../../common/utils/file-upload.util";
import { ReportsService } from "./reports.service";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { UserRole, ReportStatus, DataAccessType } from "../../common/enums/enums";
import {
  CreateReportDto,
  AssignPatrolDto,
  PatrolFollowUpDto,
  CreateReportFormDto,
  PatrolFollowUpFormDto,
} from "./dto/report.dto";
import { OptionalJwtAuthGuard } from "../../common/guards/optional-jwt-auth.guard";
import { successResponse } from "../../common/types/service-response";
import { AuditService } from "../audit/audit.service";

@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly auditService: AuditService,
  ) { }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Create a new report (Public - from Citizen App)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateReportFormDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "images", maxCount: 15 },
        { name: "video", maxCount: 10 },
        { name: "audio", maxCount: 10 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
    @UploadedFiles()
    files: { images?: any[]; video?: any[]; audio?: any[] },
  ) {
    const userId = req.user?.id;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
    const report = await this.reportsService.create(createReportDto, userId, files, ipAddress);
    return successResponse("Report created successfully", report);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PATROL,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiBearerAuth()
  async findAll(@Query() query: any, @Request() req: any) {
    const result = await this.reportsService.findAll(query);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_REPORT_LIST,
      targetEntity: "Report",
      accessPath: req.originalUrl,
      description: `Listed reports (page ${query.page || 1})${query.status ? `, status: ${query.status}` : ""}${query.violationType ? `, type: ${query.violationType}` : ""}`,
    });
    return result;
  }

  @Get("my-reports")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findMyReports(@Request() req: any) {
    const reports = await this.reportsService.findByCitizen(req.user.id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_REPORT_LIST,
      targetEntity: "Report",
      accessPath: req.originalUrl,
      description: `Viewed own reports`,
    });
    return successResponse("My reports retrieved", reports);
  }

  @Get("assigned-to-me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATROL)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get reports assigned to the currently logged-in patrol officer" })
  async findAssignedToMe(@Request() req: any) {
    const reports = await this.reportsService.findByPatrol(req.user.id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_ASSIGNED_REPORTS,
      targetEntity: "Report",
      accessPath: req.originalUrl,
      description: `Viewed reports assigned to self`,
    });
    return successResponse("Assigned reports retrieved", reports);
  }

  @Get("nearby")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATROL)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get reports near patrol officer's registered office address",
  })
  async findNearby(@Request() req: any, @Query() query: any) {
    const radiusKm = query.radiusKm ? Number(query.radiusKm) : 10;
    const result = await this.reportsService.findNearbyForPatrol(
      req.user.id,
      radiusKm,
      query,
    );
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_NEARBY_REPORTS,
      targetEntity: "Report",
      accessPath: req.originalUrl,
      description: `Viewed nearby reports within ${radiusKm}km`,
    });
    return result;
  }

  @Get("nearby-citizen")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get reports near citizen's current location" })
  async findNearbyForCitizen(
    @Request() req: any,
    @Query() query: any,
  ) {
    const lat = Number(query.lat);
    const lng = Number(query.lng);
    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException("lat and lng query parameters are required");
    }
    const radiusKm = query.radiusKm ? Number(query.radiusKm) : 10;
    const result = await this.reportsService.findNearbyForCitizen(
      lat,
      lng,
      radiusKm,
      query,
    );
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_NEARBY_REPORTS,
      targetEntity: "Report",
      accessPath: req.originalUrl,
      description: `Citizen viewed nearby reports within ${radiusKm}km`,
    });
    return result;
  }


  @Get("stats")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Public home screen stats (monthly reports, avg response time)" })
  async getHomeStats() {
    const stats = await this.reportsService.getHomeStats();
    return successResponse("Home stats retrieved", stats);
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a report by ID (public view for citizens/guests)" })
  async findOne(@Param("id") id: string, @Request() req: any) {
    const report = await this.reportsService.findOne(id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_REPORT_DETAIL,
      targetEntity: "Report",
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed report detail (case: ${report.caseId})`,
    });
    return successResponse("Report retrieved", report);
  }

  @Public()
  @Get("track/:caseId")
  @ApiOperation({ summary: "Track a report by Case ID (Public)" })
  async trackReport(@Param("caseId") caseId: string) {
    const report = await this.reportsService.findByCaseId(caseId);
    return successResponse("Report found", report);
  }

  @Get(":id/history")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async getHistory(@Param("id") id: string, @Request() req: any) {
    const history = await this.reportsService.getHistory(id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_REPORT_HISTORY,
      targetEntity: "Report",
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed report history`,
    });
    return successResponse("Report history retrieved", history);
  }

  @Patch(":id/assign")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiBearerAuth()
  async assign(@Param("id") id: string, @Body() dto: AssignPatrolDto) {
    const report = await this.reportsService.assignPatrol(id, dto.patrolId);
    return successResponse("Patrol assigned successfully", report);
  }

  @Get(":id/nearby-patrols")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get nearby patrols for a specific report (Admin only)" })
  async findNearbyPatrols(@Param("id") id: string, @Query("radiusKm") radiusKm?: number, @Request() req?: any) {
    const patrols = await this.reportsService.findNearbyPatrolsForReport(id, radiusKm);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_NEARBY_PATROLS,
      targetEntity: "Report",
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed nearby patrols for report`,
    });
    return successResponse("Nearby patrols retrieved", patrols);
  }

  @Patch(":id/accept")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATROL)
  @ApiBearerAuth()
  async accept(@Param("id") id: string, @Request() req: any) {
    const report = await this.reportsService.patrolAccept(id, req.user.id);
    return successResponse("Report accepted", report);
  }

  @Patch(":id/follow-up")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATROL)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: PatrolFollowUpFormDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "patrolEvidence", maxCount: 5 }], {
      storage: memoryStorage(),
    }),
  )
  async followUp(
    @Param("id") id: string,
    @Body() data: PatrolFollowUpDto,
    @Request() req: any,
    @UploadedFiles() files: { patrolEvidence?: any[] },
  ) {
    const report = await this.reportsService.patrolFollowUp(
      id,
      req.user.id,
      data,
      files,
    );
    return successResponse("Follow-up submitted", report);
  }

  @Patch(":id/close")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.PATROL,
    UserRole.SYSTEM_ADMIN,
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiBearerAuth()
  async close(@Param("id") id: string, @Request() req: any) {
    const report = await this.reportsService.closeReport(
      id,
      req.user.id,
      req.user.role,
    );
    return successResponse("Report closed", report);
  }

  @Patch(":id/review")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
  )
  @ApiBearerAuth()
  async review(
    @Param("id") id: string,
    @Body() dto: { status: ReportStatus; rejectionReason?: string },
    @Request() req: any,
  ) {
    const report = await this.reportsService.reviewReport(
      id,
      req.user.id,
      dto.status,
      dto.rejectionReason,
    );
    return successResponse("Report reviewed", report);
  }

  @Patch(":id/escalate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATROL)
  @ApiBearerAuth()
  async escalate(
    @Param("id") id: string,
    @Body() dto: { notes: string },
    @Request() req: any,
  ) {
    const report = await this.reportsService.escalateReport(
      id,
      req.user.id,
      dto.notes,
    );
    return successResponse("Report escalated", report);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.POLICE_COMMANDER_CITY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a report (Admin only)" })
  async remove(@Param("id") id: string) {
    await this.reportsService.remove(id);
    return successResponse("Report deleted successfully");
  }

  @Get("export/csv")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.POLICE_COMMANDER_CITY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: "Export reports to CSV (Admin only)" })
  async exportCsv(@Query() query: any, @Request() req: any) {
    const csv = await this.reportsService.exportToCsv(query);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.EXPORT_CSV,
      targetEntity: "Report",
      accessPath: req.originalUrl,
      description: `Exported reports to CSV`,
    });
    return csv;
  }
}
