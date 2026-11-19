import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { OTPType } from "common/enums/enums";

export class VerifyOTPDto {
  @ApiProperty({ example: "123456" })
  @IsString()
  otpCode: string;

  @ApiProperty({ enum: OTPType, example: OTPType.REGISTRATION_OTP })
  @IsEnum(OTPType)
  otpType: OTPType;
}
