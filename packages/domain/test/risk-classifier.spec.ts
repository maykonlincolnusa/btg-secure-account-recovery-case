import { describe, expect, it } from "vitest";
import { RiskLevel, SuggestedDecision, classifyRisk } from "../src";

describe("risk classifier", () => {
  it("auto approves low risk requests", () => {
    const result = classifyRisk({ sensitiveContactChange: true });
    expect(result.riskLevel).toBe(RiskLevel.LOW);
    expect(result.suggestedDecision).toBe(SuggestedDecision.AUTO_APPROVE);
  });

  it("requires step-up for medium risk", () => {
    const result = classifyRisk({ newDevice: true, unusualIp: true, sensitiveContactChange: true });
    expect(result.riskLevel).toBe(RiskLevel.MEDIUM);
    expect(result.suggestedDecision).toBe(SuggestedDecision.STEP_UP);
  });

  it("rejects critical biometric failures", () => {
    const result = classifyRisk({ faceMatchFailed: true });
    expect(result.riskLevel).toBe(RiskLevel.CRITICAL);
    expect(result.suggestedDecision).toBe(SuggestedDecision.REJECT);
  });
});
