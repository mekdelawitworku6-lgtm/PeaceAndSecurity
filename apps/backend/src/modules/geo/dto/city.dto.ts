import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCityDto {
  @ApiProperty({ example: "Addis Ababa" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "AA" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

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

export class UpdateCityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

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
