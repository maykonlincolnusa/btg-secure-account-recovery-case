import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class ContactChangeDto {
  @ApiProperty()
  @IsEmail()
  newEmail!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  newPhone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  replayNonce!: string;
}
