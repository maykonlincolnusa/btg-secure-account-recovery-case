import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class AdminDecisionDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  operatorId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class AdminNoteDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  operatorId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  note!: string;
}
