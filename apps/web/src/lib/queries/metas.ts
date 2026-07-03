import { db, metas, metaRecursos, orcamentos, freelas } from "@danlimadev/db";
import { and, eq, inArray } from "drizzle-orm";

export interface MetaRecurso {
  orcamentoId: string;
  titulo: string;
  codigo: string;
  freelaNome: string;
  freelaCor: string;
  valor: number;
  pago: number;
  /** Valor que este orçamento contribui para o progresso da meta (ver `valorReceber`). */
  valorReceber: number;
}

export interface MetaDetalhe {
  id: string;
  titulo: string;
  valor: number;
  arrecadado: number;
  progresso: number;
  recursos: MetaRecurso[];
}

export interface OrcamentoDisponivel {
  id: string;
  titulo: string;
  codigo: string;
  freelaNome: string;
  freelaCor: string;
  /** Valor "a receber" já calculado pela regra de negócio (ver `valorReceber`). */
  valorReceber: number;
}

export interface MetasOverview {
  metas: MetaDetalhe[];
  orcamentosDisponiveis: OrcamentoDisponivel[];
}

/**
 * Valor que um orçamento contribui como "reservado" para uma meta, de acordo com seu status:
 * - `aprovado`: receita comprometida mas ainda não paga -> conta o valor CHEIO do orçamento.
 * - `pago_parcial`: já recebeu parte -> conta o valor RESTANTE a receber (valor - pago).
 * - `pago_total`: já recebeu tudo -> conta o valor pago (que é igual ao valor total).
 * - qualquer outro status (rascunho, enviado, recusado) não conta nada.
 */
function valorReceber(status: string, valor: number, pago: number): number {
  switch (status) {
    case "aprovado":
      return valor;
    case "pago_parcial":
      return valor - pago;
    case "pago_total":
      return pago;
    default:
      return 0;
  }
}

function formatCodigo(numero: number): string {
  return `ORC-${String(numero).padStart(3, "0")}`;
}

/** Status que ainda têm algum valor pendente de recebimento e por isso podem ser vinculados a uma meta. */
const STATUS_VINCULAVEIS = ["aprovado", "pago_parcial"] as const;

export async function getMetasOverview(): Promise<MetasOverview> {
  const [metasList, recursos, elegiveis] = await Promise.all([
    db.select().from(metas).orderBy(metas.createdAt),
    db
      .select({
        metaId: metaRecursos.metaId,
        orcamentoId: metaRecursos.orcamentoId,
        titulo: orcamentos.titulo,
        numero: orcamentos.numero,
        status: orcamentos.status,
        valor: orcamentos.valor,
        pago: orcamentos.pago,
        freelaNome: freelas.nome,
        freelaCor: freelas.cor,
      })
      .from(metaRecursos)
      .innerJoin(orcamentos, eq(metaRecursos.orcamentoId, orcamentos.id))
      .innerJoin(freelas, eq(orcamentos.freelaId, freelas.id)),
    db
      .select({
        id: orcamentos.id,
        titulo: orcamentos.titulo,
        numero: orcamentos.numero,
        status: orcamentos.status,
        valor: orcamentos.valor,
        pago: orcamentos.pago,
        freelaNome: freelas.nome,
        freelaCor: freelas.cor,
      })
      .from(orcamentos)
      .innerJoin(freelas, eq(orcamentos.freelaId, freelas.id))
      .where(inArray(orcamentos.status, STATUS_VINCULAVEIS)),
  ]);

  const recursosPorMeta = new Map<string, MetaRecurso[]>();
  for (const r of recursos) {
    const valor = Number(r.valor);
    const pago = Number(r.pago);
    const list = recursosPorMeta.get(r.metaId) ?? [];
    list.push({
      orcamentoId: r.orcamentoId,
      titulo: r.titulo,
      codigo: formatCodigo(r.numero),
      freelaNome: r.freelaNome,
      freelaCor: r.freelaCor,
      valor,
      pago,
      valorReceber: valorReceber(r.status, valor, pago),
    });
    recursosPorMeta.set(r.metaId, list);
  }

  const detalhado: MetaDetalhe[] = metasList.map((m) => {
    const ligados = recursosPorMeta.get(m.id) ?? [];
    const arrecadado = ligados.reduce((acc, r) => acc + r.valorReceber, 0);
    const valor = Number(m.valor);
    return {
      id: m.id,
      titulo: m.titulo,
      valor,
      arrecadado,
      progresso: valor > 0 ? Math.min(1, arrecadado / valor) : 0,
      recursos: ligados,
    };
  });

  return {
    metas: detalhado,
    orcamentosDisponiveis: elegiveis.map((o) => {
      const valor = Number(o.valor);
      const pago = Number(o.pago);
      return {
        id: o.id,
        titulo: o.titulo,
        codigo: formatCodigo(o.numero),
        freelaNome: o.freelaNome,
        freelaCor: o.freelaCor,
        valorReceber: valorReceber(o.status, valor, pago),
      };
    }),
  };
}

export async function createMeta(input: { titulo: string; valor: number }) {
  const [meta] = await db
    .insert(metas)
    .values({ titulo: input.titulo, valor: String(input.valor) })
    .returning();
  return meta;
}

export async function deleteMeta(id: string) {
  await db.delete(metas).where(eq(metas.id, id));
}

export async function linkOrcamentoToMeta(metaId: string, orcamentoId: string) {
  await db.insert(metaRecursos).values({ metaId, orcamentoId }).onConflictDoNothing();
}

/** Vincula vários orçamentos de uma vez (usado pelo modal de "Vincular orçamentos", que aplica todos os checkboxes marcados em uma única chamada). */
export async function linkOrcamentosToMeta(metaId: string, orcamentoIds: string[]) {
  if (orcamentoIds.length === 0) return;
  await db
    .insert(metaRecursos)
    .values(orcamentoIds.map((orcamentoId) => ({ metaId, orcamentoId })))
    .onConflictDoNothing();
}

export async function unlinkOrcamentoFromMeta(metaId: string, orcamentoId: string) {
  await db
    .delete(metaRecursos)
    .where(and(eq(metaRecursos.metaId, metaId), eq(metaRecursos.orcamentoId, orcamentoId)));
}
