import { db, clientes, freelas } from "@danlimadev/db";
import { asc, eq } from "drizzle-orm";

export interface ClienteListItem {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  observacoes: string;
  freelasCount: number;
}

export interface ClienteDetail {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  observacoes: string;
}

export async function getClientesList(): Promise<ClienteListItem[]> {
  const [clientesList, vinculos] = await Promise.all([
    db.select().from(clientes).orderBy(asc(clientes.nome)),
    db.select({ clienteId: freelas.clienteId }).from(freelas),
  ]);

  const countByCliente = new Map<string, number>();
  for (const v of vinculos) {
    countByCliente.set(v.clienteId, (countByCliente.get(v.clienteId) ?? 0) + 1);
  }

  return clientesList.map((c) => ({
    id: c.id,
    nome: c.nome,
    email: c.email,
    whatsapp: c.whatsapp,
    empresa: c.empresa,
    observacoes: c.observacoes,
    freelasCount: countByCliente.get(c.id) ?? 0,
  }));
}

export async function getClienteById(id: string): Promise<ClienteDetail | null> {
  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
  if (!cliente) return null;
  return {
    id: cliente.id,
    nome: cliente.nome,
    email: cliente.email,
    whatsapp: cliente.whatsapp,
    empresa: cliente.empresa,
    observacoes: cliente.observacoes,
  };
}

export async function createCliente(input: {
  nome: string;
  email?: string;
  whatsapp?: string;
  empresa?: string;
  observacoes?: string;
}) {
  const [cliente] = await db
    .insert(clientes)
    .values({
      nome: input.nome,
      email: input.email ?? "",
      whatsapp: input.whatsapp ?? "",
      empresa: input.empresa ?? "",
      observacoes: input.observacoes ?? "",
    })
    .returning();
  return cliente;
}

export async function updateCliente(
  id: string,
  patch: Partial<{ nome: string; email: string; whatsapp: string; empresa: string; observacoes: string }>
) {
  await db
    .update(clientes)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(clientes.id, id));
}

/**
 * Deletes a cliente. Guards against the Postgres FK constraint on `freelas.clienteId`
 * (NOT NULL, no cascade) by checking for linked freelas first and raising a clear,
 * actionable error instead of letting the generic "violates foreign key constraint"
 * bubble up from the driver.
 */
export async function deleteCliente(id: string) {
  const vinculados = await db.select({ id: freelas.id }).from(freelas).where(eq(freelas.clienteId, id));
  if (vinculados.length > 0) {
    throw new Error(
      `Não é possível excluir: ${vinculados.length} freela(s) vinculado(s) a este cliente.`
    );
  }
  await db.delete(clientes).where(eq(clientes.id, id));
}
