/**
 * Directly sets a Supabase Auth user's password via the Admin API. For when
 * the self-serve "esqueci minha senha" flow (email delivery, expired/broken
 * link, etc.) isn't an option. Does not touch `auth.users` via SQL/migration
 * — that table is Supabase-managed and mutating it directly bypasses GoTrue's
 * password hashing/session invariants. This hits the same admin endpoint
 * `supabase.auth.admin.updateUserById` uses.
 *
 * Usage (from packages/db): pnpm reset:password <email> <new-password>
 */
async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    throw new Error("usage: reset-password.ts <email> <new-password>");
  }
  if (password.length < 8) {
    throw new Error("password must be at least 8 characters (matches the app's own minLength on atualizar-senha)");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY not set");
  }

  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=200`, {
    headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` },
  });
  if (!listRes.ok) throw new Error(`list users failed: ${listRes.status} ${await listRes.text()}`);
  const { users } = (await listRes.json()) as { users: Array<{ id: string; email: string }> };
  const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error(`no user found with email ${email}`);
  }

  const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
    method: "PUT",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  if (!updateRes.ok) {
    throw new Error(`update password failed: ${updateRes.status} ${await updateRes.text()}`);
  }

  console.log(`password reset for ${email} (${user.id})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
