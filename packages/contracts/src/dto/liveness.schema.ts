import { z } from "zod";

export const livenessSchema = z.object({
  challengeId: z.string().min(4).max(128),
  captureRef: z.string().min(8).max(256),
  mockOutcome: z.enum(["PASS", "FAIL"]).optional()
});

export type LivenessInput = z.infer<typeof livenessSchema>;
