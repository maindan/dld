import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

export const freelaStatusEnum = pgEnum("freela_status", [
  "ativo",
  "pausado",
  "concluido",
  "cancelado",
]);

export const freelas = pgTable("freelas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  cliente: text("cliente").notNull(),
  status: freelaStatusEnum("status").notNull().default("ativo"),
  corAcento: text("cor_acento").notNull().default("#818cf8"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orcamentoStatusEnum = pgEnum("orcamento_status", [
  "rascunho",
  "enviado",
  "aprovado",
  "pago",
  "recusado",
]);

export const orcamentos = pgTable("orcamentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id")
    .notNull()
    .references(() => freelas.id, { onDelete: "cascade" }),
  status: orcamentoStatusEnum("status").notNull().default("rascunho"),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
  /** Opaque token used in the unauthenticated public approval link (/orcamento/[token]). */
  tokenPublico: text("token_publico").notNull().unique(),
  aprovadoEm: timestamp("aprovado_em", { withTimezone: true }),
  pagoEm: timestamp("pago_em", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
