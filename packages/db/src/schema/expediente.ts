import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * One row per work session. Elapsed time is computed server-side from
 * (encerradoEm ?? now) - iniciadoEm - sum(pausas), never trusted from the client —
 * that's what lets the timer survive a page reload or a lost connection, unlike
 * the prototype's in-memory setInterval.
 */
export const expedientes = pgTable("expedientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Freela ids and/or the literal 'pessoal', matching what was checked in the start modal. */
  projetos: text("projetos").array().notNull(),
  iniciadoEm: timestamp("iniciado_em", { withTimezone: true }).notNull().defaultNow(),
  encerradoEm: timestamp("encerrado_em", { withTimezone: true }),
});

export const expedientePausas = pgTable("expediente_pausas", {
  id: uuid("id").primaryKey().defaultRandom(),
  expedienteId: uuid("expediente_id")
    .notNull()
    .references(() => expedientes.id, { onDelete: "cascade" }),
  pausadoEm: timestamp("pausado_em", { withTimezone: true }).notNull().defaultNow(),
  retomadoEm: timestamp("retomado_em", { withTimezone: true }),
});
