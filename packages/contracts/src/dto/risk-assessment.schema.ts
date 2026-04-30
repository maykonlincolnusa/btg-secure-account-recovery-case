import { z } from "zod";

export const riskAssessmentSchema = z.object({
  signals: z.object({
    newDevice: z.boolean().optional(),
    unusualIp: z.boolean().optional(),
    geoMismatch: z.boolean().optional(),
    repeatedAttempts: z.number().int().min(0).max(20).optional(),
    sensitiveContactChange: z.boolean().optional(),
    faceMatchFailed: z.boolean().optional(),
    livenessFailed: z.boolean().optional(),
    anomalousBehavior: z.boolean().optional(),
    recentRecoveryRequests: z.number().int().min(0).max(20).optional()
  })
});

export type RiskAssessmentInput = z.infer<typeof riskAssessmentSchema>;
