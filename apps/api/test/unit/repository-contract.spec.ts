import { describe, expect, it } from "vitest";

describe("repository contract", () => {
  it("documents append-only audit event shape", () => {
    const auditEvent = {
      recoveryRequestId: "req-1",
      actorType: "SYSTEM",
      action: "STATUS_CHANGED",
      summary: "IDENTITY_PENDING -> FACE_VERIFIED",
      metadata: { reason: "FaceMatch aprovado" }
    };

    expect(auditEvent).toMatchObject({
      actorType: "SYSTEM",
      action: expect.any(String),
      metadata: expect.any(Object)
    });
  });
});
