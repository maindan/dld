"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createFreela,
  createOrcamento,
  enviarOrcamento,
  registrarPagamento,
  createOrcamentoItem,
  deleteOrcamentoItem,
  createObservacao,
  createReuniao,
  createContrato,
  setContratoStatus,
} from "@/lib/queries/freelas";

export async function createFreelaAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const clienteNome = String(formData.get("clienteNome") ?? "").trim();
  if (!nome || !clienteNome) return;

  const freela = await createFreela({
    nome,
    tipo: String(formData.get("tipo") ?? "").trim(),
    cor: String(formData.get("cor") ?? "#818cf8"),
    clienteNome,
    clienteEmail: String(formData.get("clienteEmail") ?? "").trim(),
    clienteWhatsapp: String(formData.get("clienteWhatsapp") ?? "").trim(),
    resumo: String(formData.get("resumo") ?? "").trim(),
  });
  revalidatePath("/freelas");
  if (freela) redirect(`/freelas/${freela.id}`);
}

export async function createOrcamentoAction(freelaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const valor = Number(formData.get("valor") ?? 0);
  if (!titulo || !(valor > 0)) return;
  await createOrcamento({
    freelaId,
    titulo,
    valor,
    data: String(formData.get("data") ?? new Date().toISOString().slice(0, 10)),
    prazoExec: String(formData.get("prazoExec") ?? "").trim(),
  });
  revalidatePath(`/freelas/${freelaId}`);
}

export async function enviarOrcamentoAction(freelaId: string, orcamentoId: string) {
  await enviarOrcamento(orcamentoId);
  revalidatePath(`/freelas/${freelaId}`);
}

export async function registrarPagamentoAction(freelaId: string, orcamentoId: string, valor: number) {
  if (!(valor > 0)) return;
  await registrarPagamento(orcamentoId, valor);
  revalidatePath(`/freelas/${freelaId}`);
  revalidatePath("/inicio");
  revalidatePath("/metas");
}

export async function createOrcamentoItemAction(freelaId: string, orcamentoId: string, formData: FormData) {
  const desc = String(formData.get("desc") ?? "").trim();
  if (!desc) return;
  await createOrcamentoItem({
    orcamentoId,
    desc,
    tempo: String(formData.get("tempo") ?? "").trim(),
    valor: Number(formData.get("valor") ?? 0),
    prazo: String(formData.get("prazo") ?? "").trim() || null,
    ordem: Number(formData.get("ordem") ?? 0),
  });
  revalidatePath(`/freelas/${freelaId}`);
  revalidatePath("/tasks");
}

export async function deleteOrcamentoItemAction(freelaId: string, itemId: string) {
  await deleteOrcamentoItem(itemId);
  revalidatePath(`/freelas/${freelaId}`);
  revalidatePath("/tasks");
}

export async function createObservacaoAction(freelaId: string, formData: FormData) {
  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) return;
  await createObservacao({ freelaId, texto, data: new Date().toISOString().slice(0, 10) });
  revalidatePath(`/freelas/${freelaId}`);
}

export async function createReuniaoAction(freelaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;
  const topicos = String(formData.get("topicos") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  await createReuniao({
    freelaId,
    titulo,
    data: String(formData.get("data") ?? new Date().toISOString().slice(0, 10)),
    topicos,
  });
  revalidatePath(`/freelas/${freelaId}`);
}

export async function createContratoAction(freelaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;
  await createContrato({
    freelaId,
    titulo,
    tipo: String(formData.get("tipo") ?? "").trim(),
    data: String(formData.get("data") ?? new Date().toISOString().slice(0, 10)),
  });
  revalidatePath(`/freelas/${freelaId}`);
}

export async function toggleContratoStatusAction(freelaId: string, id: string, assinado: boolean) {
  await setContratoStatus(id, assinado ? "assinado" : "pendente");
  revalidatePath(`/freelas/${freelaId}`);
}
