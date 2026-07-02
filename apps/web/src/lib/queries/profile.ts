import { db, profiles } from "@danlimadev/db";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  return profile ?? { id: user.id, nome: user.email ?? "danlimadev", iniciais: "dl" };
}
