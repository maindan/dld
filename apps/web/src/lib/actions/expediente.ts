"use server";

import { revalidatePath } from "next/cache";
import {
  startExpediente,
  pausarExpediente,
  retomarExpediente,
  encerrarExpediente,
  getRelatorioHoras,
  type RelatorioPeriodo,
  type RelatorioHoras,
} from "@/lib/queries/expediente";

export async function startExpedienteAction(projetos: string[]) {
  if (projetos.length === 0) return;
  await startExpediente(projetos);
  revalidatePath("/", "layout");
}

export async function pausarExpedienteAction(id: string) {
  await pausarExpediente(id);
  revalidatePath("/", "layout");
}

export async function retomarExpedienteAction(id: string) {
  await retomarExpediente(id);
  revalidatePath("/", "layout");
}

export async function encerrarExpedienteAction(id: string) {
  await encerrarExpediente(id);
  revalidatePath("/", "layout");
}

/** Read-only fetch used by the Relatório de horas card to refetch a month when the user navigates ‹ ›. */
export async function getRelatorioHorasAction(periodo: RelatorioPeriodo, offset: number): Promise<RelatorioHoras> {
  return getRelatorioHoras(periodo, offset);
}
