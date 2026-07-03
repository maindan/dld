"use server";

import { revalidatePath } from "next/cache";
import {
  createMeta,
  deleteMeta,
  linkOrcamentoToMeta,
  linkOrcamentosToMeta,
  unlinkOrcamentoFromMeta,
} from "@/lib/queries/metas";

export async function createMetaAction(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const valor = Number(formData.get("valor") ?? 0);
  if (!titulo || !(valor > 0)) return;
  await createMeta({ titulo, valor });
  revalidatePath("/metas");
  revalidatePath("/inicio");
}

export async function deleteMetaAction(id: string) {
  await deleteMeta(id);
  revalidatePath("/metas");
  revalidatePath("/inicio");
}

export async function linkOrcamentoAction(metaId: string, orcamentoId: string) {
  await linkOrcamentoToMeta(metaId, orcamentoId);
  revalidatePath("/metas");
  revalidatePath("/inicio");
}

/** Aplica de uma vez todos os vínculos marcados no modal "Vincular orçamentos". */
export async function linkOrcamentosAction(metaId: string, orcamentoIds: string[]) {
  await linkOrcamentosToMeta(metaId, orcamentoIds);
  revalidatePath("/metas");
  revalidatePath("/inicio");
}

export async function unlinkOrcamentoAction(metaId: string, orcamentoId: string) {
  await unlinkOrcamentoFromMeta(metaId, orcamentoId);
  revalidatePath("/metas");
  revalidatePath("/inicio");
}
