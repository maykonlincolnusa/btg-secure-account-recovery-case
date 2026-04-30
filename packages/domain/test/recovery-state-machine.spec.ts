import { describe, expect, it } from "vitest";
import { RecoveryStatus, assertTransition, canTransition } from "../src";

describe("recovery state machine", () => {
  it("allows the happy path until completion", () => {
    expect(canTransition(RecoveryStatus.IDENTITY_PENDING, RecoveryStatus.FACE_VERIFIED)).toBe(true);
    expect(canTransition(RecoveryStatus.FACE_VERIFIED, RecoveryStatus.LIVENESS_VERIFIED)).toBe(true);
    expect(canTransition(RecoveryStatus.LIVENESS_VERIFIED, RecoveryStatus.RISK_EVALUATING)).toBe(true);
    expect(canTransition(RecoveryStatus.RISK_EVALUATING, RecoveryStatus.APPROVED)).toBe(true);
    expect(canTransition(RecoveryStatus.APPROVED, RecoveryStatus.COMPLETED)).toBe(true);
  });

  it("blocks changes after terminal states", () => {
    expect(canTransition(RecoveryStatus.COMPLETED, RecoveryStatus.APPROVED)).toBe(false);
    expect(canTransition(RecoveryStatus.REJECTED, RecoveryStatus.IDENTITY_PENDING)).toBe(false);
  });

  it("rejects invalid transitions with a typed domain error", () => {
    expect(() => assertTransition(RecoveryStatus.IDENTITY_PENDING, RecoveryStatus.COMPLETED)).toThrow(
      "Invalid recovery transition"
    );
  });
});
