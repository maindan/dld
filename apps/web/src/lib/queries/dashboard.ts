import {
  db,
  freelas,
  orcamentos,
  orcamentoItens,
  tasksPessoais,
  projetosPessoais,
  metas,
  metaRecursos,
  expedientes,
  expedientePausas,
} from "@danlimadev/db";
import { and, eq, gte, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { formatDateShort, isLate } from "@/lib/format";

export interface PrazoItem {
  key: string;
  titulo: string;
  sub: string;
  prazo: string;
}

export interface MetaResumo {
  id: string;
  titulo: string;
  valor: number;
  arrecadado: number;
  progresso: number;
}

export interface DashboardOverview {
  freelasAtivos: number;
  aReceber: number;
  orcamentosPendentesAprovacao: number;
  tasksAtrasadas: number;
  horasSemana: number;
  metas: MetaResumo[];
  proximosPrazos: PrazoItem[];
}

const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const seteDiasAtras = new Date(Date.now() - SEMANA_MS);

  const [
    freelasList,
    orcamentosAbertos,
    itensAbertos,
    tasksAbertas,
    metasList,
    recursos,
    expedientesRecentes,
  ] = await Promise.all([
    db.select({ id: freelas.id }).from(freelas),
    db
      .select()
      .from(orcamentos)
      .where(inArray(orcamentos.status, ["enviado", "aprovado", "pago_parcial"])),
    db
      .select({
        id: orcamentoItens.id,
        desc: orcamentoItens.desc,
        prazo: orcamentoItens.prazo,
        orcamentoId: orcamentoItens.orcamentoId,
      })
      .from(orcamentoItens)
      .where(and(eq(orcamentoItens.done, false), isNotNull(orcamentoItens.prazo))),
    db
      .select({
        id: tasksPessoais.id,
        titulo: tasksPessoais.titulo,
        prazo: tasksPessoais.prazo,
        projetoNome: projetosPessoais.nome,
      })
      .from(tasksPessoais)
      .leftJoin(projetosPessoais, eq(tasksPessoais.projetoId, projetosPessoais.id))
      .where(and(eq(tasksPessoais.done, false), isNotNull(tasksPessoais.prazo))),
    db.select().from(metas),
    db
      .select({
        metaId: metaRecursos.metaId,
        valor: orcamentos.valor,
        pago: orcamentos.pago,
      })
      .from(metaRecursos)
      .innerJoin(orcamentos, eq(metaRecursos.orcamentoId, orcamentos.id)),
    db
      .select()
      .from(expedientes)
      .where(or(gte(expedientes.iniciadoEm, seteDiasAtras), isNull(expedientes.encerradoEm))),
  ]);

  const freelaPorOrcamento = new Map<string, string>();
  for (const o of orcamentosAbertos) freelaPorOrcamento.set(o.id, o.freelaId);
  const freelaIds = [...new Set(orcamentosAbertos.map((o) => o.freelaId))];
  const freelaNomes = new Map(
    freelaIds.length
      ? (
          await db
            .select({ id: freelas.id, nome: freelas.nome })
            .from(freelas)
            .where(inArray(freelas.id, freelaIds))
        ).map((f) => [f.id, f.nome])
      : [],
  );

  const aReceber = orcamentosAbertos
    .filter((o) => o.status !== "enviado")
    .reduce((acc, o) => acc + (Number(o.valor) - Number(o.pago)), 0);

  const orcamentosPendentesAprovacao = orcamentosAbertos.filter((o) => o.status === "enviado").length;

  const itensAtrasados = itensAbertos.filter((it) => isLate(it.prazo));
  const tasksAtrasadasList = tasksAbertas.filter((t) => isLate(t.prazo));
  const tasksAtrasadas = itensAtrasados.length + tasksAtrasadasList.length;

  const expedienteIds = expedientesRecentes.map((e) => e.id);
  const pausas = expedienteIds.length
    ? await db.select().from(expedientePausas).where(inArray(expedientePausas.expedienteId, expedienteIds))
    : [];
  const now = Date.now();
  let horasSemanaMs = 0;
  for (const exp of expedientesRecentes) {
    const fim = exp.encerradoEm ? exp.encerradoEm.getTime() : now;
    const brutoMs = fim - exp.iniciadoEm.getTime();
    const pausadoMs = pausas
      .filter((p) => p.expedienteId === exp.id)
      .reduce((acc, p) => {
        const pFim = p.retomadoEm ? p.retomadoEm.getTime() : now;
        return acc + Math.max(0, pFim - p.pausadoEm.getTime());
      }, 0);
    horasSemanaMs += Math.max(0, brutoMs - pausadoMs);
  }

  const recursosPorMeta = new Map<string, { valor: number; pago: number }[]>();
  for (const r of recursos) {
    const list = recursosPorMeta.get(r.metaId) ?? [];
    list.push({ valor: Number(r.valor), pago: Number(r.pago) });
    recursosPorMeta.set(r.metaId, list);
  }

  const metasResumo: MetaResumo[] = metasList.map((m) => {
    const ligados = recursosPorMeta.get(m.id) ?? [];
    const arrecadado = ligados.reduce((acc, r) => acc + r.pago, 0);
    const valor = Number(m.valor);
    return {
      id: m.id,
      titulo: m.titulo,
      valor,
      arrecadado,
      progresso: valor > 0 ? Math.min(1, arrecadado / valor) : 0,
    };
  });

  const proximosPrazos: PrazoItem[] = [
    ...itensAbertos
      .filter((it) => !isLate(it.prazo) && it.prazo)
      .map((it) => ({
        key: `item-${it.id}`,
        titulo: it.desc,
        sub: freelaNomes.get(freelaPorOrcamento.get(it.orcamentoId) ?? "") ?? "Freela",
        prazo: it.prazo!,
      })),
    ...tasksAbertas
      .filter((t) => !isLate(t.prazo) && t.prazo)
      .map((t) => ({
        key: `task-${t.id}`,
        titulo: t.titulo,
        sub: t.projetoNome ?? "Pessoal",
        prazo: t.prazo!,
      })),
  ]
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 6)
    .map((p) => ({ ...p, prazo: formatDateShort(p.prazo) }));

  return {
    freelasAtivos: freelasList.length,
    aReceber,
    orcamentosPendentesAprovacao,
    tasksAtrasadas,
    horasSemana: horasSemanaMs / (1000 * 60 * 60),
    metas: metasResumo,
    proximosPrazos,
  };
}
