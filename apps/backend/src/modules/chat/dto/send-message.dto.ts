import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  senderType: string; // "citizen" | "patrol" | "admin"

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderName?: string;
}
