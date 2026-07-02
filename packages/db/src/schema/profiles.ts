import { pgTable, uuid, text } from "drizzle-orm/pg-core";

/** Mirrors a row in auth.users. One row per person who can log in (today, just Daniel). */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  nome: text("nome").notNull(),
  iniciais: text("iniciais").notNull(),
});
