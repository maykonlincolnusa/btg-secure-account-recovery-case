import { Body, Controller, Get, Headers, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ThrottlerGuard } from "@nestjs/throttler";
import { RecoveryService } from "./recovery.service";
import { CreateRecoveryRequestDto } from "./dto/create-recovery-request.dto";
import { FaceMatchDto } from "./dto/face-match.dto";
import { LivenessDto } from "./dto/liveness.dto";
import { RiskAssessmentDto } from "./dto/risk-assessment.dto";
import { ContactChangeDto } from "./dto/contact-change.dto";

@ApiTags("Recovery")
@UseGuards(ThrottlerGuard)
@Controller("recovery/requests")
export class RecoveryController {
  constructor(@Inject(RecoveryService) private readonly recovery: RecoveryService) {}

  @Post()
  @ApiOperation({ summary: "Cria solicitação de recuperação" })
  @ApiHeader({ name: "Idempotency-Key", required: false })
  create(
    @Body() body: CreateRecoveryRequestDto,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
    @Req() req: Request
  ) {
    return this.recovery.createRequest(body, idempotencyKey, req.requestId);
  }

  @Get(":protocolId")
  @ApiOperation({ summary: "Consulta solicitação por protocolo" })
  get(@Param("protocolId") protocolId: string) {
    return this.recovery.getPublic(protocolId);
  }

  @Post(":protocolId/face-match")
  @ApiOperation({ summary: "Executa FaceMatch" })
  faceMatch(@Param("protocolId") protocolId: string, @Body() body: FaceMatchDto, @Req() req: Request) {
    return this.recovery.runFaceMatch(protocolId, body, req.requestId);
  }

  @Post(":protocolId/liveness")
  @ApiOperation({ summary: "Executa liveness" })
  liveness(@Param("protocolId") protocolId: string, @Body() body: LivenessDto, @Req() req: Request) {
    return this.recovery.runLiveness(protocolId, body, req.requestId);
  }

  @Post(":protocolId/risk-assessment")
  @ApiOperation({ summary: "Avalia risco" })
  assessRisk(@Param("protocolId") protocolId: string, @Body() body: RiskAssessmentDto, @Req() req: Request) {
    return this.recovery.assessRisk(protocolId, body, req.requestId);
  }

  @Post(":protocolId/submit")
  @ApiOperation({ summary: "Submete solicitação" })
  submit(@Param("protocolId") protocolId: string, @Req() req: Request) {
    return this.recovery.submit(protocolId, req.requestId);
  }

  @Post(":protocolId/contact-change")
  @ApiOperation({ summary: "Aplica alteração sensível de contato" })
  @ApiHeader({ name: "Idempotency-Key", required: false })
  contactChange(
    @Param("protocolId") protocolId: string,
    @Body() body: ContactChangeDto,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
    @Req() req: Request
  ) {
    return this.recovery.applyContactChange(protocolId, body, idempotencyKey, req.requestId);
  }
}
