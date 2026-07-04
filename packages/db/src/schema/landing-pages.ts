import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { freelas } from "./freelas";

/**
 * Saved draft state for the landing page editor, so work isn't lost on refresh.
 * `header`/`secoes`/`footer`/`whatsapp` mirror the shape in
 * @danlimadev/contracts landing-page.ts 1:1 — see that file for the typed shape,
 * this column is intentionally untyped jsonb at the DB layer.
 */
export const landingPages = pgTable("landing_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id").references(() => freelas.id, { onDelete: "set null" }),
  modeloId: text("modelo_id").notNull(),
  corAcento: text("cor_acento").notNull().default("#818cf8"),
  /** Per-page DesignConfig overrides (fonts, background, button, radius...); null = theme defaults. */
  design: jsonb("design"),
  header: jsonb("header").notNull(),
  footer: jsonb("footer").notNull(),
  whatsapp: jsonb("whatsapp").notNull(),
  secoes: jsonb("secoes").notNull().default([]),
  geradoEm: timestamp("gerado_em", { withTimezone: true }),
  arquivoNome: text("arquivo_nome"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
