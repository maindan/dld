import { sendPasswordResetEmail } from "@danlimadev/email";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generates a Supabase recovery link (bypassing Supabase's own mailer) and
 * sends it ourselves via Resend. Always resolves — never throws — so a
 * caller can return one generic "check your inbox" response regardless of
 * whether `email` belongs to a real account. This avoids leaking which
 * emails are registered, which matters more here than usual: this app has
 * no self-registration, so the set of valid accounts is small and fixed.
 *
 * Failures (unknown email, Resend rejection, etc.) are logged, not thrown.
 */
export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error || !data.properties?.action_link) {
    console.error("[password-reset] generateLink failed", email, error);
    return;
  }

  try {
    await sendPasswordResetEmail({ to: email, resetUrl: data.properties.action_link });
  } catch (err) {
    console.error("[password-reset] sendPasswordResetEmail failed", email, err);
  }
}
