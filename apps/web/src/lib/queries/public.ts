import { db, orcamentos, orcamentoItens, freelas, clientes } from "@danlimadev/db";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { STATUS_ORCAMENTO_LIBERA_CRONOGRAMA } from "@/lib/cronograma-rules";

export interface OrcamentoPublico {
  id: string;
  numero: number;
  titulo: string;
  status: string;
  valor: number;
  pago: number;
  data: string;
  prazoExec: string;
  termos: string;
  aprovadoEm: Date | null;
  freelaNome: string;
  freelaResumo: string;
  clienteNome: string;
  itens: {
    id: string;
    desc: string;
    tempo: string;
    valor: number;
    link: string | null;
    bullets: string[];
    prazo: string | null;
  }[];
}

export async function getOrcamentoPorChave(chave: string): Promise<OrcamentoPublico | null> {
  const [orcamento] = await db.select().from(orcamentos).where(eq(orcamentos.chave, chave));
  if (!orcamento || orcamento.status === "rascunho") return null;

  const [row] = await db
    .select({ freela: freelas, cliente: clientes })
    .from(freelas)
    .innerJoin(clientes, eq(freelas.clienteId, clientes.id))
    .where(eq(freelas.id, orcamento.freelaId));
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
    termos: orcamento.termos,
    aprovadoEm: orcamento.aprovadoEm,
    freelaNome: row?.freela.nome ?? "",
    freelaResumo: row?.freela.resumo ?? "",
    clienteNome: row?.cliente.nome ?? "",
    itens: itens.map((it) => ({
      id: it.id,
      desc: it.desc,
      tempo: it.tempo,
      valor: Number(it.valor),
      link: it.link,
      bullets: it.bullets,
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
  pct: number;
}

export async function getCronogramaPorChave(chaveCrono: string): Promise<CronogramaPublico | null> {
  const [freela] = await db.select().from(freelas).where(eq(freelas.chaveCrono, chaveCrono));
  if (!freela) return null;

  const orcamentosDoFreela = await db
    .select({ id: orcamentos.id, titulo: orcamentos.titulo })
    .from(orcamentos)
    .where(
      and(
        eq(orcamentos.freelaId, freela.id),
        inArray(orcamentos.status, [...STATUS_ORCAMENTO_LIBERA_CRONOGRAMA]),
      ),
    );

  const orcamentoIds = orcamentosDoFreela.map((o) => o.id);
  const titulos = new Map(orcamentosDoFreela.map((o) => [o.id, o.titulo]));

  const itens = orcamentoIds.length
    ? await db
        .select()
        .from(orcamentoItens)
        .where(and(inArray(orcamentoItens.orcamentoId, orcamentoIds), isNotNull(orcamentoItens.prazo)))
    : [];

  const itensOrdenados = itens
    .map((it) => ({
      id: it.id,
      desc: it.desc,
      prazo: it.prazo as string,
      done: it.done,
      orcamentoTitulo: titulos.get(it.orcamentoId) ?? "",
    }))
    .sort((a, b) => a.prazo.localeCompare(b.prazo));

  const pct = itensOrdenados.length
    ? Math.round((itensOrdenados.filter((it) => it.done).length / itensOrdenados.length) * 100)
    : 0;

  return {
    freelaNome: freela.nome,
    resumo: freela.resumo,
    itens: itensOrdenados,
    pct,
  };
}
