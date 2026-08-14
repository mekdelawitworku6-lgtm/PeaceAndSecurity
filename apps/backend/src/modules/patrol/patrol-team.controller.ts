import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PatrolTeamService } from "./patrol-team.service";
import { CreatePatrolTeamDto, UpdatePatrolTeamDto, AddTeamMemberDto } from "./dto/patrol-team.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole, DataAccessType } from "../../common/enums/enums";
import { AuditService } from "../audit/audit.service";

@ApiTags("Patrol Teams")
@Controller("patrol-teams")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PatrolTeamController {
  constructor(
    private readonly teamService: PatrolTeamService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @Roles(UserRole.POLICE_COMMANDER_WOREDA)
  @ApiOperation({ summary: "Create a patrol team (Woreda Police Commander only)" })
  async create(@Body() dto: CreatePatrolTeamDto) {
    return this.teamService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all patrol teams (filtered by woreda)" })
  async findAll(@Query() query: { woredaId?: string; page?: number; limit?: number }, @Req() req: any) {
    const result = await this.teamService.findAll(query);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_PATROL_TEAM_LIST,
      targetEntity: "PatrolTeam",
      accessPath: req.originalUrl,
      description: `Listed patrol teams`,
    });
    return result;
  }

  @Get("my")
  @Roles(UserRole.PATROL)
  @ApiOperation({ summary: "Get my patrol team (Patrol only)" })
  async getMyTeam(@Req() req: any) {
    return this.teamService.findMyTeam(req.user?.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get patrol team by ID" })
  async findOne(@Param("id") id: string, @Req() req: any) {
    const result = await this.teamService.findOne(id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_PATROL_TEAM_LIST,
      targetEntity: "PatrolTeam",
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed patrol team detail`,
    });
    return result;
  }

  @Patch(":id")
  @Roles(UserRole.POLICE_COMMANDER_WOREDA)
  @ApiOperation({ summary: "Update patrol team (Woreda Police Commander only)" })
  async update(@Param("id") id: string, @Body() dto: UpdatePatrolTeamDto) {
    return this.teamService.update(id, dto);
  }

  @Delete(":id")
  @Roles(UserRole.POLICE_COMMANDER_WOREDA)
  @ApiOperation({ summary: "Delete patrol team (Woreda Police Commander only)" })
  async remove(@Param("id") id: string) {
    return this.teamService.remove(id);
  }

  @Post(":id/members")
  @Roles(UserRole.POLICE_COMMANDER_WOREDA)
  @ApiOperation({ summary: "Add patrol officer to team (Woreda Police Commander only)" })
  async addMember(@Param("id") id: string, @Body() dto: AddTeamMemberDto) {
    return this.teamService.addMember(id, dto.patrolId);
  }

  @Delete(":id/members/:patrolId")
  @Roles(UserRole.POLICE_COMMANDER_WOREDA)
  @ApiOperation({ summary: "Remove patrol officer from team (Woreda Police Commander only)" })
  async removeMember(@Param("id") id: string, @Param("patrolId") patrolId: string) {
    return this.teamService.removeMember(id, patrolId);
  }
}
