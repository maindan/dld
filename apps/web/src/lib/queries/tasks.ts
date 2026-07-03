import {
  db,
  tasksPessoais,
  projetosPessoais,
  orcamentoItens,
  orcamentos,
  freelas,
} from "@danlimadev/db";
import { desc, eq } from "drizzle-orm";
import { isLate } from "@/lib/format";

export interface TaskItem {
  id: string;
  tipo: "pessoal" | "freela";
  titulo: string;
  sub: string;
  prazo: string | null;
  done: boolean;
  atrasada: boolean;
  freelaId: string | null;
}

export interface ProjetoPessoal {
  id: string;
  nome: string;
  desc: string;
  planejamento: string;
  stacks: string[];
  nTasks: number;
}

/** A freela that currently has an orçamento able to receive ad-hoc deliverable items. */
export interface FreelaTarget {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  /** Orçamento chosen to receive items created from the Tasks screen: the most recent non-recusado one, else the most recent overall. */
  orcamentoId: string;
}

export interface TasksOverview {
  atrasadas: TaskItem[];
  hoje: TaskItem[];
  proximas: TaskItem[];
  semPrazo: TaskItem[];
  concluidas: TaskItem[];
  projetos: ProjetoPessoal[];
  freelaTargets: FreelaTarget[];
}

export async function getTasksOverview(): Promise<TasksOverview> {
  const hoje = new Date().toISOString().slice(0, 10);

  const [pessoais, itens, projetosRows, freelasRows, orcamentosRows] = await Promise.all([
    db
      .select({
        id: tasksPessoais.id,
        titulo: tasksPessoais.titulo,
        prazo: tasksPessoais.prazo,
        done: tasksPessoais.done,
        projetoId: tasksPessoais.projetoId,
        projetoNome: projetosPessoais.nome,
        createdAt: tasksPessoais.createdAt,
      })
      .from(tasksPessoais)
      .leftJoin(projetosPessoais, eq(tasksPessoais.projetoId, projetosPessoais.id))
      .orderBy(desc(tasksPessoais.createdAt)),
    db
      .select({
        id: orcamentoItens.id,
        desc: orcamentoItens.desc,
        prazo: orcamentoItens.prazo,
        done: orcamentoItens.done,
        freelaId: freelas.id,
        freelaNome: freelas.nome,
      })
      .from(orcamentoItens)
      .innerJoin(orcamentos, eq(orcamentoItens.orcamentoId, orcamentos.id))
      .innerJoin(freelas, eq(orcamentos.freelaId, freelas.id)),
    db.select().from(projetosPessoais).orderBy(desc(projetosPessoais.createdAt)),
    db
      .select({ id: freelas.id, nome: freelas.nome, tipo: freelas.tipo, cor: freelas.cor })
      .from(freelas)
      .orderBy(desc(freelas.createdAt)),
    db
      .select({ id: orcamentos.id, freelaId: orcamentos.freelaId, status: orcamentos.status })
      .from(orcamentos)
      .orderBy(desc(orcamentos.createdAt)),
  ]);

  const all: TaskItem[] = [
    ...pessoais.map((t) => ({
      id: t.id,
      tipo: "pessoal" as const,
      titulo: t.titulo,
      sub: t.projetoNome ?? "Pessoal",
      prazo: t.prazo,
      done: t.done,
      atrasada: !t.done && isLate(t.prazo, hoje),
      freelaId: null,
    })),
    ...itens.map((it) => ({
      id: it.id,
      tipo: "freela" as const,
      titulo: it.desc,
      sub: it.freelaNome,
      prazo: it.prazo,
      done: it.done,
      atrasada: !it.done && isLate(it.prazo, hoje),
      freelaId: it.freelaId,
    })),
  ];

  const pendentes = all.filter((t) => !t.done);
  const concluidas = all.filter((t) => t.done).slice(0, 20);

  const nTasksPorProjeto = new Map<string, number>();
  for (const t of pessoais) {
    if (!t.projetoId) continue;
    nTasksPorProjeto.set(t.projetoId, (nTasksPorProjeto.get(t.projetoId) ?? 0) + 1);
  }

  const projetos: ProjetoPessoal[] = projetosRows.map((p) => ({
    id: p.id,
    nome: p.nome,
    desc: p.desc,
    planejamento: p.planejamento,
    stacks: p.stacks,
    nTasks: nTasksPorProjeto.get(p.id) ?? 0,
  }));

  // Most recent non-recusado orçamento per freela, falling back to the most recent overall.
  const melhorOrcamentoPorFreela = new Map<string, { id: string; status: string }>();
  for (const o of orcamentosRows) {
    const atual = melhorOrcamentoPorFreela.get(o.freelaId);
    if (!atual) {
      melhorOrcamentoPorFreela.set(o.freelaId, o);
    } else if (atual.status === "recusado" && o.status !== "recusado") {
      melhorOrcamentoPorFreela.set(o.freelaId, o);
    }
  }

  const freelaTargets: FreelaTarget[] = freelasRows
    .map((f) => {
      const orc = melhorOrcamentoPorFreela.get(f.id);
      return orc ? { id: f.id, nome: f.nome, tipo: f.tipo, cor: f.cor, orcamentoId: orc.id } : null;
    })
    .filter((x): x is FreelaTarget => x !== null);

  return {
    atrasadas: pendentes.filter((t) => t.atrasada),
    hoje: pendentes.filter((t) => !t.atrasada && t.prazo === hoje),
    proximas: pendentes
      .filter((t) => !t.atrasada && t.prazo && t.prazo !== hoje)
      .sort((a, b) => (a.prazo ?? "").localeCompare(b.prazo ?? "")),
    semPrazo: pendentes.filter((t) => !t.prazo),
    concluidas,
    projetos,
    freelaTargets,
  };
}

export async function setTaskPessoalDone(id: string, done: boolean) {
  await db.update(tasksPessoais).set({ done }).where(eq(tasksPessoais.id, id));
}

export async function setOrcamentoItemDone(id: string, done: boolean) {
  await db.update(orcamentoItens).set({ done }).where(eq(orcamentoItens.id, id));
}

export async function createTaskPessoal(input: {
  titulo: string;
  prazo: string | null;
  projetoId: string | null;
}) {
  await db.insert(tasksPessoais).values(input);
}

export async function deleteTaskPessoal(id: string) {
  await db.delete(tasksPessoais).where(eq(tasksPessoais.id, id));
}

export async function createProjetoPessoal(input: {
  nome: string;
  desc: string;
  planejamento: string;
  stacks: string[];
}) {
  const [projeto] = await db.insert(projetosPessoais).values(input).returning();
  return projeto;
}
