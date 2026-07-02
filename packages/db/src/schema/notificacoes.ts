import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Notifications themselves are computed on read (late items + orçamentos aguardando
 * confirmação de pagamento), not stored — that avoids stale duplicates. This table
 * only remembers which computed notification keys were dismissed, so a dismissal
 * survives a reload and syncs across devices.
 */
export const notificacoesDismissidas = pgTable("notificacoes_dismissidas", {
  chave: text("chave").primaryKey(),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }).notNull().defaultNow(),
});
