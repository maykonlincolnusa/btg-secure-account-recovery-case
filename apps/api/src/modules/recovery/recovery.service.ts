import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RecoveryStatus, SuggestedDecision, assertTransition } from "@secure-recovery/domain";
import type { RiskSignals } from "@secure-recovery/domain";
import { createProtocolId, maskEmail, maskPhone, redactSensitive } from "@secure-recovery/utils";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationService } from "../notifications/notification.service";
import { RiskEngineService } from "../risk/risk-engine.service";
import { CreateRecoveryRequestDto } from "./dto/create-recovery-request.dto";
import { FaceMatchDto } from "./dto/face-match.dto";
import { LivenessDto } from "./dto/liveness.dto";
import { RiskAssessmentDto } from "./dto/risk-assessment.dto";
import { ContactChangeDto } from "./dto/contact-change.dto";
import { MockFaceMatchProvider } from "./providers/face-match.provider";
import { MockLivenessProvider } from "./providers/liveness.provider";
import { SystemClockProvider } from "./providers/clock.provider";

@Injectable()
export class RecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationService,
    private readonly risk: RiskEngineService,
    private readonly faceMatch: MockFaceMatchProvider,
    private readonly liveness: MockLivenessProvider,
    private readonly clock: SystemClockProvider
  ) {}

  async createRequest(input: CreateRecoveryRequestDto, idempotencyKey?: string, requestId?: string) {
    if (!input.consentAccepted) {
      throw new BadRequestException("Consentimento explícito é obrigatório");
    }

    if (!input.targetEmail && !input.targetPhone) {
      throw new BadRequestException("Informe e-mail ou telefone de destino");
    }

    if (idempotencyKey) {
      const existing = await this.prisma.recoveryRequest.findFirst({
        where: { idempotencyKey },
        include: this.detailInclude()
      });
      if (existing) {
        return this.toPublicResponse(existing);
      }
    }

    const user = await this.prisma.user.upsert({
      where: { accountIdentifier: input.accountIdentifier },
      update: {
        maskedEmail: maskEmail(input.previousEmail),
        maskedPhone: maskPhone(input.previousPhone)
      },
      create: {
        accountIdentifier: input.accountIdentifier,
        maskedEmail: maskEmail(input.previousEmail),
        maskedPhone: maskPhone(input.previousPhone)
      }
    });

    const protocolId = createProtocolId(this.clock.now());
    const request = await this.prisma.recoveryRequest.create({
      data: {
        protocolId,
        userId: user.id,
        status: RecoveryStatus.IDENTITY_PENDING,
        idempotencyKey,
        previousEmailMasked: maskEmail(input.previousEmail),
        previousPhoneMasked: maskPhone(input.previousPhone),
        targetEmailMasked: maskEmail(input.targetEmail),
        targetPhoneMasked: maskPhone(input.targetPhone),
        consentAcceptedAt: this.clock.now(),
        statusHistory: {
          create: {
            fromStatus: RecoveryStatus.INITIATED,
            toStatus: RecoveryStatus.IDENTITY_PENDING,
            reason: "Solicitação criada com consentimento",
            actorType: "USER"
          }
        }
      },
      include: this.detailInclude()
    });

    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "USER",
      action: "RECOVERY_REQUEST_CREATED",
      summary: "Solicitação de recuperação criada",
      metadata: redactSensitive(input) as Record<string, unknown>,
      requestId
    });

    return this.toPublicResponse(request);
  }

  async getPublic(protocolId: string) {
    const request = await this.findDetailed(protocolId);
    return this.toPublicResponse(request);
  }

  async runFaceMatch(protocolId: string, input: FaceMatchDto, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    this.ensureNotTerminal(request.status);
    const result = await this.faceMatch.verify({ protocolId, ...input });

    const nextStatus = result.success ? RecoveryStatus.FACE_VERIFIED : RecoveryStatus.REJECTED;
    await this.transition(request.id, request.status, nextStatus, result.success ? "FaceMatch aprovado" : "FaceMatch rejeitado");

    await this.prisma.verificationAttempt.create({
      data: {
        recoveryRequestId: request.id,
        type: "FACE_MATCH",
        provider: "MockFaceMatchProvider",
        success: result.success,
        score: result.score,
        reasonCode: result.reasonCode,
        metadata: { selfieImageRef: input.selfieImageRef, documentImageRef: input.documentImageRef ?? null }
      }
    });

    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "USER",
      action: "FACE_MATCH_ATTEMPTED",
      summary: result.success ? "FaceMatch aprovado" : "FaceMatch falhou",
      metadata: { score: result.score, reasonCode: result.reasonCode },
      requestId
    });

    return this.getPublic(protocolId);
  }

  async runLiveness(protocolId: string, input: LivenessDto, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    if (request.status !== RecoveryStatus.FACE_VERIFIED) {
      throw new ConflictException("Liveness requer FaceMatch aprovado");
    }
    const result = await this.liveness.verify({ protocolId, ...input });

    const nextStatus = result.success ? RecoveryStatus.LIVENESS_VERIFIED : RecoveryStatus.REJECTED;
    await this.transition(request.id, request.status, nextStatus, result.success ? "Liveness aprovado" : "Liveness rejeitado");

    await this.prisma.verificationAttempt.create({
      data: {
        recoveryRequestId: request.id,
        type: "LIVENESS",
        provider: "MockLivenessProvider",
        success: result.success,
        score: result.score,
        reasonCode: result.reasonCode,
        metadata: { challengeId: input.challengeId, captureRef: input.captureRef }
      }
    });

    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "USER",
      action: "LIVENESS_ATTEMPTED",
      summary: result.success ? "Liveness aprovado" : "Liveness falhou",
      metadata: { score: result.score, reasonCode: result.reasonCode },
      requestId
    });

    return this.getPublic(protocolId);
  }

  async assessRisk(protocolId: string, input: RiskAssessmentDto, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    if (request.status !== RecoveryStatus.LIVENESS_VERIFIED) {
      throw new ConflictException("Avaliação de risco requer liveness aprovado");
    }

    await this.transition(request.id, request.status, RecoveryStatus.RISK_EVALUATING, "Início da avaliação de risco");
    const normalizedSignals: RiskSignals = {
      sensitiveContactChange: true,
      ...input.signals
    };
    const assessment = await this.risk.assess(normalizedSignals);
    const nextStatus = this.statusFromDecision(assessment.suggestedDecision);
    const cooldownUntil =
      nextStatus === RecoveryStatus.COOLDOWN
        ? new Date(this.clock.now().getTime() + 24 * 60 * 60 * 1000)
        : undefined;

    await this.prisma.riskAssessment.create({
      data: {
        recoveryRequestId: request.id,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        suggestedDecision: assessment.suggestedDecision,
        reasons: assessment.riskReasons,
        signals: normalizedSignals
      }
    });

    await this.transition(request.id, RecoveryStatus.RISK_EVALUATING, nextStatus, "Decisão sugerida pelo motor de risco", {
      cooldownUntil
    });

    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "SYSTEM",
      action: "RISK_ASSESSED",
      summary: `Risco ${assessment.riskLevel} com decisão ${assessment.suggestedDecision}`,
      metadata: assessment,
      requestId
    });

    if (nextStatus === RecoveryStatus.APPROVED) {
      await this.notifications.notify({
        recoveryRequestId: request.id,
        channel: "IN_APP",
        template: "RECOVERY_APPROVED",
        recipientMasked: request.targetEmailMasked ?? "in-app",
        metadata: { protocolId }
      });
      await this.audit.record({
        recoveryRequestId: request.id,
        actorType: "SYSTEM",
        action: "NOTIFICATION_SENT",
        summary: "Notificação de aprovação enviada",
        metadata: { template: "RECOVERY_APPROVED" },
        requestId
      });
    }

    return this.getPublic(protocolId);
  }

  async submit(protocolId: string, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    if (
      request.status === RecoveryStatus.COOLDOWN ||
      request.status === RecoveryStatus.UNDER_REVIEW ||
      request.status === RecoveryStatus.APPROVED
    ) {
      await this.audit.record({
        recoveryRequestId: request.id,
        actorType: "USER",
        action: "RECOVERY_SUBMITTED",
        summary: "Solicitação submetida",
        metadata: { status: request.status },
        requestId
      });
      return this.toPublicResponse(request);
    }
    throw new ConflictException("Solicitação ainda não está pronta para submissão");
  }

  async applyContactChange(protocolId: string, input: ContactChangeDto, idempotencyKey?: string, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    if (request.status !== RecoveryStatus.APPROVED) {
      throw new ConflictException("Alteração de contato requer solicitação aprovada");
    }
    this.assertIdentityChecksPassed(request);

    const replayKey = `${protocolId}:${input.replayNonce}`;
    await this.reserveReplayNonce(replayKey, idempotencyKey);

    await this.prisma.contactChangeRequest.upsert({
      where: { recoveryRequestId: request.id },
      update: {
        newEmailMasked: maskEmail(input.newEmail) ?? "***",
        newPhoneMasked: maskPhone(input.newPhone) ?? "***",
        status: "APPLIED",
        executedAt: this.clock.now()
      },
      create: {
        recoveryRequestId: request.id,
        newEmailMasked: maskEmail(input.newEmail) ?? "***",
        newPhoneMasked: maskPhone(input.newPhone) ?? "***",
        status: "APPLIED",
        executedAt: this.clock.now()
      }
    });

    await this.transition(request.id, request.status, RecoveryStatus.COMPLETED, "Alteração segura de contato aplicada");
    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "SYSTEM",
      action: "CONTACT_CHANGED",
      summary: "E-mail e telefone alterados em ambiente mock",
      metadata: {
        newEmailMasked: maskEmail(input.newEmail),
        newPhoneMasked: maskPhone(input.newPhone)
      },
      requestId
    });

    return this.getPublic(protocolId);
  }

  async listAdmin(filters: Record<string, string | undefined>) {
    return this.prisma.recoveryRequest.findMany({
      where: {
        status: filters.status as RecoveryStatus | undefined,
        protocolId: filters.protocol ? { contains: filters.protocol } : undefined,
        user: filters.user ? { accountIdentifier: { contains: filters.user } } : undefined,
        riskAssessments: filters.risk
          ? {
              some: {
                riskLevel: filters.risk as never
              }
            }
          : undefined
      },
      include: this.detailInclude(),
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  async getAdmin(protocolId: string) {
    return this.findDetailed(protocolId);
  }

  async approve(protocolId: string, operatorId: string, reason: string, note?: string, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    if (
      request.status !== RecoveryStatus.UNDER_REVIEW &&
      request.status !== RecoveryStatus.COOLDOWN &&
      request.status !== RecoveryStatus.STEP_UP_REQUIRED
    ) {
      throw new ConflictException("Aprovação manual permitida apenas para revisão, cooldown ou step-up");
    }
    await this.transition(request.id, request.status, RecoveryStatus.APPROVED, reason, undefined, "OPERATOR", operatorId);
    await this.prisma.manualReviewDecision.create({
      data: { recoveryRequestId: request.id, decision: "APPROVED", operatorId, reason, note }
    });
    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "OPERATOR",
      actorId: operatorId,
      action: "MANUAL_APPROVED",
      summary: "Operador aprovou solicitação",
      metadata: { reason, note },
      requestId
    });
    return this.getAdmin(protocolId);
  }

  async reject(protocolId: string, operatorId: string, reason: string, note?: string, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    if (
      request.status === RecoveryStatus.COMPLETED ||
      request.status === RecoveryStatus.REJECTED
    ) {
      throw new ConflictException("Solicitação terminal não pode ser rejeitada novamente");
    }
    await this.transition(request.id, request.status, RecoveryStatus.REJECTED, reason, undefined, "OPERATOR", operatorId);
    await this.prisma.manualReviewDecision.create({
      data: { recoveryRequestId: request.id, decision: "REJECTED", operatorId, reason, note }
    });
    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "OPERATOR",
      actorId: operatorId,
      action: "MANUAL_REJECTED",
      summary: "Operador rejeitou solicitação",
      metadata: { reason, note },
      requestId
    });
    return this.getAdmin(protocolId);
  }

  async addNote(protocolId: string, operatorId: string, note: string, requestId?: string) {
    const request = await this.findDetailed(protocolId);
    await this.prisma.manualReviewDecision.create({
      data: { recoveryRequestId: request.id, decision: "NOTE", operatorId, reason: "Nota operacional", note }
    });
    await this.audit.record({
      recoveryRequestId: request.id,
      actorType: "OPERATOR",
      actorId: operatorId,
      action: "OPERATOR_NOTE_ADDED",
      summary: "Nota operacional adicionada",
      metadata: { note },
      requestId
    });
    return this.getAdmin(protocolId);
  }

  private async findDetailed(protocolId: string) {
    const request = await this.prisma.recoveryRequest.findUnique({
      where: { protocolId },
      include: this.detailInclude()
    });
    if (!request) {
      throw new NotFoundException("Protocolo não encontrado");
    }
    return request;
  }

  private detailInclude() {
    return {
      user: true,
      verificationAttempts: { orderBy: { createdAt: "asc" as const } },
      riskAssessments: { orderBy: { createdAt: "desc" as const } },
      auditEvents: { orderBy: { createdAt: "asc" as const } },
      statusHistory: { orderBy: { createdAt: "asc" as const } },
      notifications: { orderBy: { createdAt: "asc" as const } },
      manualDecisions: { orderBy: { createdAt: "asc" as const } },
      contactChange: true
    };
  }

  private async transition(
    requestId: string,
    fromStatus: RecoveryStatus,
    toStatus: RecoveryStatus,
    reason: string,
    update?: { cooldownUntil?: Date },
    actorType: "SYSTEM" | "USER" | "OPERATOR" = "SYSTEM",
    actorId?: string
  ) {
    assertTransition(fromStatus, toStatus);
    await this.prisma.$transaction([
      this.prisma.recoveryRequest.update({
        where: { id: requestId },
        data: {
          status: toStatus,
          cooldownUntil: update?.cooldownUntil,
          completedAt: toStatus === RecoveryStatus.COMPLETED ? this.clock.now() : undefined
        }
      }),
      this.prisma.statusHistory.create({
        data: {
          recoveryRequestId: requestId,
          fromStatus,
          toStatus,
          reason,
          actorType,
          actorId
        }
      }),
      this.prisma.auditEvent.create({
        data: {
          recoveryRequestId: requestId,
          actorType,
          actorId,
          action: "STATUS_CHANGED",
          summary: `${fromStatus} -> ${toStatus}`,
          metadata: { reason }
        }
      })
    ]);
  }

  private statusFromDecision(decision: SuggestedDecision): RecoveryStatus {
    switch (decision) {
      case SuggestedDecision.AUTO_APPROVE:
        return RecoveryStatus.APPROVED;
      case SuggestedDecision.STEP_UP:
        return RecoveryStatus.STEP_UP_REQUIRED;
      case SuggestedDecision.HOLD:
        return RecoveryStatus.COOLDOWN;
      case SuggestedDecision.REJECT:
        return RecoveryStatus.REJECTED;
    }
  }

  private assertIdentityChecksPassed(request: Awaited<ReturnType<RecoveryService["findDetailed"]>>) {
    const faceVerified = request.verificationAttempts.some((attempt) => attempt.type === "FACE_MATCH" && attempt.success);
    const livenessVerified = request.verificationAttempts.some((attempt) => attempt.type === "LIVENESS" && attempt.success);
    if (!faceVerified || !livenessVerified) {
      throw new ConflictException("Prova de identidade e liveness válidos são obrigatórios");
    }
  }

  private ensureNotTerminal(status: RecoveryStatus) {
    if (
      status === RecoveryStatus.REJECTED ||
      status === RecoveryStatus.COMPLETED ||
      status === RecoveryStatus.FAILED
    ) {
      throw new ConflictException("Solicitação já está em estado terminal");
    }
  }

  private async reserveReplayNonce(replayKey: string, idempotencyKey?: string) {
    const key = idempotencyKey ?? replayKey;
    try {
      await this.prisma.idempotencyKey.create({
        data: {
          key,
          scope: "contact-change",
          responseHash: replayKey,
          expiresAt: new Date(this.clock.now().getTime() + 15 * 60 * 1000)
        }
      });
    } catch {
      throw new ConflictException("Ação crítica duplicada ou replay detectado");
    }
  }

  private toPublicResponse(request: Awaited<ReturnType<RecoveryService["findDetailed"]>>) {
    const latestRisk = request.riskAssessments[0];
    return {
      protocolId: request.protocolId,
      status: request.status,
      user: {
        accountIdentifier: request.user.accountIdentifier,
        maskedEmail: request.user.maskedEmail,
        maskedPhone: request.user.maskedPhone
      },
      targetEmailMasked: request.targetEmailMasked,
      targetPhoneMasked: request.targetPhoneMasked,
      cooldownUntil: request.cooldownUntil,
      risk: latestRisk
        ? {
            riskScore: latestRisk.riskScore,
            riskLevel: latestRisk.riskLevel,
            suggestedDecision: latestRisk.suggestedDecision,
            reasons: latestRisk.reasons
          }
        : null,
      decisions: request.manualDecisions.map((decision) => ({
        decision: decision.decision,
        reason: decision.reason,
        note: decision.note,
        createdAt: decision.createdAt
      })),
      history: request.statusHistory.map((item) => ({
        fromStatus: item.fromStatus,
        toStatus: item.toStatus,
        reason: item.reason,
        createdAt: item.createdAt
      })),
      createdAt: request.createdAt,
      completedAt: request.completedAt
    };
  }
}
