import { pgTable, uuid, text, numeric, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { orcamentos } from "./orcamentos";

export const metas = pgTable("metas", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Links a goal to the orçamentos whose received/receivable value counts toward it. */
export const metaRecursos = pgTable(
  "meta_recursos",
  {
    metaId: uuid("meta_id")
      .notNull()
      .references(() => metas.id, { onDelete: "cascade" }),
    orcamentoId: uuid("orcamento_id")
      .notNull()
      .references(() => orcamentos.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.metaId, t.orcamentoId] })],
);
