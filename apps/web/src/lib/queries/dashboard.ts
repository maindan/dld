import {
  db,
  freelas,
  orcamentos,
  orcamentoItens,
  tasksPessoais,
  posts,
  portfolioItens,
  expedientes,
  expedientePausas,
} from "@danlimadev/db";
import { and, eq, gte, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { formatBRL, formatDateShort, isLate } from "@/lib/format";

const DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex"] as const;
const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Nothing in the schema (profiles, metas) carries a weekly-hours target — checked
 * both before adding this. Using a fixed 40h Mon-Fri benchmark (conventional
 * full-time week) to drive the status dot/label until a real config exists.
 */
const META_HORAS_SEMANA = 40;

function formatHorasHM(horas: number): string {
  const totalMin = Math.round(Math.max(0, horas) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function overlapMs(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

export interface BarraHoras {
  label: string;
  horas: number;
}

export interface ReceitaFreela {
  freelaId: string;
  nome: string;
  cor: string;
  recebido: number;
  recebidoFmt: string;
  pendente: number;
  pendenteFmt: string;
  total: number;
}

export interface ItemAtrasado {
  key: string;
  titulo: string;
  origem: string;
  cor: string;
  prazoFmt: string;
}

export interface ProximaEntrega {
  key: string;
  desc: string;
  freela: string;
  cor: string;
  prazoFmt: string;
}

export interface DashboardHome {
  semanaFmt: string;
  expStatusCor: string;
  expStatusLabel: string;
  bars: BarraHoras[];

  receitaPorFreela: ReceitaFreela[];
  recTotalFmt: string;
  pendenteTotalFmt: string;

  lateCount: number;
  lateNumCor: string;
  lateList: ItemAtrasado[];

  enviadosN: number;
  aprovadosN: number;

  aRecTotalFmt: string;

  prox3: ProximaEntrega[];

  postsN: number;
  rascunhosN: number;
  pfN: number;
}

export async function getDashboardHome(): Promise<DashboardHome> {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dow = new Date(todayUTC).getUTCDay(); // 0 = domingo
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const mondayMs = todayUTC + diffToMonday * DIA_MS;
  const diasSemana = DIAS_SEMANA.map((label, i) => ({
    label,
    startMs: mondayMs + i * DIA_MS,
    endMs: mondayMs + (i + 1) * DIA_MS,
  }));
  const semanaInicio = new Date(mondayMs);
  const semanaFim = new Date(mondayMs + 5 * DIA_MS); // sábado 00:00 UTC, exclusivo

  const [expedientesSemana, freelasList, todosOrcamentos, itensAbertos, tasksAbertas, postsList, portfolioList] =
    await Promise.all([
      db
        .select()
        .from(expedientes)
        .where(
          and(
            lt(expedientes.iniciadoEm, semanaFim),
            or(isNull(expedientes.encerradoEm), gte(expedientes.encerradoEm, semanaInicio)),
          ),
        ),
      db.select({ id: freelas.id, nome: freelas.nome, cor: freelas.cor }).from(freelas),
      db
        .select({
          id: orcamentos.id,
          freelaId: orcamentos.freelaId,
          status: orcamentos.status,
          valor: orcamentos.valor,
          pago: orcamentos.pago,
        })
        .from(orcamentos),
      db
        .select({
          id: orcamentoItens.id,
          desc: orcamentoItens.desc,
          prazo: orcamentoItens.prazo,
          freelaId: orcamentos.freelaId,
        })
        .from(orcamentoItens)
        .innerJoin(orcamentos, eq(orcamentoItens.orcamentoId, orcamentos.id))
        .where(and(eq(orcamentoItens.done, false), isNotNull(orcamentoItens.prazo))),
      db
        .select({ id: tasksPessoais.id, titulo: tasksPessoais.titulo, prazo: tasksPessoais.prazo })
        .from(tasksPessoais)
        .where(and(eq(tasksPessoais.done, false), isNotNull(tasksPessoais.prazo))),
      db.select({ id: posts.id, status: posts.status }).from(posts),
      db.select({ id: portfolioItens.id }).from(portfolioItens),
    ]);

  // ---- horas na semana ----
  const expedienteIds = expedientesSemana.map((e) => e.id);
  const pausas = expedienteIds.length
    ? await db.select().from(expedientePausas).where(inArray(expedientePausas.expedienteId, expedienteIds))
    : [];

  const nowMs = now.getTime();
  const horasPorDia = diasSemana.map(({ startMs, endMs }) => {
    let ms = 0;
    for (const exp of expedientesSemana) {
      const inicioMs = exp.iniciadoEm.getTime();
      const fimMs = exp.encerradoEm ? exp.encerradoEm.getTime() : nowMs;
      const brutoOverlap = overlapMs(inicioMs, fimMs, startMs, endMs);
      if (brutoOverlap <= 0) continue;
      const pausadoOverlap = pausas
        .filter((p) => p.expedienteId === exp.id)
        .reduce((acc, p) => {
          const pIni = p.pausadoEm.getTime();
          const pFim = p.retomadoEm ? p.retomadoEm.getTime() : nowMs;
          return acc + overlapMs(pIni, pFim, startMs, endMs);
        }, 0);
      ms += Math.max(0, brutoOverlap - pausadoOverlap);
    }
    return ms / (60 * 60 * 1000);
  });

  const horasSemana = horasPorDia.reduce((a, b) => a + b, 0);
  const bars: BarraHoras[] = diasSemana.map(({ label }, i) => ({
    label,
    horas: Math.round(horasPorDia[i] * 100) / 100,
  }));

  const razaoMeta = horasSemana / META_HORAS_SEMANA;
  const expStatusCor = razaoMeta >= 0.9 ? "#34d399" : razaoMeta >= 0.5 ? "#fbbf24" : "#f87171";
  const expStatusLabel =
    razaoMeta >= 0.9 ? "dentro da meta" : razaoMeta >= 0.5 ? "abaixo do ritmo" : "muito abaixo da meta";

  // ---- receita por freela (recebido + pendente) ----
  const freelaInfo = new Map(freelasList.map((f) => [f.id, f]));
  const porFreela = new Map<string, { recebido: number; pendente: number }>();
  for (const o of todosOrcamentos) {
    const pago = Number(o.pago);
    const valor = Number(o.valor);
    const entry = porFreela.get(o.freelaId) ?? { recebido: 0, pendente: 0 };
    entry.recebido += pago;
    if (o.status === "aprovado" || o.status === "pago_parcial") {
      entry.pendente += Math.max(0, valor - pago);
    }
    porFreela.set(o.freelaId, entry);
  }
  const receitaPorFreela: ReceitaFreela[] = [...porFreela.entries()]
    .filter(([, v]) => v.recebido > 0 || v.pendente > 0)
    .map(([freelaId, v]) => {
      const f = freelaInfo.get(freelaId);
      return {
        freelaId,
        nome: f?.nome ?? "Freela",
        cor: f?.cor ?? "#818cf8",
        recebido: v.recebido,
        recebidoFmt: formatBRL(v.recebido),
        pendente: v.pendente,
        pendenteFmt: formatBRL(v.pendente),
        total: v.recebido + v.pendente,
      };
    })
    .sort((a, b) => b.total - a.total);
  const recTotal = receitaPorFreela.reduce((acc, d) => acc + d.recebido, 0);
  const recTotalFmt = formatBRL(recTotal);
  const pendenteTotal = receitaPorFreela.reduce((acc, d) => acc + d.pendente, 0);
  const pendenteTotalFmt = formatBRL(pendenteTotal);

  // ---- orçamentos ----
  const enviadosN = todosOrcamentos.filter((o) => o.status === "enviado").length;
  const aprovadosN = todosOrcamentos.filter((o) => o.status === "aprovado").length;

  // ---- a receber ----
  const aRecTotal = todosOrcamentos
    .filter((o) => o.status === "aprovado" || o.status === "pago_parcial")
    .reduce((acc, o) => acc + Math.max(0, Number(o.valor) - Number(o.pago)), 0);
  const aRecTotalFmt = formatBRL(aRecTotal);

  // ---- tasks atrasadas ----
  const itensAtrasados = itensAbertos.filter((it) => isLate(it.prazo));
  const tasksAtrasadasList = tasksAbertas.filter((t) => isLate(t.prazo));
  const lateCount = itensAtrasados.length + tasksAtrasadasList.length;
  const lateNumCor = lateCount > 0 ? "#f87171" : "#c9d1dc";

  const lateList: ItemAtrasado[] = [
    ...itensAtrasados.map((it) => ({
      key: `item-${it.id}`,
      titulo: it.desc,
      origem: freelaInfo.get(it.freelaId)?.nome ?? "pessoal",
      cor: freelaInfo.get(it.freelaId)?.cor ?? "#55606e",
      prazo: it.prazo!,
    })),
    ...tasksAtrasadasList.map((t) => ({
      key: `task-${t.id}`,
      titulo: t.titulo,
      origem: "pessoal",
      cor: "#55606e",
      prazo: t.prazo!,
    })),
  ]
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 2)
    .map(({ key, titulo, origem, cor, prazo }) => ({ key, titulo, origem, cor, prazoFmt: formatDateShort(prazo) }));

  // ---- próximas entregas ----
  const prox3: ProximaEntrega[] = [
    ...itensAbertos
      .filter((it) => !isLate(it.prazo))
      .map((it) => ({
        key: `item-${it.id}`,
        desc: it.desc,
        freela: freelaInfo.get(it.freelaId)?.nome ?? "Pessoal",
        cor: freelaInfo.get(it.freelaId)?.cor ?? "#55606e",
        prazo: it.prazo!,
      })),
    ...tasksAbertas
      .filter((t) => !isLate(t.prazo))
      .map((t) => ({
        key: `task-${t.id}`,
        desc: t.titulo,
        freela: "Pessoal",
        cor: "#55606e",
        prazo: t.prazo!,
      })),
  ]
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 3)
    .map(({ key, desc, freela, cor, prazo }) => ({ key, desc, freela, cor, prazoFmt: formatDateShort(prazo) }));

  // ---- blog & portfolio ----
  const postsN = postsList.filter((p) => p.status === "publicado").length;
  const rascunhosN = postsList.filter((p) => p.status === "rascunho").length;
  const pfN = portfolioList.length;

  return {
    semanaFmt: formatHorasHM(horasSemana),
    expStatusCor,
    expStatusLabel,
    bars,
    receitaPorFreela,
    recTotalFmt,
    pendenteTotalFmt,
    lateCount,
    lateNumCor,
    lateList,
    enviadosN,
    aprovadosN,
    aRecTotalFmt,
    prox3,
    postsN,
    rascunhosN,
    pfN,
  };
}
