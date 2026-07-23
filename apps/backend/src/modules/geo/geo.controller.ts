import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { GeoService } from "./geo.service";
import { CreateCityDto, UpdateCityDto } from "./dto/city.dto";
import { CreateSubcityDto, UpdateSubcityDto } from "./dto/subcity.dto";
import { CreateWoredaDto, UpdateWoredaDto } from "./dto/woreda.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/enums";

@ApiTags("Geographic Units")
@Controller("geo")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  // ─── CITIES ──────────────────────────────────────────────

  @Post("cities")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.POLICE_COMMANDER_CITY)
  @ApiOperation({ summary: "Create a city" })
  @ApiResponse({ status: 201, description: "City created successfully" })
  async createCity(@Body() dto: CreateCityDto) {
    return this.geoService.createCity(dto);
  }

  @Get("cities")
  @ApiOperation({ summary: "Get all cities" })
  async getAllCities() {
    return this.geoService.getAllCities();
  }

  @Get("cities/:id")
  @ApiOperation({ summary: "Get city by ID" })
  async getCityById(@Param("id") id: string) {
    return this.geoService.getCityById(id);
  }

  @Patch("cities/:id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.POLICE_COMMANDER_CITY)
  @ApiOperation({ summary: "Update city" })
  async updateCity(@Param("id") id: string, @Body() dto: UpdateCityDto) {
    return this.geoService.updateCity(id, dto);
  }

  @Delete("cities/:id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.POLICE_COMMANDER_CITY)
  @ApiOperation({ summary: "Delete city" })
  async deleteCity(@Param("id") id: string) {
    return this.geoService.deleteCity(id);
  }

  // ─── SUBCITIES ───────────────────────────────────────────

  @Get("subcities")
  @ApiOperation({ summary: "Get all subcities" })
  async getAllSubcities() {
    return this.geoService.getAllSubcities();
  }

  @Post("subcities")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.PEACE_OFFICER_SUBCITY, UserRole.POLICE_COMMANDER_CITY, UserRole.POLICE_COMMANDER_SUBCITY)
  @ApiOperation({ summary: "Create a subcity" })
  async createSubcityFlat(@Body() dto: CreateSubcityDto) {
    return this.geoService.createSubcity(dto);
  }

  @Post("cities/:cityId/subcities")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.PEACE_OFFICER_SUBCITY, UserRole.POLICE_COMMANDER_CITY, UserRole.POLICE_COMMANDER_SUBCITY)
  @ApiOperation({ summary: "Create a subcity in a city" })
  async createSubcity(
    @Param("cityId") cityId: string,
    @Body() dto: CreateSubcityDto,
  ) {
    dto.cityId = cityId;
    return this.geoService.createSubcity(dto);
  }

  @Get("cities/:cityId/subcities")
  @ApiOperation({ summary: "Get subcities by city" })
  async getSubcitiesByCity(@Param("cityId") cityId: string) {
    return this.geoService.getSubcitiesByCity(cityId);
  }

  @Get("subcities/:id")
  @ApiOperation({ summary: "Get subcity by ID" })
  async getSubcityById(@Param("id") id: string) {
    return this.geoService.getSubcityById(id);
  }

  @Patch("subcities/:id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.PEACE_OFFICER_SUBCITY, UserRole.POLICE_COMMANDER_CITY, UserRole.POLICE_COMMANDER_SUBCITY)
  @ApiOperation({ summary: "Update subcity" })
  async updateSubcity(@Param("id") id: string, @Body() dto: UpdateSubcityDto) {
    return this.geoService.updateSubcity(id, dto);
  }

  @Delete("subcities/:id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.PEACE_OFFICER_SUBCITY, UserRole.POLICE_COMMANDER_CITY, UserRole.POLICE_COMMANDER_SUBCITY)
  @ApiOperation({ summary: "Delete subcity" })
  async deleteSubcity(@Param("id") id: string) {
    return this.geoService.deleteSubcity(id);
  }

  // ─── WOREDAS ─────────────────────────────────────────────

  @Get("woredas")
  @ApiOperation({ summary: "Get all woredas" })
  async getAllWoredas() {
    return this.geoService.getAllWoredas();
  }

  @Post("woredas")
  @Roles(UserRole.POLICE_COMMANDER_SUBCITY, UserRole.PEACE_OFFICER_WOREDA)
  @ApiOperation({ summary: "Create a woreda (subcity-level roles only)" })
  async createWoredaFlat(@Body() dto: CreateWoredaDto) {
    return this.geoService.createWoreda(dto);
  }

  @Post("subcities/:subcityId/woredas")
  @Roles(UserRole.POLICE_COMMANDER_SUBCITY, UserRole.PEACE_OFFICER_WOREDA)
  @ApiOperation({ summary: "Create a woreda in a subcity (subcity-level roles only)" })
  async createWoreda(
    @Param("subcityId") subcityId: string,
    @Body() dto: CreateWoredaDto,
  ) {
    dto.subcityId = subcityId;
    return this.geoService.createWoreda(dto);
  }

  @Get("subcities/:subcityId/woredas")
  @ApiOperation({ summary: "Get woredas by subcity" })
  async getWoredasBySubcity(@Param("subcityId") subcityId: string) {
    return this.geoService.getWoredasBySubcity(subcityId);
  }

  @Get("woredas/:id")
  @ApiOperation({ summary: "Get woreda by ID" })
  async getWoredaById(@Param("id") id: string) {
    return this.geoService.getWoredaById(id);
  }

  @Patch("woredas/:id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.PEACE_OFFICER_SUBCITY, UserRole.POLICE_COMMANDER_CITY, UserRole.POLICE_COMMANDER_SUBCITY)
  @ApiOperation({ summary: "Update woreda" })
  async updateWoreda(@Param("id") id: string, @Body() dto: UpdateWoredaDto) {
    return this.geoService.updateWoreda(id, dto);
  }

  @Delete("woredas/:id")
  @Roles(UserRole.SYSTEM_SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.PEACE_SUPER_ADMIN, UserRole.PEACE_OFFICER_SUBCITY, UserRole.POLICE_COMMANDER_CITY, UserRole.POLICE_COMMANDER_SUBCITY)
  @ApiOperation({ summary: "Delete woreda" })
  async deleteWoreda(@Param("id") id: string) {
    return this.geoService.deleteWoreda(id);
  }

  // ─── HIERARCHY ───────────────────────────────────────────

  @Get("hierarchy")
  @ApiOperation({ summary: "Get full geographic hierarchy (cities → subcities → woredas)" })
  async getFullHierarchy() {
    return this.geoService.getFullHierarchy();
  }
}
