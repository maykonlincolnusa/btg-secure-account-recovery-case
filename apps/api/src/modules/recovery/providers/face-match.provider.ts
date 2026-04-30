export interface FaceMatchProvider {
  verify(input: {
    protocolId: string;
    selfieImageRef: string;
    documentImageRef?: string;
    mockOutcome?: "PASS" | "FAIL";
  }): Promise<{ success: boolean; score: number; reasonCode?: string }>;
}

export class MockFaceMatchProvider implements FaceMatchProvider {
  async verify(input: Parameters<FaceMatchProvider["verify"]>[0]) {
    const success = input.mockOutcome !== "FAIL";
    return success
      ? { success, score: 96 }
      : { success, score: 34, reasonCode: "FACE_NOT_MATCHED" };
  }
}
