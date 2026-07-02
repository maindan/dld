import { db, profiles } from "../index";
import { eq } from "drizzle-orm";

/**
 * Provisions the single account this app allows to log in. Idempotent: safe to
 * re-run, it only creates what's missing. There is no public sign-up screen by
 * design ("acesso restrito") so this admin-API call is the only way in.
 *
 * Usage: node --env-file=.env --env-file=../../apps/web/.env.local -r tsx/cjs src/scripts/seed-admin.ts <email> <password> <nome>
 */
async function main() {
  const [email, password, nome] = process.argv.slice(2);
  if (!email || !password || !nome) {
    throw new Error("usage: seed-admin.ts <email> <password> <nome>");
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
  let userId = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;

  if (userId) {
    console.log(`user already exists: ${email} (${userId})`);
  } else {
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (!createRes.ok) {
      throw new Error(`create user failed: ${createRes.status} ${await createRes.text()}`);
    }
    const created = (await createRes.json()) as { id: string };
    userId = created.id;
    console.log(`created user: ${email} (${userId})`);
  }

  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLowerCase())
    .join("");

  const existing = await db.select().from(profiles).where(eq(profiles.id, userId));
  if (existing.length === 0) {
    await db.insert(profiles).values({ id: userId, nome, iniciais });
    console.log(`created profile for ${nome} (${iniciais})`);
  } else {
    await db.update(profiles).set({ nome, iniciais }).where(eq(profiles.id, userId));
    console.log(`updated profile for ${nome} (${iniciais})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
