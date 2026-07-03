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

export const parcelaTipoEnum = pgEnum("parcela_tipo", ["aprovacao", "entrega"]);

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
  /** Sum of the paid `orcamento_parcelas.valor` — kept denormalized for status/UI, always recomputed by registrarParcelaPagamento. */
  pago: numeric("pago", { precision: 12, scale: 2 }).notNull().default("0"),
  data: date("data").notNull(),
  prazoExec: text("prazo_exec").notNull().default(""),
  /** Standard terms paragraph shown on the public /orc/[chave] page (validity, warranty, scope caveat). */
  termos: text("termos").notNull().default(
    "O orçamento possui prazo de 30 dias após recebimento, contempla os serviços descritos acima e 6 meses (a contar da entrega do serviço) de manutenção de bugs e atualizações relacionadas aos serviços prestados, que não incluem adição de novas funcionalidades além dos serviços descritos, caso surjam novas demandas após finalização do serviço será elaborado novo orçamento.",
  ),
  aprovadoEm: timestamp("aprovado_em", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Every orçamento is always billed as exactly two installments — 50% na
 * aprovação, 50% na entrega — each invoiced as its OWN NF. Simples Nacional's
 * rate depends on cumulative revenue (RBT12), so the two NFs (often issued
 * weeks/months apart) can legitimately carry different imposto/retenção
 * percentages — a single flat rate on the whole `orcamentos.pago` amount
 * (the old model) overstates or understates tax the moment the two NFs
 * diverge. One row per parcela lets each carry its own real percentages.
 */
export const orcamentoParcelas = pgTable("orcamento_parcelas", {
  id: uuid("id").primaryKey().defaultRandom(),
  orcamentoId: uuid("orcamento_id")
    .notNull()
    .references(() => orcamentos.id, { onDelete: "cascade" }),
  tipo: parcelaTipoEnum("tipo").notNull(),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
  pago: boolean("pago").notNull().default(false),
  pagoEm: timestamp("pago_em", { withTimezone: true }),
  /** Whether the NF for this specific parcela has already been emitted. */
  faturado: boolean("faturado").notNull().default(false),
  /** % paid by the CONTRATADO on this parcela's NF emission. */
  percentualImpostoNf: numeric("percentual_imposto_nf", { precision: 5, scale: 2 }).notNull().default("5"),
  /** % the client withholds from this parcela's NF value on payment. */
  percentualRetencaoCliente: numeric("percentual_retencao_cliente", { precision: 5, scale: 2 })
    .notNull()
    .default("11"),
});

export const orcamentoItens = pgTable("orcamento_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  orcamentoId: uuid("orcamento_id")
    .notNull()
    .references(() => orcamentos.id, { onDelete: "cascade" }),
  desc: text("desc").notNull(),
  tempo: text("tempo").notNull().default(""),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull().default("0"),
  /** Optional URL shown next to the item title on the public orçamento document (ex.: link do site/sistema). */
  link: text("link"),
  /** Sub-bullets describing the scope of this item on the public orçamento document. */
  bullets: text("bullets").array().notNull().default([]),
  prazo: date("prazo"),
  done: boolean("done").notNull().default(false),
  ordem: integer("ordem").notNull().default(0),
});
