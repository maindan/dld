"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/auth/password-reset";

const emailSchema = z.string().email();

/** Origin of the incoming request, so the recovery link redirects back to
 * wherever the app is actually running (localhost in dev, the real host in
 * prod) without hardcoding a site URL env var. */
async function requestOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = headersList.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

/** Always resolves — see requestPasswordReset for why this never signals
 * whether `email` matched a real account. */
export async function requestPasswordResetAction(email: string): Promise<void> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return;

  const origin = await requestOrigin();
  await requestPasswordReset(parsed.data, `${origin}/auth/atualizar-senha`);
}
