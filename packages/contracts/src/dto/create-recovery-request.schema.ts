import { z } from "zod";

export const createRecoveryRequestSchema = z
  .object({
    accountIdentifier: z.string().min(4).max(80),
    previousEmail: z.string().email().optional(),
    previousPhone: z.string().min(8).max(32).optional(),
    targetEmail: z.string().email().optional(),
    targetPhone: z.string().min(8).max(32).optional(),
    consentAccepted: z.literal(true),
    deviceFingerprint: z.string().min(8).max(256).optional()
  })
  .refine((value) => value.previousEmail || value.previousPhone || value.accountIdentifier, {
    message: "Informe pelo menos um identificador permitido"
  })
  .refine((value) => value.targetEmail || value.targetPhone, {
    message: "Informe e-mail ou telefone de destino"
  });

export type CreateRecoveryRequestInput = z.infer<typeof createRecoveryRequestSchema>;
