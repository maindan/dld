import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
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
