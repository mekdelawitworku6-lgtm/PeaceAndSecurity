import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { WorkReportsService } from "./work-reports.service";
import {
  CreateWorkReportDto,
  UpdateWorkReportDto,
  ReviewWorkReportDto,
  WorkReportFilterDto,
} from "./dto/work-report.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/enums";

@ApiTags("Work Reports")
@Controller("work-reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkReportsController {
  constructor(private readonly workReportsService: WorkReportsService) {}

  @Post()
  @Roles(
    UserRole.PATROL,
    UserRole.SYSTEM_SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
  )
  @ApiOperation({ summary: "Submit a work report (patrol/staff)" })
  async create(@Request() req: any, @Body() dto: CreateWorkReportDto) {
    return this.workReportsService.create(req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: "List work reports (patrol sees own, staff sees all)" })
  async findAll(
    @Request() req: any,
    @Query() filter: WorkReportFilterDto,
  ) {
    return this.workReportsService.findAll(req.user, filter);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a work report" })
  async findOne(@Request() req: any, @Param("id") id: string) {
    return this.workReportsService.findOne(req.user, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Edit own submitted work report" })
  async update(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateWorkReportDto,
  ) {
    return this.workReportsService.update(req.user, id, dto);
  }

  @Patch(":id/review")
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
  @ApiOperation({ summary: "Approve or reject a work report (staff)" })
  async review(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: ReviewWorkReportDto,
  ) {
    return this.workReportsService.review(req.user, id, dto);
  }

  @Delete(":id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN)
  @ApiOperation({ summary: "Delete a work report (super admin only)" })
  async remove(@Param("id") id: string) {
    return this.workReportsService.remove(id);
  }
}
