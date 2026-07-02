"use server";

import { revalidatePath } from "next/cache";
import { startExpediente, pausarExpediente, retomarExpediente, encerrarExpediente } from "@/lib/queries/expediente";

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
