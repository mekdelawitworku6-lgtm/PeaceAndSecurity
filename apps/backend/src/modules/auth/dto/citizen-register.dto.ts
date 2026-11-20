import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, Matches } from "class-validator";

export class CitizenRegisterDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  fullName: string;

  @ApiProperty({ example: "0911222333" })
  @IsString()
  @Matches(/^(\+?251|0?)[97]\d{8}$/, {
    message: "Invalid Ethiopian phone number format",
  })
  phoneNumber: string;

  @ApiProperty({ example: "123456", description: "6-digit PIN" })
  @IsString()
  pin: string;

  @ApiProperty({ required: false, description: "Device identifier for linking guest reports" })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class CitizenRegisterFormDto extends CitizenRegisterDto {
  @ApiProperty({ type: "string", format: "binary", required: false })
  profileImage?: any;
}
