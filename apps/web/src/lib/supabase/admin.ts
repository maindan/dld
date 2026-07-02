import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

/**
 * Server-only client that bypasses RLS. Never import this from a Client Component
 * or anything bundled for the browser. Use for the public budget-approval flow
 * (unauthenticated client approves, we write on their behalf) and webhooks.
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
