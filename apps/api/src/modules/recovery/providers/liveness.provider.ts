export interface LivenessProvider {
  verify(input: {
    protocolId: string;
    challengeId: string;
    captureRef: string;
    mockOutcome?: "PASS" | "FAIL";
  }): Promise<{ success: boolean; score: number; reasonCode?: string }>;
}

export class MockLivenessProvider implements LivenessProvider {
  async verify(input: Parameters<LivenessProvider["verify"]>[0]) {
    const success = input.mockOutcome !== "FAIL";
    return success
      ? { success, score: 98 }
      : { success, score: 20, reasonCode: "LIVENESS_FAILED" };
  }
}
