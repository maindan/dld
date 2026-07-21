import { sendPasswordResetEmailInputSchema, type SendPasswordResetEmailInput } from "@danlimadev/contracts";
import { resend, EMAIL_FROM } from "./client";
import { passwordResetSubject, passwordResetHtml, passwordResetText } from "./templates/password-reset";

/** Sends the "reset your password" email via Resend. Throws if Resend
 * rejects the request (bad API key, unverified sender domain, etc.) so the
 * caller can decide whether to surface or swallow the failure. */
export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void> {
  const { to, resetUrl } = sendPasswordResetEmailInputSchema.parse(input);

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: passwordResetSubject(),
    html: passwordResetHtml(resetUrl),
    text: passwordResetText(resetUrl),
  });

  if (error) {
    throw new Error(`Resend rejected the password reset email: ${error.name} - ${error.message}`);
  }
}
