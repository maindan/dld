import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { freelas } from "./freelas";

/** Saved draft state for the landing page editor, so work isn't lost on refresh. */
export const landingPages = pgTable("landing_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id").references(() => freelas.id, { onDelete: "set null" }),
  modeloId: text("modelo_id").notNull(),
  marca: text("marca").notNull().default(""),
  corAcento: text("cor_acento").notNull().default("#818cf8"),
  headerLinks: text("header_links").notNull().default("Início, Serviços, Sobre, Contato"),
  footerTexto: text("footer_texto").notNull().default(""),
  footerContato: text("footer_contato").notNull().default(""),
  secoes: jsonb("secoes").notNull().default([]),
  geradoEm: timestamp("gerado_em", { withTimezone: true }),
  arquivoNome: text("arquivo_nome"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
