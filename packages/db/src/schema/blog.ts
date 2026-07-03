import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const postStatusEnum = pgEnum("post_status", ["rascunho", "publicado"]);

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  /** URL-safe identifier for the public /blog/[slug] page. Unique so publishing never collides. */
  slug: text("slug").notNull().unique(),
  resumo: text("resumo").notNull().default(""),
  corpo: text("corpo").notNull().default(""),
  /** Public URL in Supabase Storage (bucket "uploads"). */
  capaUrl: text("capa_url"),
  status: postStatusEnum("status").notNull().default("rascunho"),
  publicadoEm: timestamp("publicado_em", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
