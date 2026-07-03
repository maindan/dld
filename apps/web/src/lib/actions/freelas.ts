"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createFreela,
  updateFreelaResumo,
  createOrcamento,
  enviarOrcamento,
  registrarParcelaPagamento,
  updateParcelaImpostos,
  updateOrcamentoTermos,
  createOrcamentoItem,
  deleteOrcamentoItem,
  createObservacao,
  createReuniao,
  createContrato,
  setContratoStatus,
  CONTRATO_MODELOS,
  type ContratoModeloTipo,
} from "@/lib/queries/freelas";
import { uploadPublicFile } from "@/lib/supabase/storage";

export async function createFreelaAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  if (!nome || !clienteId) return;

  const freela = await createFreela({
    nome,
    tipo: String(formData.get("tipo") ?? "").trim(),
    cor: String(formData.get("cor") ?? "#818cf8"),
    clienteId,
    resumo: String(formData.get("resumo") ?? "").trim(),
  });
  revalidatePath("/freelas");
  if (freela) redirect(`/freelas/${freela.id}`);
}

export async function updateFreelaResumoAction(freelaId: string, resumo: string) {
  await updateFreelaResumo(freelaId, resumo.trim());
  revalidatePath(`/freelas/${freelaId}`);
}

interface OrcamentoItemInput {
  desc?: unknown;
  tempo?: unknown;
  valor?: unknown;
  link?: unknown;
  bullets?: unknown;
  prazo?: unknown;
}

function parseBullets(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((b) => String(b).trim()).filter(Boolean);
  return String(raw ?? "")
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
}

export async function createOrcamentoAction(freelaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const data = String(formData.get("data") ?? new Date().toISOString().slice(0, 10));
  const prazoExec = String(formData.get("prazoExec") ?? "").trim();

  // New flow: activities (desc/tempo/valor) are added client-side and shipped
  // as a JSON blob; the total is the sum of the items, never a manually typed value.
  let itensRaw: OrcamentoItemInput[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("itens") ?? "[]"));
    if (Array.isArray(parsed)) itensRaw = parsed;
  } catch {
    itensRaw = [];
  }

  const itens = itensRaw
    .map((it) => ({
      desc: String(it.desc ?? "").trim(),
      tempo: String(it.tempo ?? "").trim(),
      valor: Number(it.valor ?? 0) || 0,
      link: String(it.link ?? "").trim() || null,
      bullets: parseBullets(it.bullets),
      prazo: String(it.prazo ?? "").trim() || null,
    }))
    .filter((it) => it.desc);

  const valor = itens.reduce((acc, it) => acc + Math.max(0, it.valor), 0);

  // Legacy fallback: a caller that still sends a plain "valor" field (no itens)
  // keeps working, so this action stays backwards compatible.
  const valorManual = Number(formData.get("valor") ?? 0);
  const valorFinal = valor > 0 ? valor : valorManual;

  if (!titulo || !(valorFinal > 0)) return;

  await createOrcamento({
    freelaId,
    titulo,
    valor: valorFinal,
    data,
    prazoExec,
    itens: itens.length ? itens : undefined,
  });
  revalidatePath(`/freelas/${freelaId}`);
  revalidatePath("/tasks");
}

export async function updateParcelaImpostosAction(freelaId: string, parcelaId: string, formData: FormData) {
  const faturado = formData.get("faturado") === "on" || formData.get("faturado") === "true";
  const percentualImpostoNf = Number(formData.get("percentualImpostoNf") ?? 0) || 0;
  const percentualRetencaoCliente = Number(formData.get("percentualRetencaoCliente") ?? 0) || 0;
  await updateParcelaImpostos(parcelaId, { faturado, percentualImpostoNf, percentualRetencaoCliente });
  revalidatePath(`/freelas/${freelaId}`);
}

export async function enviarOrcamentoAction(freelaId: string, orcamentoId: string) {
  await enviarOrcamento(orcamentoId);
  revalidatePath(`/freelas/${freelaId}`);
}

export async function registrarParcelaPagamentoAction(freelaId: string, parcelaId: string) {
  const chaves = await registrarParcelaPagamento(parcelaId);
  revalidatePath(`/freelas/${freelaId}`);
  revalidatePath("/inicio");
  revalidatePath("/metas");
  if (chaves?.chave) revalidatePath(`/orc/${chaves.chave}`);
  if (chaves?.chaveCrono) revalidatePath(`/cronograma/${chaves.chaveCrono}`);
}

export async function createOrcamentoItemAction(freelaId: string, orcamentoId: string, formData: FormData) {
  const desc = String(formData.get("desc") ?? "").trim();
  if (!desc) return;
  await createOrcamentoItem({
    orcamentoId,
    desc,
    tempo: String(formData.get("tempo") ?? "").trim(),
    valor: Number(formData.get("valor") ?? 0),
    link: String(formData.get("link") ?? "").trim() || null,
    bullets: parseBullets(formData.get("bullets")),
    prazo: String(formData.get("prazo") ?? "").trim() || null,
    ordem: Number(formData.get("ordem") ?? 0),
  });
  revalidatePath(`/freelas/${freelaId}`);
  revalidatePath("/tasks");
}

export async function updateOrcamentoTermosAction(freelaId: string, orcamentoId: string, termos: string) {
  await updateOrcamentoTermos(orcamentoId, termos.trim());
  revalidatePath(`/freelas/${freelaId}`);
  revalidatePath("/orc");
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
  // One topic per line (textarea), not comma-separated anymore.
  const topicos = String(formData.get("topicos") ?? "")
    .split("\n")
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

const MODELOS_VALIDOS = new Set(Object.keys(CONTRATO_MODELOS));

export async function createContratoAction(freelaId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;

  const data = String(formData.get("data") ?? new Date().toISOString().slice(0, 10));
  const modo = String(formData.get("modo") ?? "modelo") === "anexo" ? "anexo" : "modelo";

  if (modo === "anexo") {
    const arquivo = formData.get("arquivo");
    if (!(arquivo instanceof File) || arquivo.size === 0) return;
    const arquivoPath = await uploadPublicFile(arquivo, "contratos");
    await createContrato({
      freelaId,
      titulo,
      tipo: String(formData.get("tipo") ?? "").trim() || "Anexado",
      data,
      modo: "anexo",
      arquivoPath,
    });
  } else {
    const modeloTipoRaw = String(formData.get("modeloTipo") ?? "prestacao");
    const modeloTipo = (MODELOS_VALIDOS.has(modeloTipoRaw) ? modeloTipoRaw : "prestacao") as ContratoModeloTipo;
    await createContrato({
      freelaId,
      titulo,
      tipo: String(formData.get("tipo") ?? "").trim() || CONTRATO_MODELOS[modeloTipo],
      data,
      modo: "modelo",
      modeloTipo,
    });
  }

  revalidatePath(`/freelas/${freelaId}`);
}

export async function toggleContratoStatusAction(freelaId: string, id: string, assinado: boolean) {
  await setContratoStatus(id, assinado ? "assinado" : "pendente");
  revalidatePath(`/freelas/${freelaId}`);
}
