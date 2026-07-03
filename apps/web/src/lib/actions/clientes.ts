"use server";

import { revalidatePath } from "next/cache";
import { createCliente, updateCliente, deleteCliente } from "@/lib/queries/clientes";

function readClientePatch(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    empresa: String(formData.get("empresa") ?? "").trim(),
    observacoes: String(formData.get("observacoes") ?? "").trim(),
  };
}

/**
 * Returns the created cliente's `{ id, nome }` (or `null` if `nome` was blank) so
 * callers can both redirect a management-page dialog and, from the "novo freela"
 * flow, auto-select the freshly created cliente without leaving that form.
 */
export async function createClienteAction(
  formData: FormData
): Promise<{ id: string; nome: string } | null> {
  const patch = readClientePatch(formData);
  if (!patch.nome) return null;

  const cliente = await createCliente(patch);
  revalidatePath("/freelas/clientes");
  revalidatePath("/freelas");
  return cliente ? { id: cliente.id, nome: cliente.nome } : null;
}

export async function updateClienteAction(id: string, formData: FormData) {
  const patch = readClientePatch(formData);
  if (!patch.nome) return;

  await updateCliente(id, patch);
  revalidatePath("/freelas/clientes");
  revalidatePath("/freelas");
}

export async function deleteClienteAction(id: string) {
  await deleteCliente(id);
  revalidatePath("/freelas/clientes");
  revalidatePath("/freelas");
}
