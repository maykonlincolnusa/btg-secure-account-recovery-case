import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class RiskSignalsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  newDevice?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  unusualIp?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  geoMismatch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  repeatedAttempts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sensitiveContactChange?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  faceMatchFailed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  livenessFailed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  anomalousBehavior?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  recentRecoveryRequests?: number;
}

export class RiskAssessmentDto {
  @ValidateNested()
  @Type(() => RiskSignalsDto)
  signals!: RiskSignalsDto;
}
