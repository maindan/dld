"use server";

import { revalidatePath } from "next/cache";
import {
  setTaskPessoalDone,
  setOrcamentoItemDone,
  createTaskPessoal,
  deleteTaskPessoal,
  createProjetoPessoal,
} from "@/lib/queries/tasks";

export async function toggleTaskPessoalAction(id: string, done: boolean) {
  await setTaskPessoalDone(id, done);
  revalidatePath("/", "layout");
}

export async function toggleOrcamentoItemAction(id: string, done: boolean) {
  await setOrcamentoItemDone(id, done);
  revalidatePath("/", "layout");
}

export async function createTaskPessoalAction(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;
  const prazo = String(formData.get("prazo") ?? "").trim() || null;
  const projetoId = String(formData.get("projetoId") ?? "").trim() || null;
  await createTaskPessoal({ titulo, prazo, projetoId });
  revalidatePath("/tasks");
}

export async function deleteTaskPessoalAction(id: string) {
  await deleteTaskPessoal(id);
  revalidatePath("/tasks");
}

export async function createProjetoPessoalAction(nome: string) {
  if (!nome.trim()) return null;
  const projeto = await createProjetoPessoal(nome.trim());
  revalidatePath("/tasks");
  return projeto ?? null;
}
