import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, Matches, IsEmail, IsEnum } from "class-validator";
import { DevicePlatform, PreferredLanguage } from "../../../common/enums/enums";

/**
 * DTO for creating a citizen account from the Admin Dashboard
 * OR via self-registration from the Citizen App.
 * Scoped to citizen-only fields.
 */
export class CreateCitizenDto {
  @ApiProperty({ example: "Abebe Bikila" })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: "0911222333",
    description: "Ethiopian phone number used as login credential",
  })
  @IsString()
  @Matches(/^(\+?251|0?)[97]\d{8}$/, {
    message: "Invalid Ethiopian phone number format",
  })
  phoneNumber: string;

  @ApiProperty({ required: false, example: "abebe@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, enum: PreferredLanguage, default: PreferredLanguage.AMHARIC })
  @IsOptional()
  @IsEnum(PreferredLanguage)
  preferredLanguage?: PreferredLanguage;

  @ApiProperty({ required: false, enum: DevicePlatform })
  @IsOptional()
  @IsEnum(DevicePlatform)
  devicePlatform?: DevicePlatform;

  @ApiProperty({ required: false, example: "1.0.0" })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({ required: false, description: "App-generated unique device identifier" })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class CreateCitizenFormDto extends CreateCitizenDto {
  @ApiProperty({ type: "string", format: "binary", required: false })
  profileImage?: any;
}
