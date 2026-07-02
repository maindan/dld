import {
  pgTable,
  uuid,
  text,
  date,
  numeric,
  boolean,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { freelas } from "./freelas";

export const orcamentoStatusEnum = pgEnum("orcamento_status", [
  "rascunho",
  "enviado",
  "aprovado",
  "pago_parcial",
  "pago_total",
  "recusado",
]);

export const orcamentos = pgTable("orcamentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id")
    .notNull()
    .references(() => freelas.id, { onDelete: "cascade" }),
  /** Sequential display number, rendered as ORC-001. */
  numero: integer("numero").notNull().generatedAlwaysAsIdentity(),
  titulo: text("titulo").notNull(),
  status: orcamentoStatusEnum("status").notNull().default("rascunho"),
  /** Public token for /orc/[chave]. Unauthenticated clients approve through this. */
  chave: text("chave").notNull().unique(),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
  pago: numeric("pago", { precision: 12, scale: 2 }).notNull().default("0"),
  data: date("data").notNull(),
  prazoExec: text("prazo_exec").notNull().default(""),
  aprovadoEm: timestamp("aprovado_em", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orcamentoItens = pgTable("orcamento_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  orcamentoId: uuid("orcamento_id")
    .notNull()
    .references(() => orcamentos.id, { onDelete: "cascade" }),
  desc: text("desc").notNull(),
  tempo: text("tempo").notNull().default(""),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull().default("0"),
  prazo: date("prazo"),
  done: boolean("done").notNull().default(false),
  ordem: integer("ordem").notNull().default(0),
});
