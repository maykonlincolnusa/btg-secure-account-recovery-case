import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

export type AuditInput = {
  recoveryRequestId?: string | null | undefined;
  actorType: "SYSTEM" | "USER" | "OPERATOR";
  actorId?: string | null | undefined;
  action: string;
  summary: string;
  metadata?: Record<string, unknown> | undefined;
  requestId?: string | null | undefined;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditInput) {
    return this.prisma.auditEvent.create({
      data: {
        recoveryRequestId: input.recoveryRequestId ?? null,
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        action: input.action,
        summary: input.summary,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        requestId: input.requestId ?? null
      }
    });
  }

  async listByProtocol(protocolId: string) {
    const request = await this.prisma.recoveryRequest.findUniqueOrThrow({
      where: { protocolId },
      select: { id: true }
    });
    return this.prisma.auditEvent.findMany({
      where: { recoveryRequestId: request.id },
      orderBy: { createdAt: "asc" }
    });
  }
}
