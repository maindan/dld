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
}

export interface TasksOverview {
  atrasadas: TaskItem[];
  hoje: TaskItem[];
  proximas: TaskItem[];
  semPrazo: TaskItem[];
  concluidas: TaskItem[];
  projetos: ProjetoPessoal[];
}

export async function getTasksOverview(): Promise<TasksOverview> {
  const hoje = new Date().toISOString().slice(0, 10);

  const [pessoais, itens, projetos] = await Promise.all([
    db
      .select({
        id: tasksPessoais.id,
        titulo: tasksPessoais.titulo,
        prazo: tasksPessoais.prazo,
        done: tasksPessoais.done,
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
    db.select({ id: projetosPessoais.id, nome: projetosPessoais.nome }).from(projetosPessoais),
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
  const concluidas = all
    .filter((t) => t.done)
    .slice(0, 20);

  return {
    atrasadas: pendentes.filter((t) => t.atrasada),
    hoje: pendentes.filter((t) => !t.atrasada && t.prazo === hoje),
    proximas: pendentes
      .filter((t) => !t.atrasada && t.prazo && t.prazo !== hoje)
      .sort((a, b) => (a.prazo ?? "").localeCompare(b.prazo ?? "")),
    semPrazo: pendentes.filter((t) => !t.prazo),
    concluidas,
    projetos,
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

export async function createProjetoPessoal(nome: string) {
  const [projeto] = await db.insert(projetosPessoais).values({ nome }).returning();
  return projeto;
}
