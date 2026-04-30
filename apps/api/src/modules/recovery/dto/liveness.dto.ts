import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class LivenessDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(128)
  challengeId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(256)
  captureRef!: string;

  @ApiPropertyOptional({ enum: ["PASS", "FAIL"] })
  @IsOptional()
  @IsIn(["PASS", "FAIL"])
  mockOutcome?: "PASS" | "FAIL";
}
