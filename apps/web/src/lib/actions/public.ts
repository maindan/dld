"use server";

import { revalidatePath } from "next/cache";
import { aprovarOrcamentoSchema } from "@danlimadev/contracts";
import { aprovarOrcamentoPorChave } from "@/lib/queries/public";

export async function aprovarOrcamentoAction(chave: string) {
  const { token } = aprovarOrcamentoSchema.parse({ token: chave });
  const aprovado = await aprovarOrcamentoPorChave(token);
  revalidatePath(`/orc/${chave}`);
  return aprovado;
}
