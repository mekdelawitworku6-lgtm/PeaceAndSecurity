import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReportTypeDto {
    @ApiProperty({ example: "Robbery/Theft", description: "Name of the violation type" })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: "Loud music or construction noise", description: "Detailed description" })
    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 45.0, description: "Decibel threshold for noise reports in residential areas" })
    @IsOptional()
    @IsNumber()
    residentialDecibelThreshold?: number;

    @ApiPropertyOptional({ example: 55.0, description: "Decibel threshold for noise reports in commercial areas" })
    @IsOptional()
    @IsNumber()
    commercialDecibelThreshold?: number;
}

export class UpdateReportTypeDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    residentialDecibelThreshold?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    commercialDecibelThreshold?: number;
}
