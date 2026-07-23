import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
} from "class-validator";
import { Transform } from "class-transformer";
import { UserRole } from "../../../common/enums/enums";

/**
 * DTO for creating a dashboard User (admin account).
 * For patrol officers use CreatePatrolDto, for citizens use CreateCitizenDto.
 */
export class CreateUserDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  fullName: string;

  @ApiProperty({ example: "+251911234567", required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: "admin@example.com", required: false })
  @IsOptional()
  @IsEmail({}, { message: "Invalid email address" })
  email?: string;

  @ApiProperty({
    enum: Object.values(UserRole),
    default: UserRole.SYSTEM_ADMIN,
    description: "User role. Use /patrols or /citizens for patrol/citizen types.",
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ type: "array", items: { type: "string" }, required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? [value] : value))
  @IsArray()
  permissions?: string[];

  // ─── Geographic Hierarchy ─────────────────────────────────

  @ApiPropertyOptional({ description: "City ID (for city-level roles)" })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ description: "Subcity ID (for subcity-level roles)" })
  @IsOptional()
  @IsUUID()
  subcityId?: string;

  @ApiPropertyOptional({ description: "Woreda ID (for woreda-level roles)" })
  @IsOptional()
  @IsUUID()
  woredaId?: string;
}
