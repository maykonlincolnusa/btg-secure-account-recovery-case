import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { RecoveryController } from "../../src/modules/recovery/recovery.controller";
import { RecoveryService } from "../../src/modules/recovery/recovery.service";
import { ThrottlerGuard } from "@nestjs/throttler";

describe("RecoveryController", () => {
  let app: INestApplication;
  const recoveryService = {
    createRequest: vi.fn(),
    getPublic: vi.fn(),
    runFaceMatch: vi.fn(),
    runLiveness: vi.fn(),
    assessRisk: vi.fn(),
    submit: vi.fn(),
    applyContactChange: vi.fn()
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RecoveryController],
      providers: [
        { provide: RecoveryService, useValue: recoveryService },
        { provide: ThrottlerGuard, useValue: { canActivate: () => true } }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it("creates a recovery request", async () => {
    recoveryService.createRequest.mockResolvedValue({ protocolId: "SR-TEST", status: "IDENTITY_PENDING" });

    const response = await request(app.getHttpServer())
      .post("/recovery/requests")
      .set("Idempotency-Key", "test-key")
      .send({
        accountIdentifier: "account-1",
        previousEmail: "old@example.com",
        targetEmail: "new@example.com",
        consentAccepted: true
      })
      .expect(201);

    expect(response.body.protocolId).toBe("SR-TEST");
    expect(recoveryService.createRequest).toHaveBeenCalledWith(expect.any(Object), "test-key", undefined);
  });

  it("runs risk assessment endpoint", async () => {
    recoveryService.assessRisk.mockResolvedValue({ protocolId: "SR-TEST", status: "APPROVED" });

    await request(app.getHttpServer())
      .post("/recovery/requests/SR-TEST/risk-assessment")
      .send({ signals: { newDevice: false } })
      .expect(201);

    expect(recoveryService.assessRisk).toHaveBeenCalledWith("SR-TEST", expect.any(Object), undefined);
  });
});
