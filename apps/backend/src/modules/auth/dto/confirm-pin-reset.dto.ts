import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class ConfirmPinResetDto {
  @ApiProperty()
  @IsString()
  otpCode: string;

  @ApiProperty({ example: "839201", description: "New 6-digit PIN" })
  @IsString()
  @Length(6, 6, { message: "PIN must be exactly 6 digits" })
  @Matches(/^\d{6}$/, { message: "PIN must contain only digits" })
  newPin: string;
}
