import { z } from "zod";

export const faceMatchSchema = z.object({
  selfieImageRef: z.string().min(8).max(256),
  documentImageRef: z.string().min(8).max(256).optional(),
  mockOutcome: z.enum(["PASS", "FAIL"]).optional()
});

export type FaceMatchInput = z.infer<typeof faceMatchSchema>;
