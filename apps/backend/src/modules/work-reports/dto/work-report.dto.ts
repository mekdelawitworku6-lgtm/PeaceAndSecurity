import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
} from "class-validator";
import { WorkReportStatus } from "../../../common/enums/enums";

export class CreateWorkReportDto {
  @ApiProperty({ example: "Shift report — Bole patrol" })
  @IsString()
  title: string;

  @ApiProperty({
    example: "Patrolled Bole area, handled 2 noise complaints...",
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: "2026-08-14" })
  @IsOptional()
  @IsDateString()
  reportDate?: string;

  @ApiPropertyOptional({ example: 9.02497 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 38.74689 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateWorkReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "2026-08-14" })
  @IsOptional()
  @IsDateString()
  reportDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class ReviewWorkReportDto {
  @ApiProperty({ enum: WorkReportStatus, example: WorkReportStatus.APPROVED })
  @IsEnum(WorkReportStatus)
  status: WorkReportStatus;

  @ApiPropertyOptional({ example: "Approved — good work" })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class WorkReportFilterDto {
  @ApiPropertyOptional({ example: "PATROL" })
  @IsOptional()
  @IsString()
  reporterRole?: string;

  @ApiPropertyOptional({ enum: WorkReportStatus })
  @IsOptional()
  @IsEnum(WorkReportStatus)
  status?: WorkReportStatus;

  @ApiPropertyOptional({ description: "Filter by reporter user id" })
  @IsOptional()
  @IsString()
  reporterId?: string;

  @ApiPropertyOptional({ example: "2026-08-01" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: "2026-08-14" })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
