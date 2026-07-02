import { db, expedientes, expedientePausas, freelas } from "@danlimadev/db";
import { isNull, eq, desc, isNotNull, inArray, and } from "drizzle-orm";

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
}

export async function getProjetosParaExpediente(): Promise<ProjetoOpcao[]> {
  const lista = await db.select({ id: freelas.id, nome: freelas.nome }).from(freelas);
  return [...lista, { id: "pessoal", nome: "Pessoal" }];
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

export interface ExpedienteHistorico {
  id: string;
  projetos: string[];
  iniciadoEm: Date;
  encerradoEm: Date;
  duracaoSegundos: number;
}

export async function getExpedientesHistorico(limite = 10): Promise<ExpedienteHistorico[]> {
  const fechados = await db
    .select()
    .from(expedientes)
    .where(isNotNull(expedientes.encerradoEm))
    .orderBy(desc(expedientes.iniciadoEm))
    .limit(limite);

  const ids = fechados.map((e) => e.id);
  const pausas = ids.length
    ? await db.select().from(expedientePausas).where(inArray(expedientePausas.expedienteId, ids))
    : [];

  return fechados.map((e) => {
    const fim = e.encerradoEm as Date;
    const brutoMs = fim.getTime() - e.iniciadoEm.getTime();
    const pausadoMs = pausas
      .filter((p) => p.expedienteId === e.id)
      .reduce((acc, p) => {
        const pFim = p.retomadoEm ? p.retomadoEm.getTime() : fim.getTime();
        return acc + Math.max(0, pFim - p.pausadoEm.getTime());
      }, 0);
    return {
      id: e.id,
      projetos: e.projetos,
      iniciadoEm: e.iniciadoEm,
      encerradoEm: fim,
      duracaoSegundos: Math.max(0, Math.floor((brutoMs - pausadoMs) / 1000)),
    };
  });
}
