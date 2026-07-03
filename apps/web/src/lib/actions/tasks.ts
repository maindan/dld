"use server";

import { revalidatePath } from "next/cache";
import {
  setTaskPessoalDone,
  setOrcamentoItemDone,
  createTaskPessoal,
  deleteTaskPessoal,
  createProjetoPessoal,
} from "@/lib/queries/tasks";
import { createOrcamentoItem } from "@/lib/queries/freelas";
import { db, orcamentos } from "@danlimadev/db";
import { desc, eq } from "drizzle-orm";

export async function toggleTaskPessoalAction(id: string, done: boolean) {
  await setTaskPessoalDone(id, done);
  revalidatePath("/", "layout");
}

export async function toggleOrcamentoItemAction(id: string, done: boolean) {
  await setOrcamentoItemDone(id, done);
  revalidatePath("/", "layout");
}

/**
 * Resolves which orçamento of a freela should receive an ad-hoc item created from the
 * Tasks screen: the most recent one that isn't recusado, else the most recent overall.
 */
async function resolveOrcamentoAlvo(freelaId: string): Promise<string | null> {
  const rows = await db
    .select({ id: orcamentos.id, status: orcamentos.status })
    .from(orcamentos)
    .where(eq(orcamentos.freelaId, freelaId))
    .orderBy(desc(orcamentos.createdAt));
  if (rows.length === 0) return null;
  const naoRecusado = rows.find((o) => o.status !== "recusado");
  return (naoRecusado ?? rows[0]).id;
}

export async function createTaskPessoalAction(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;
  const prazo = String(formData.get("prazo") ?? "").trim() || null;
  const destinoTipo = String(formData.get("destinoTipo") ?? "pessoal").trim();
  const destinoId = String(formData.get("destinoId") ?? "").trim() || null;

  if (destinoTipo === "freela" && destinoId) {
    const orcamentoId = await resolveOrcamentoAlvo(destinoId);
    if (!orcamentoId) return;
    await createOrcamentoItem({
      orcamentoId,
      desc: titulo,
      tempo: "",
      valor: 0,
      prazo,
      ordem: 0,
    });
    revalidatePath("/tasks");
    revalidatePath(`/freelas/${destinoId}`);
    return;
  }

  await createTaskPessoal({ titulo, prazo, projetoId: destinoId });
  revalidatePath("/tasks");
}

export async function deleteTaskPessoalAction(id: string) {
  await deleteTaskPessoal(id);
  revalidatePath("/tasks");
}

export async function createProjetoPessoalAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return null;
  const desc = String(formData.get("desc") ?? "").trim();
  const planejamento = String(formData.get("planejamento") ?? "").trim();
  const stacks = String(formData.get("stacks") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const projeto = await createProjetoPessoal({ nome, desc, planejamento, stacks });
  revalidatePath("/tasks");
  return projeto ?? null;
}
