import { z } from "zod";

export const contactChangeSchema = z.object({
  newEmail: z.string().email(),
  newPhone: z.string().min(8).max(32),
  replayNonce: z.string().min(8).max(128)
});

export type ContactChangeInput = z.infer<typeof contactChangeSchema>;
