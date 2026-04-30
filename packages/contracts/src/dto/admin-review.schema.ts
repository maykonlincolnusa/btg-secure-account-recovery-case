import { z } from "zod";

export const adminDecisionSchema = z.object({
  operatorId: z.string().min(3).max(80),
  reason: z.string().min(5).max(500),
  note: z.string().max(1000).optional()
});

export const adminNoteSchema = z.object({
  operatorId: z.string().min(3).max(80),
  note: z.string().min(3).max(1000)
});

export type AdminDecisionInput = z.infer<typeof adminDecisionSchema>;
export type AdminNoteInput = z.infer<typeof adminNoteSchema>;
