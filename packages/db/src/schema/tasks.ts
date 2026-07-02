import { pgTable, uuid, text, date, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Non-client work (study, personal site, internal tooling). Client-facing tasks are
 * orcamento_itens instead — the Tasks screen unions both, but they're different
 * lifecycles: a personal task has no client to bill, an orçamento item always does.
 */
export const projetosPessoais = pgTable("projetos_pessoais", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  desc: text("desc").notNull().default(""),
  planejamento: text("planejamento").notNull().default(""),
  stacks: text("stacks").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasksPessoais = pgTable("tasks_pessoais", {
  id: uuid("id").primaryKey().defaultRandom(),
  projetoId: uuid("projeto_id").references(() => projetosPessoais.id, {
    onDelete: "set null",
  }),
  titulo: text("titulo").notNull(),
  prazo: date("prazo"),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
