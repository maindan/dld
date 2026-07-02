"use server";

import { revalidatePath } from "next/cache";
import { dismissNotificacao } from "@/lib/queries/notificacoes";

export async function dismissNotificacaoAction(chave: string) {
  await dismissNotificacao(chave);
  revalidatePath("/", "layout");
}
