import {
  db,
  freelas,
  orcamentos,
  orcamentoItens,
  observacoes,
  reunioes,
  contratos,
} from "@danlimadev/db";
import { desc, eq, inArray } from "drizzle-orm";
import { generateChave } from "@/lib/format";

export interface FreelaListItem {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  clienteNome: string;
  orcamentosAbertos: number;
  aReceber: number;
}

export async function getFreelasList(): Promise<FreelaListItem[]> {
  const [freelasList, todosOrcamentos] = await Promise.all([
    db.select().from(freelas).orderBy(desc(freelas.createdAt)),
    db.select().from(orcamentos),
  ]);

  const porFreela = new Map<string, typeof todosOrcamentos>();
  for (const o of todosOrcamentos) {
    const list = porFreela.get(o.freelaId) ?? [];
    list.push(o);
    porFreela.set(o.freelaId, list);
  }

  return freelasList.map((f) => {
    const seus = porFreela.get(f.id) ?? [];
    const abertos = seus.filter((o) => o.status !== "recusado" && o.status !== "rascunho");
    return {
      id: f.id,
      nome: f.nome,
      tipo: f.tipo,
      cor: f.cor,
      clienteNome: f.clienteNome,
      orcamentosAbertos: abertos.length,
      aReceber: abertos.reduce((acc, o) => acc + Math.max(0, Number(o.valor) - Number(o.pago)), 0),
    };
  });
}

export async function createFreela(input: {
  nome: string;
  tipo: string;
  cor: string;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp: string;
  resumo: string;
}) {
  const [freela] = await db
    .insert(freelas)
    .values({ ...input, chaveCrono: generateChave() })
    .returning();
  return freela;
}

export interface OrcamentoItemView {
  id: string;
  desc: string;
  tempo: string;
  valor: number;
  prazo: string | null;
  done: boolean;
  ordem: number;
}

export interface OrcamentoView {
  id: string;
  numero: number;
  titulo: string;
  status: string;
  chave: string;
  valor: number;
  pago: number;
  data: string;
  prazoExec: string;
  itens: OrcamentoItemView[];
}

export interface FreelaDetail {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp: string;
  chaveCrono: string;
  resumo: string;
  orcamentos: OrcamentoView[];
  observacoes: { id: string; data: string; texto: string }[];
  reunioes: { id: string; titulo: string; data: string; topicos: string[] }[];
  contratos: { id: string; titulo: string; tipo: string; status: string; data: string }[];
}

export async function getFreelaDetail(id: string): Promise<FreelaDetail | null> {
  const [freela] = await db.select().from(freelas).where(eq(freelas.id, id));
  if (!freela) return null;

  const orcamentosList = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.freelaId, id))
    .orderBy(desc(orcamentos.numero));

  const orcamentoIds = orcamentosList.map((o) => o.id);
  const itens = orcamentoIds.length
    ? await db.select().from(orcamentoItens).where(inArray(orcamentoItens.orcamentoId, orcamentoIds))
    : [];

  const itensPorOrcamento = new Map<string, OrcamentoItemView[]>();
  for (const it of itens) {
    const list = itensPorOrcamento.get(it.orcamentoId) ?? [];
    list.push({
      id: it.id,
      desc: it.desc,
      tempo: it.tempo,
      valor: Number(it.valor),
      prazo: it.prazo,
      done: it.done,
      ordem: it.ordem,
    });
    itensPorOrcamento.set(it.orcamentoId, list);
  }
  for (const list of itensPorOrcamento.values()) list.sort((a, b) => a.ordem - b.ordem);

  const [observacoesList, reunioesList, contratosList] = await Promise.all([
    db.select().from(observacoes).where(eq(observacoes.freelaId, id)).orderBy(desc(observacoes.data)),
    db.select().from(reunioes).where(eq(reunioes.freelaId, id)).orderBy(desc(reunioes.data)),
    db.select().from(contratos).where(eq(contratos.freelaId, id)).orderBy(desc(contratos.data)),
  ]);

  return {
    id: freela.id,
    nome: freela.nome,
    tipo: freela.tipo,
    cor: freela.cor,
    clienteNome: freela.clienteNome,
    clienteEmail: freela.clienteEmail,
    clienteWhatsapp: freela.clienteWhatsapp,
    chaveCrono: freela.chaveCrono,
    resumo: freela.resumo,
    orcamentos: orcamentosList.map((o) => ({
      id: o.id,
      numero: o.numero,
      titulo: o.titulo,
      status: o.status,
      chave: o.chave,
      valor: Number(o.valor),
      pago: Number(o.pago),
      data: o.data,
      prazoExec: o.prazoExec,
      itens: itensPorOrcamento.get(o.id) ?? [],
    })),
    observacoes: observacoesList.map((o) => ({ id: o.id, data: o.data, texto: o.texto })),
    reunioes: reunioesList.map((r) => ({ id: r.id, titulo: r.titulo, data: r.data, topicos: r.topicos })),
    contratos: contratosList.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      tipo: c.tipo,
      status: c.status,
      data: c.data,
    })),
  };
}

export async function createOrcamento(input: {
  freelaId: string;
  titulo: string;
  valor: number;
  data: string;
  prazoExec: string;
}) {
  const [orcamento] = await db
    .insert(orcamentos)
    .values({
      freelaId: input.freelaId,
      titulo: input.titulo,
      valor: String(input.valor),
      data: input.data,
      prazoExec: input.prazoExec,
      chave: generateChave(),
    })
    .returning();
  return orcamento;
}

export async function enviarOrcamento(id: string) {
  await db.update(orcamentos).set({ status: "enviado", updatedAt: new Date() }).where(eq(orcamentos.id, id));
}

export async function registrarPagamento(id: string, incremento: number) {
  const [orcamento] = await db.select().from(orcamentos).where(eq(orcamentos.id, id));
  if (!orcamento) return null;
  const novoPago = Math.min(Number(orcamento.valor), Number(orcamento.pago) + incremento);
  const status = novoPago >= Number(orcamento.valor) ? "pago_total" : "pago_parcial";
  await db
    .update(orcamentos)
    .set({ pago: String(novoPago), status, updatedAt: new Date() })
    .where(eq(orcamentos.id, id));

  const [freela] = await db.select().from(freelas).where(eq(freelas.id, orcamento.freelaId));
  return { chave: orcamento.chave, chaveCrono: freela?.chaveCrono ?? null };
}

export async function createOrcamentoItem(input: {
  orcamentoId: string;
  desc: string;
  tempo: string;
  valor: number;
  prazo: string | null;
  ordem: number;
}) {
  await db.insert(orcamentoItens).values({ ...input, valor: String(input.valor) });
}

export async function deleteOrcamentoItem(id: string) {
  await db.delete(orcamentoItens).where(eq(orcamentoItens.id, id));
}

export async function createObservacao(input: { freelaId: string; texto: string; data: string }) {
  await db.insert(observacoes).values(input);
}

export async function createReuniao(input: {
  freelaId: string;
  titulo: string;
  data: string;
  topicos: string[];
}) {
  await db.insert(reunioes).values(input);
}

export async function createContrato(input: {
  freelaId: string;
  titulo: string;
  tipo: string;
  data: string;
}) {
  await db.insert(contratos).values(input);
}

export async function setContratoStatus(id: string, status: "pendente" | "assinado") {
  await db.update(contratos).set({ status }).where(eq(contratos.id, id));
}
