import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const clientes = pgTable("clientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  empresa: text("empresa").notNull().default(""),
  observacoes: text("observacoes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
