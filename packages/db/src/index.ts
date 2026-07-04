import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
// postgres-js parses this as a URL internally and throws a bare, redacted
// "TypeError: Invalid URL" with no indication of *which* env var is the
// culprit — validate it ourselves first so a copy-paste mistake (stray
// quotes, a truncated paste, a missing "postgresql://" scheme) surfaces as
// an actionable error instead of a mystery crash during module load.
try {
  new URL(connectionString);
} catch {
  throw new Error(
    'DATABASE_URL is not a valid connection URL (must start with "postgresql://" or "postgres://" — check for stray quotes, whitespace, or a truncated paste in wherever this env var is set)',
  );
}

/**
 * Next.js dev mode re-evaluates this module on every Fast Refresh, which would
 * otherwise open a brand new postgres connection pool each time and never close
 * the old one — a few edits and you exhaust Supabase's connection limit
 * ("remaining connection slots are reserved for roles with the SUPERUSER
 * attribute"). Caching the client on `globalThis` outside production survives
 * module reloads, matching the standard Next.js + node-postgres/Drizzle pattern.
 */
declare global {
  var __danlimadevPgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  process.env.NODE_ENV === "production"
    ? postgres(connectionString, { prepare: false })
    : (globalThis.__danlimadevPgClient ??= postgres(connectionString, { prepare: false, max: 10 }));

export const db = drizzle(client, { schema });
export * from "./schema";
