import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { freelas } from "./freelas";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelaId: uuid("freela_id").references(() => freelas.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  concluida: boolean("concluida").notNull().default(false),
  prazo: timestamp("prazo", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
