import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const portfolioItens = pgTable("portfolio_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  desc: text("desc").notNull().default(""),
  /** Public URL in Supabase Storage (bucket "uploads"). */
  imagem: text("imagem"),
  stack: text("stack").array().notNull().default([]),
  github: text("github").notNull().default(""),
  link: text("link").notNull().default(""),
  ordem: integer("ordem").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
