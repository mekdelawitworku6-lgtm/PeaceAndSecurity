import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class SetPinDto {
  @ApiProperty({ example: "482915", description: "6-digit PIN" })
  @IsString()
  @Length(6, 6, { message: "PIN must be exactly 6 digits" })
  @Matches(/^\d{6}$/, { message: "PIN must contain exactly 6 digits" })
  pin: string;
}
