import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { processUploads } from "../../common/utils/file-upload.util";
import { CitizenService } from "./citizen.service";
import { CreateCitizenDto, CreateCitizenFormDto } from "./dto/create-citizen.dto";
import { UpdateCitizenDto, UpdateCitizenFormDto } from "./dto/update-citizen.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/enums";
import { AuditService } from "../audit/audit.service";
import { DataAccessType } from "../../common/enums/enums";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";



@ApiTags("Citizens")
@Controller("citizens")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CitizenController {
  constructor(
    private readonly citizenService: CitizenService,
    private readonly auditService: AuditService,
  ) { }

  @Public()
  @Post()
  @ApiOperation({ summary: "Self-registration for citizens (Public)" })
  @ApiResponse({ status: 201, description: "Citizen created successfully." })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCitizenFormDto })
  @UseInterceptors(FileInterceptor("profileImage", { storage: memoryStorage() }))
  create(
    @Body() dto: CreateCitizenDto,
    @UploadedFile() file?: any,
  ) {
    return this.citizenService.create(dto, file);
  }

  @Get()
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Get all citizens (paginated, filterable)" })
  @ApiResponse({ status: 200, description: "Citizens retrieved successfully." })
  async findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    },
    @Request() req: any,
  ) {
    const result = await this.citizenService.findAll(query);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_CITIZEN_LIST,
      targetEntity: "Citizen",
      accessPath: req.originalUrl,
      description: `Listed citizens (page ${query.page || 1}, limit ${query.limit || 20})${query.search ? `, search: ${query.search}` : ""}`,
    });
    return result;
  }

  @Get(":id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Get a citizen by ID" })
  @ApiResponse({ status: 200, description: "Citizen retrieved successfully." })
  async findOne(@Param("id") id: string, @Request() req: any) {
    const result = await this.citizenService.findOne(id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_CITIZEN_PROFILE,
      targetEntity: "Citizen",
      targetId: id,
      accessPath: req.originalUrl,
      description: `Viewed citizen profile`,
    });
    return result;
  }

  @Patch(":id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Update a citizen's details" })
  @ApiResponse({ status: 200, description: "Citizen updated successfully." })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCitizenFormDto })
  @UseInterceptors(FileInterceptor("profileImage", { storage: memoryStorage() }))
  update(
    @Param("id") id: string,
    @Body() dto: UpdateCitizenDto,
    @UploadedFile() file?: any,
  ) {
    return this.citizenService.update(id, dto, file);
  }

  @Delete(":id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Delete a citizen" })
  @ApiResponse({ status: 200, description: "Citizen deleted successfully." })
  remove(@Param("id") id: string) {
    return this.citizenService.remove(id);
  }

  @Get("me/profile")
  @Roles(UserRole.CITIZEN)
  @ApiOperation({ summary: "Get currently logged-in citizen's profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully." })
  async getProfile(@Request() req: any) {
    const result = await this.citizenService.getCitizenProfile(req.user.id);
    await this.auditService.logDataAccess({
      accessType: DataAccessType.VIEW_PROFILE,
      targetEntity: "Citizen",
      targetId: req.user.id,
      accessPath: req.originalUrl,
      description: `Viewed own profile`,
    });
    return result;
  }

  @Patch("me/profile")
  @Roles(UserRole.CITIZEN)
  @ApiOperation({ summary: "Update currently logged-in citizen's profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully." })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCitizenFormDto })
  @UseInterceptors(FileInterceptor("profileImage", { storage: memoryStorage() }))
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateCitizenDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      const [asset] = await processUploads(
        file,
        { baseDir: "uploads", publicBase: "/", makeThumb: false, quality: 82 },
        "profiles",
      );
      dto.profileImage = asset?.url;
    }
    return this.citizenService.updateCitizenProfile(req.user.id, dto);
  }


}
