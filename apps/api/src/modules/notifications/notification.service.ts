import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

export interface NotificationProvider {
  send(input: {
    recoveryRequestId: string;
    channel: "EMAIL" | "SMS" | "IN_APP";
    template: string;
    recipientMasked: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ status: "QUEUED" | "SENT" | "FAILED" }>;
}

@Injectable()
export class MockNotificationProvider implements NotificationProvider {
  async send(_input: Parameters<NotificationProvider["send"]>[0]) {
    return { status: "SENT" as const };
  }
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: MockNotificationProvider
  ) {}

  async notify(input: Parameters<NotificationProvider["send"]>[0]) {
    const result = await this.provider.send(input);
    return this.prisma.notificationEvent.create({
      data: {
        recoveryRequestId: input.recoveryRequestId,
        channel: input.channel,
        template: input.template,
        recipientMasked: input.recipientMasked,
        status: result.status,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue
      }
    });
  }
}
