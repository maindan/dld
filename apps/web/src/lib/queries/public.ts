import { db, orcamentos, orcamentoItens, freelas } from "@danlimadev/db";
import { and, eq, inArray, isNotNull, ne } from "drizzle-orm";

export interface OrcamentoPublico {
  id: string;
  numero: number;
  titulo: string;
  status: string;
  valor: number;
  pago: number;
  data: string;
  prazoExec: string;
  aprovadoEm: Date | null;
  freelaNome: string;
  itens: { id: string; desc: string; tempo: string; valor: number; prazo: string | null }[];
}

export async function getOrcamentoPorChave(chave: string): Promise<OrcamentoPublico | null> {
  const [orcamento] = await db.select().from(orcamentos).where(eq(orcamentos.chave, chave));
  if (!orcamento || orcamento.status === "rascunho") return null;

  const [freela] = await db.select().from(freelas).where(eq(freelas.id, orcamento.freelaId));
  const itens = await db
    .select()
    .from(orcamentoItens)
    .where(eq(orcamentoItens.orcamentoId, orcamento.id))
    .orderBy(orcamentoItens.ordem);

  return {
    id: orcamento.id,
    numero: orcamento.numero,
    titulo: orcamento.titulo,
    status: orcamento.status,
    valor: Number(orcamento.valor),
    pago: Number(orcamento.pago),
    data: orcamento.data,
    prazoExec: orcamento.prazoExec,
    aprovadoEm: orcamento.aprovadoEm,
    freelaNome: freela?.nome ?? "",
    itens: itens.map((it) => ({
      id: it.id,
      desc: it.desc,
      tempo: it.tempo,
      valor: Number(it.valor),
      prazo: it.prazo,
    })),
  };
}

export async function aprovarOrcamentoPorChave(chave: string) {
  const [orcamento] = await db.select().from(orcamentos).where(eq(orcamentos.chave, chave));
  if (!orcamento || orcamento.status !== "enviado") return false;
  await db
    .update(orcamentos)
    .set({ status: "aprovado", aprovadoEm: new Date(), updatedAt: new Date() })
    .where(eq(orcamentos.id, orcamento.id));
  return true;
}

export interface CronogramaItem {
  id: string;
  desc: string;
  prazo: string;
  done: boolean;
  orcamentoTitulo: string;
}

export interface CronogramaPublico {
  freelaNome: string;
  resumo: string;
  itens: CronogramaItem[];
}

export async function getCronogramaPorChave(chaveCrono: string): Promise<CronogramaPublico | null> {
  const [freela] = await db.select().from(freelas).where(eq(freelas.chaveCrono, chaveCrono));
  if (!freela) return null;

  const orcamentosDoFreela = await db
    .select({ id: orcamentos.id, titulo: orcamentos.titulo })
    .from(orcamentos)
    .where(and(eq(orcamentos.freelaId, freela.id), ne(orcamentos.status, "rascunho")));

  const orcamentoIds = orcamentosDoFreela.map((o) => o.id);
  const titulos = new Map(orcamentosDoFreela.map((o) => [o.id, o.titulo]));

  const itens = orcamentoIds.length
    ? await db
        .select()
        .from(orcamentoItens)
        .where(and(inArray(orcamentoItens.orcamentoId, orcamentoIds), isNotNull(orcamentoItens.prazo)))
    : [];

  return {
    freelaNome: freela.nome,
    resumo: freela.resumo,
    itens: itens
      .map((it) => ({
        id: it.id,
        desc: it.desc,
        prazo: it.prazo as string,
        done: it.done,
        orcamentoTitulo: titulos.get(it.orcamentoId) ?? "",
      }))
      .sort((a, b) => a.prazo.localeCompare(b.prazo)),
  };
}
