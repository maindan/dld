import { db, metas, metaRecursos, orcamentos, freelas } from "@danlimadev/db";
import { and, eq, notInArray } from "drizzle-orm";

export interface MetaRecurso {
  orcamentoId: string;
  titulo: string;
  freelaNome: string;
  valor: number;
  pago: number;
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
  freelaNome: string;
  valor: number;
}

export interface MetasOverview {
  metas: MetaDetalhe[];
  orcamentosDisponiveis: OrcamentoDisponivel[];
}

export async function getMetasOverview(): Promise<MetasOverview> {
  const [metasList, recursos, todosOrcamentos] = await Promise.all([
    db.select().from(metas).orderBy(metas.createdAt),
    db
      .select({
        metaId: metaRecursos.metaId,
        orcamentoId: metaRecursos.orcamentoId,
        titulo: orcamentos.titulo,
        valor: orcamentos.valor,
        pago: orcamentos.pago,
        freelaNome: freelas.nome,
      })
      .from(metaRecursos)
      .innerJoin(orcamentos, eq(metaRecursos.orcamentoId, orcamentos.id))
      .innerJoin(freelas, eq(orcamentos.freelaId, freelas.id)),
    db
      .select({
        id: orcamentos.id,
        titulo: orcamentos.titulo,
        valor: orcamentos.valor,
        freelaNome: freelas.nome,
      })
      .from(orcamentos)
      .innerJoin(freelas, eq(orcamentos.freelaId, freelas.id))
      .where(notInArray(orcamentos.status, ["rascunho", "recusado"])),
  ]);

  const recursosPorMeta = new Map<string, MetaRecurso[]>();
  const orcamentosLigados = new Set<string>();
  for (const r of recursos) {
    const list = recursosPorMeta.get(r.metaId) ?? [];
    list.push({
      orcamentoId: r.orcamentoId,
      titulo: r.titulo,
      freelaNome: r.freelaNome,
      valor: Number(r.valor),
      pago: Number(r.pago),
    });
    recursosPorMeta.set(r.metaId, list);
  }
  for (const r of recursos) orcamentosLigados.add(`${r.metaId}:${r.orcamentoId}`);

  const detalhado: MetaDetalhe[] = metasList.map((m) => {
    const ligados = recursosPorMeta.get(m.id) ?? [];
    const arrecadado = ligados.reduce((acc, r) => acc + r.pago, 0);
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
    orcamentosDisponiveis: todosOrcamentos.map((o) => ({
      id: o.id,
      titulo: o.titulo,
      freelaNome: o.freelaNome,
      valor: Number(o.valor),
    })),
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

export async function unlinkOrcamentoFromMeta(metaId: string, orcamentoId: string) {
  await db
    .delete(metaRecursos)
    .where(and(eq(metaRecursos.metaId, metaId), eq(metaRecursos.orcamentoId, orcamentoId)));
}
