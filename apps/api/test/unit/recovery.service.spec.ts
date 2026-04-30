import { ConflictException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { RecoveryStatus } from "@secure-recovery/domain";
import { RecoveryService } from "../../src/modules/recovery/recovery.service";

function createService(overrides: Record<string, unknown> = {}) {
  const prisma = {
    recoveryRequest: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn()
    },
    user: { upsert: vi.fn() },
    verificationAttempt: { create: vi.fn() },
    riskAssessment: { create: vi.fn() },
    contactChangeRequest: { upsert: vi.fn() },
    manualReviewDecision: { create: vi.fn() },
    idempotencyKey: { create: vi.fn() },
    statusHistory: { create: vi.fn() },
    auditEvent: { create: vi.fn() },
    $transaction: vi.fn((ops) => Promise.all(ops))
  };
  return {
    prisma,
    service: new RecoveryService(
      prisma as never,
      { record: vi.fn() } as never,
      { notify: vi.fn() } as never,
      { assess: vi.fn() } as never,
      { verify: vi.fn() } as never,
      { verify: vi.fn() } as never,
      { now: () => new Date("2026-04-30T12:00:00.000Z") } as never
    ),
    ...overrides
  };
}

describe("RecoveryService", () => {
  it("blocks duplicated replay nonce for contact change", async () => {
    const { prisma, service } = createService();
    prisma.recoveryRequest.findUnique.mockResolvedValue({
      id: "req-1",
      protocolId: "SR-TEST",
      status: RecoveryStatus.APPROVED,
      user: { accountIdentifier: "account-1" },
      verificationAttempts: [
        { type: "FACE_MATCH", success: true },
        { type: "LIVENESS", success: true }
      ],
      riskAssessments: [],
      auditEvents: [],
      statusHistory: [],
      notifications: [],
      manualDecisions: [],
      contactChange: null
    });
    prisma.idempotencyKey.create.mockRejectedValue(new Error("duplicate"));

    await expect(
      service.applyContactChange("SR-TEST", {
        newEmail: "new@example.com",
        newPhone: "+551199998888",
        replayNonce: "nonce-demo"
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
