import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateWoredaDto {
  @ApiProperty({ example: "Woreda 01" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "WRD-01" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  subcityId: string;

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

export class UpdateWoredaDto {
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
  subcityId?: string;

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
