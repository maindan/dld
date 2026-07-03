import { db, expedientes, expedientePausas, freelas } from "@danlimadev/db";
import { isNull, eq, desc, inArray, and, lt, gt, or } from "drizzle-orm";
import { formatMonthLabel } from "@/lib/format";

export type ExpedienteStatus = "idle" | "running" | "paused";

export interface ExpedienteAtivo {
  id: string;
  status: ExpedienteStatus;
  /** Seconds elapsed so far, computed server-side from real timestamps — never trusted from the client. */
  elapsedSeconds: number;
  projetos: string[];
  /** ISO timestamp the client uses to keep ticking locally between refreshes, only while running. */
  tickFromMs: number | null;
}

export async function getExpedienteAtivo(): Promise<ExpedienteAtivo | null> {
  const [aberto] = await db
    .select()
    .from(expedientes)
    .where(isNull(expedientes.encerradoEm))
    .orderBy(desc(expedientes.iniciadoEm))
    .limit(1);
  if (!aberto) return null;

  const pausas = await db
    .select()
    .from(expedientePausas)
    .where(eq(expedientePausas.expedienteId, aberto.id));

  const now = Date.now();
  const pausadaAberta = pausas.find((p) => !p.retomadoEm);
  const pausadoMs = pausas.reduce((acc, p) => {
    const fim = p.retomadoEm ? p.retomadoEm.getTime() : now;
    return acc + Math.max(0, fim - p.pausadoEm.getTime());
  }, 0);

  const brutoMs = now - aberto.iniciadoEm.getTime();
  const elapsedSeconds = Math.max(0, Math.floor((brutoMs - pausadoMs) / 1000));

  return {
    id: aberto.id,
    status: pausadaAberta ? "paused" : "running",
    elapsedSeconds,
    projetos: aberto.projetos,
    tickFromMs: pausadaAberta ? null : now,
  };
}

export interface ProjetoOpcao {
  id: string;
  nome: string;
  cor: string;
}

/** Teal is the Workstation module's own accent — used for the "Pessoal" pseudo-project, which has no freela row/color of its own. */
const COR_PESSOAL = "#2dd4bf";

export async function getProjetosParaExpediente(): Promise<ProjetoOpcao[]> {
  const lista = await db
    .select({ id: freelas.id, nome: freelas.nome, cor: freelas.cor })
    .from(freelas)
    .orderBy(freelas.nome);
  return [...lista, { id: "pessoal", nome: "Pessoal", cor: COR_PESSOAL }];
}

export async function startExpediente(projetos: string[]) {
  const [expediente] = await db.insert(expedientes).values({ projetos }).returning();
  return expediente;
}

export async function pausarExpediente(id: string) {
  await db.insert(expedientePausas).values({ expedienteId: id });
}

export async function retomarExpediente(id: string) {
  const [pausaAberta] = await db
    .select()
    .from(expedientePausas)
    .where(and(eq(expedientePausas.expedienteId, id), isNull(expedientePausas.retomadoEm)));
  if (!pausaAberta) return;
  await db
    .update(expedientePausas)
    .set({ retomadoEm: new Date() })
    .where(eq(expedientePausas.id, pausaAberta.id));
}

export async function encerrarExpediente(id: string) {
  const [pausaAberta] = await db
    .select()
    .from(expedientePausas)
    .where(and(eq(expedientePausas.expedienteId, id), isNull(expedientePausas.retomadoEm)));
  if (pausaAberta) {
    await db.update(expedientePausas).set({ retomadoEm: new Date() }).where(eq(expedientePausas.id, pausaAberta.id));
  }
  await db.update(expedientes).set({ encerradoEm: new Date() }).where(eq(expedientes.id, id));
}

// ---------------------------------------------------------------------------
// Aggregation helpers — every number here is derived from real iniciadoEm /
// encerradoEm / pausas timestamps, never trusted from a client-held timer.
// ---------------------------------------------------------------------------

type ExpedienteRow = typeof expedientes.$inferSelect;
type PausaRow = typeof expedientePausas.$inferSelect;

/** Brazil abolished DST in 2019, so every calendar day is exactly 24h — safe to bucket with a fixed-size ms constant. */
const UM_DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Splits one work session into the sub-intervals where it was actually running
 * (i.e. with every paused window subtracted out), clipped to `nowMs` when the
 * session (or its last pause) is still open.
 */
function buildIntervalos(exp: ExpedienteRow, pausas: PausaRow[], nowMs: number): Array<[number, number]> {
  const fimSessao = exp.encerradoEm ? exp.encerradoEm.getTime() : nowMs;
  const inicioSessao = exp.iniciadoEm.getTime();
  const pausasOrdenadas = pausas
    .filter((p) => p.expedienteId === exp.id)
    .sort((a, b) => a.pausadoEm.getTime() - b.pausadoEm.getTime());

  const intervalos: Array<[number, number]> = [];
  let cursor = inicioSessao;
  for (const p of pausasOrdenadas) {
    const pInicio = Math.min(p.pausadoEm.getTime(), fimSessao);
    const pFim = Math.min(p.retomadoEm ? p.retomadoEm.getTime() : nowMs, fimSessao);
    if (pInicio > cursor) intervalos.push([cursor, pInicio]);
    cursor = Math.max(cursor, pFim);
  }
  if (cursor < fimSessao) intervalos.push([cursor, fimSessao]);
  return intervalos.filter(([a, b]) => b > a);
}

function clip(intervalo: [number, number], start: number, end: number): [number, number] | null {
  const a = Math.max(intervalo[0], start);
  const b = Math.min(intervalo[1], end);
  return b > a ? [a, b] : null;
}

/** Adds an interval's ms into the right day buckets of `porDia`, splitting at midnight when it crosses a day boundary. */
function distribuirPorDia(intervalo: [number, number], inicioPeriodoMs: number, porDia: number[]): void {
  const fimPeriodoMs = inicioPeriodoMs + porDia.length * UM_DIA_MS;
  const a = Math.max(intervalo[0], inicioPeriodoMs);
  const b = Math.min(intervalo[1], fimPeriodoMs);
  if (b <= a) return;

  let cursor = a;
  while (cursor < b) {
    const diaIndex = Math.floor((cursor - inicioPeriodoMs) / UM_DIA_MS);
    if (diaIndex < 0 || diaIndex >= porDia.length) break;
    const fimDia = inicioPeriodoMs + (diaIndex + 1) * UM_DIA_MS;
    const fimFatia = Math.min(b, fimDia);
    porDia[diaIndex] += fimFatia - cursor;
    cursor = fimFatia;
  }
}

/** Monday 00:00 (local time) of the week containing `ref`. */
function inicioDaSemana(ref: Date): Date {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const diaSemana = d.getDay(); // 0 = domingo
  const diasDesdeSegunda = (diaSemana + 6) % 7;
  d.setDate(d.getDate() - diasDesdeSegunda);
  return d;
}

async function getExpedientesEPausasNoIntervalo(inicio: Date, fim: Date) {
  const rows = await db
    .select()
    .from(expedientes)
    .where(and(lt(expedientes.iniciadoEm, fim), or(isNull(expedientes.encerradoEm), gt(expedientes.encerradoEm, inicio))));
  const ids = rows.map((r) => r.id);
  const pausas = ids.length
    ? await db.select().from(expedientePausas).where(inArray(expedientePausas.expedienteId, ids))
    : [];
  return { rows, pausas };
}

export interface ExpedienteResumo {
  hojeSegundos: number;
  semanaSegundos: number;
}

export async function getExpedienteResumo(): Promise<ExpedienteResumo> {
  const now = new Date();
  const nowMs = now.getTime();
  const inicioHoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inicioSemana = inicioDaSemana(now);

  const { rows, pausas } = await getExpedientesEPausasNoIntervalo(inicioSemana, now);

  let hojeMs = 0;
  let semanaMs = 0;
  for (const exp of rows) {
    for (const intervalo of buildIntervalos(exp, pausas, nowMs)) {
      const emSemana = clip(intervalo, inicioSemana.getTime(), nowMs);
      if (emSemana) semanaMs += emSemana[1] - emSemana[0];
      const emHoje = clip(intervalo, inicioHoje.getTime(), nowMs);
      if (emHoje) hojeMs += emHoje[1] - emHoje[0];
    }
  }

  return {
    hojeSegundos: Math.floor(hojeMs / 1000),
    semanaSegundos: Math.floor(semanaMs / 1000),
  };
}

export type RelatorioPeriodo = "semana" | "mes" | "projeto";

export interface RelatorioBarra {
  key: string;
  label: string;
  horas: number;
  pct: number;
  cor: string;
}

export interface RelatorioHoras {
  periodo: RelatorioPeriodo;
  bars: RelatorioBarra[];
  totalHoras: number;
  unidadeLabel: string;
  monthLabel: string | null;
  canGoNextMonth: boolean;
}

const DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
/** Bar color for the Semana/Mês tabs, which aggregate across every project — the Workstation module's own teal accent, not tied to any one freela. */
const COR_RELATORIO = "#2dd4bf";

function bararizar(horas: number[], labels: string[], cor: (i: number) => string): RelatorioBarra[] {
  const maxHoras = Math.max(0, ...horas);
  return horas.map((h, i) => ({
    key: `${i}-${labels[i]}`,
    label: labels[i],
    horas: h,
    pct: maxHoras > 0 ? Math.round((h / maxHoras) * 1000) / 10 : 0,
    cor: cor(i),
  }));
}

/**
 * Aggregates worked hours for the Workstation report card.
 * - "semana": current week (Monday..Sunday), one bar per day.
 * - "mes": calendar month selected via `offset` (0 = current, negative = past); future months are clamped out.
 * - "projeto": current calendar month, one bar per freela/"Pessoal", with a session's duration split evenly
 *   across every project it was tagged with (a session has no per-project sub-timer, so equal split is the
 *   only allocation that keeps the sum of project bars equal to the real total worked).
 */
export async function getRelatorioHoras(periodo: RelatorioPeriodo, offset = 0): Promise<RelatorioHoras> {
  const now = new Date();
  const nowMs = now.getTime();

  if (periodo === "semana") {
    const inicio = inicioDaSemana(now);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 7);

    const { rows, pausas } = await getExpedientesEPausasNoIntervalo(inicio, fim);
    const porDia = new Array(7).fill(0) as number[];
    for (const exp of rows) {
      for (const intervalo of buildIntervalos(exp, pausas, nowMs)) {
        distribuirPorDia(intervalo, inicio.getTime(), porDia);
      }
    }
    const horas = porDia.map((ms) => ms / 3_600_000);
    return {
      periodo,
      bars: bararizar(horas, DIAS_SEMANA, () => COR_RELATORIO),
      totalHoras: horas.reduce((a, b) => a + b, 0),
      unidadeLabel: "dia",
      monthLabel: null,
      canGoNextMonth: false,
    };
  }

  if (periodo === "mes") {
    const mesOffset = Math.min(0, Math.trunc(offset));
    const refMes = new Date(now.getFullYear(), now.getMonth() + mesOffset, 1);
    const inicio = refMes;
    const fim = new Date(refMes.getFullYear(), refMes.getMonth() + 1, 1);
    const diasNoMes = new Date(refMes.getFullYear(), refMes.getMonth() + 1, 0).getDate();

    const { rows, pausas } = await getExpedientesEPausasNoIntervalo(inicio, fim);
    const porDia = new Array(diasNoMes).fill(0) as number[];
    for (const exp of rows) {
      for (const intervalo of buildIntervalos(exp, pausas, nowMs)) {
        distribuirPorDia(intervalo, inicio.getTime(), porDia);
      }
    }
    const horas = porDia.map((ms) => ms / 3_600_000);
    const labels = horas.map((_, i) => String(i + 1).padStart(2, "0"));
    return {
      periodo,
      bars: bararizar(horas, labels, () => COR_RELATORIO),
      totalHoras: horas.reduce((a, b) => a + b, 0),
      unidadeLabel: "dia",
      monthLabel: formatMonthLabel(refMes.getFullYear(), refMes.getMonth()),
      canGoNextMonth: mesOffset < 0,
    };
  }

  // periodo === "projeto": mês corrente, agrupado por projeto/freela.
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
  const fim = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const { rows, pausas } = await getExpedientesEPausasNoIntervalo(inicio, fim);

  const freelaIds = [...new Set(rows.flatMap((r) => r.projetos).filter((p) => p !== "pessoal"))];
  const freelaRows = freelaIds.length
    ? await db.select({ id: freelas.id, nome: freelas.nome, cor: freelas.cor }).from(freelas).where(inArray(freelas.id, freelaIds))
    : [];
  const freelaPorId = new Map(freelaRows.map((f) => [f.id, f]));

  const msPorProjeto = new Map<string, number>();
  for (const exp of rows) {
    const projetosDaSessao = exp.projetos.length > 0 ? exp.projetos : ["pessoal"];
    for (const intervalo of buildIntervalos(exp, pausas, nowMs)) {
      const clipped = clip(intervalo, inicio.getTime(), fim.getTime());
      if (!clipped) continue;
      const fatiaMs = (clipped[1] - clipped[0]) / projetosDaSessao.length;
      for (const pid of projetosDaSessao) {
        msPorProjeto.set(pid, (msPorProjeto.get(pid) ?? 0) + fatiaMs);
      }
    }
  }

  const entradas = [...msPorProjeto.entries()]
    .map(([id, ms]) => {
      const freela = freelaPorId.get(id);
      return {
        id,
        nome: id === "pessoal" ? "Pessoal" : (freela?.nome ?? "Projeto removido"),
        cor: id === "pessoal" ? COR_PESSOAL : (freela?.cor ?? COR_RELATORIO),
        horas: ms / 3_600_000,
      };
    })
    .sort((a, b) => b.horas - a.horas);

  const maxHoras = Math.max(0, ...entradas.map((e) => e.horas));
  const bars: RelatorioBarra[] = entradas.map((e) => ({
    key: e.id,
    label: e.nome,
    horas: e.horas,
    pct: maxHoras > 0 ? Math.round((e.horas / maxHoras) * 1000) / 10 : 0,
    cor: e.cor,
  }));

  return {
    periodo,
    bars,
    totalHoras: entradas.reduce((acc, e) => acc + e.horas, 0),
    unidadeLabel: "projeto",
    monthLabel: null,
    canGoNextMonth: false,
  };
}
