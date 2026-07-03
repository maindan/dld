import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const contratoStatusEnum = pgEnum("contrato_status", ["pendente", "assinado"]);
export const contratoModoEnum = pgEnum("contrato_modo", ["modelo", "anexo"]);
export const contratoModeloEnum = pgEnum("contrato_modelo_tipo", [
  "prestacao",
  "confidencialidade",
  "manutencao",
]);

export const freelas = pgTable("freelas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull().default(""),
  cor: text("cor").notNull().default("#818cf8"),
  clienteNome: text("cliente_nome").notNull(),
  clienteEmail: text("cliente_email").notNull().default(""),
  clienteWhatsapp: text("cliente_whatsapp").notNull().default(""),
  /** Public token for /cronograma/[chave]. */
  chaveCrono: text("chave_crono").notNull().unique(),
  resumo: text("resumo").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const observacoes = pgTable("observacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id")
    .notNull()
    .references(() => freelas.id, { onDelete: "cascade" }),
  data: date("data").notNull(),
  texto: text("texto").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reunioes = pgTable("reunioes", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id")
    .notNull()
    .references(() => freelas.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  data: date("data").notNull(),
  topicos: text("topicos").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contratos = pgTable("contratos", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id")
    .notNull()
    .references(() => freelas.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  tipo: text("tipo").notNull(),
  status: contratoStatusEnum("status").notNull().default("pendente"),
  modo: contratoModoEnum("modo").notNull().default("modelo"),
  /** Which predefined template was used, when modo = "modelo". */
  modeloTipo: contratoModeloEnum("modelo_tipo"),
  data: date("data").notNull(),
  /** Public URL in Supabase Storage (bucket "uploads") when the contract was attached as a PDF instead of generated from a model. */
  arquivoPath: text("arquivo_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
