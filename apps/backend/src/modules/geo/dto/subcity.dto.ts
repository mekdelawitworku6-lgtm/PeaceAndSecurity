import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSubcityDto {
  @ApiProperty({ example: "Arada" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "ARD" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSubcityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
