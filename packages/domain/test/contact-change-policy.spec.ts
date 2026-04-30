import { describe, expect, it } from "vitest";
import { RecoveryStatus, RiskLevel, SuggestedDecision, canApplySensitiveContactChange } from "../src";

describe("contact change policy", () => {
  it("requires identity, liveness and approved status", () => {
    expect(
      canApplySensitiveContactChange({
        status: RecoveryStatus.APPROVED,
        faceVerified: true,
        livenessVerified: true,
        riskLevel: RiskLevel.LOW,
        suggestedDecision: SuggestedDecision.AUTO_APPROVE
      })
    ).toBe(true);
  });

  it("blocks contact change before liveness", () => {
    expect(
      canApplySensitiveContactChange({
        status: RecoveryStatus.APPROVED,
        faceVerified: true,
        livenessVerified: false,
        riskLevel: RiskLevel.LOW,
        suggestedDecision: SuggestedDecision.AUTO_APPROVE
      })
    ).toBe(false);
  });
});
