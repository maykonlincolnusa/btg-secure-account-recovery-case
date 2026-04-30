import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class FaceMatchDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(256)
  selfieImageRef!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(256)
  documentImageRef?: string;

  @ApiPropertyOptional({ enum: ["PASS", "FAIL"] })
  @IsOptional()
  @IsIn(["PASS", "FAIL"])
  mockOutcome?: "PASS" | "FAIL";
}
