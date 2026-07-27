import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEmail, IsEnum } from "class-validator";
import { DevicePlatform, PreferredLanguage, VerificationStatus, UserStatus } from "../../../common/enums/enums";

/**
 * DTO for updating a citizen's profile.
 * Admins can edit these fields from the dashboard.
 * Citizens can update their own profile via the /users/profile endpoint.
 */
export class UpdateCitizenDto {
  @ApiProperty({ example: "Abebe Bikila Jr.", required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: "0911222333", required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false, example: "abebe@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, enum: PreferredLanguage })
  @IsOptional()
  @IsEnum(PreferredLanguage)
  preferredLanguage?: PreferredLanguage;

  @ApiProperty({ required: false, enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiProperty({ required: false, enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ required: false, enum: DevicePlatform })
  @IsOptional()
  @IsEnum(DevicePlatform)
  devicePlatform?: DevicePlatform;

  @ApiProperty({ required: false, example: "1.0.0" })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class UpdateCitizenFormDto extends UpdateCitizenDto {
  @ApiProperty({ type: "string", format: "binary", required: false })
  profileImage?: any;
}
