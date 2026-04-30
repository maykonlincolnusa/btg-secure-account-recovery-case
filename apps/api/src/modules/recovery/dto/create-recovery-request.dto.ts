import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRecoveryRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(80)
  accountIdentifier!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  previousEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  previousPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  targetEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  targetPhone?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  consentAccepted!: true;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(256)
  deviceFingerprint?: string;
}
