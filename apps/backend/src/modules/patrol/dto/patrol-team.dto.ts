import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePatrolTeamDto {
  @ApiProperty({ example: "Team Alpha" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  woredaId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePatrolTeamDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddTeamMemberDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  patrolId: string;
}
