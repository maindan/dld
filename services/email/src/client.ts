import { Resend } from "resend";

const apiKey = process.env.RESEND_KEY;
if (!apiKey) {
  throw new Error(
    "RESEND_KEY is not set. Create an API key at https://resend.com/api-keys and set it in .env.local (apps/web) or the environment running this service.",
  );
}

/** Sender identity for all transactional email. Override once a custom domain
 * is verified in Resend (https://resend.com/domains) — until then Resend's
 * shared sandbox domain works but only delivers to the account owner's own
 * verified address. */
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? "danlimadev <onboarding@resend.dev>";

export const resend = new Resend(apiKey);
