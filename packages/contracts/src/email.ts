import { z } from "zod";

/**
 * Boundary contract between apps/web (auth flows) and services/email
 * (Resend integration). Neither side should reach past this shape.
 */

export const sendPasswordResetEmailInputSchema = z.object({
  to: z.string().email(),
  resetUrl: z.string().url(),
});

export type SendPasswordResetEmailInput = z.infer<typeof sendPasswordResetEmailInputSchema>;
