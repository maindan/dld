import {
  db,
  orcamentoItens,
  orcamentos,
  freelas,
  tasksPessoais,
  projetosPessoais,
  notificacoesDismissidas,
} from "@danlimadev/db";
import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { formatDateShort, isLate } from "@/lib/format";

export interface Notificacao {
  key: string;
  tipo: string;
  cor: string;
  bg: string;
  icon: "clock" | "check";
  titulo: string;
  sub: string;
  screen: "tasks" | "freelas";
  freelaId: string | null;
}

export async function getNotificacoes(): Promise<Notificacao[]> {
  const hoje = new Date().toISOString().slice(0, 10);

  const [itensAtrasados, pessoaisAtrasadas, aguardandoConfirmacao, dismissed] = await Promise.all([
    db
      .select({
        itemId: orcamentoItens.id,
        desc: orcamentoItens.desc,
        prazo: orcamentoItens.prazo,
        freelaNome: freelas.nome,
      })
      .from(orcamentoItens)
      .innerJoin(orcamentos, eq(orcamentoItens.orcamentoId, orcamentos.id))
      .innerJoin(freelas, eq(orcamentos.freelaId, freelas.id))
      .where(
        and(
          eq(orcamentoItens.done, false),
          isNotNull(orcamentoItens.prazo),
          lt(orcamentoItens.prazo, hoje),
          inArray(orcamentos.status, ["pago_parcial", "pago_total"]),
        ),
      ),
    db
      .select({
        taskId: tasksPessoais.id,
        titulo: tasksPessoais.titulo,
        prazo: tasksPessoais.prazo,
        projetoNome: projetosPessoais.nome,
      })
      .from(tasksPessoais)
      .leftJoin(projetosPessoais, eq(tasksPessoais.projetoId, projetosPessoais.id))
      .where(
        and(
          eq(tasksPessoais.done, false),
          isNotNull(tasksPessoais.prazo),
          lt(tasksPessoais.prazo, hoje),
        ),
      ),
    db
      .select({
        id: orcamentos.id,
        titulo: orcamentos.titulo,
        freelaId: orcamentos.freelaId,
        freelaNome: freelas.nome,
      })
      .from(orcamentos)
      .innerJoin(freelas, eq(orcamentos.freelaId, freelas.id))
      .where(eq(orcamentos.status, "aprovado")),
    db.select().from(notificacoesDismissidas),
  ]);

  const dismissedKeys = new Set(dismissed.map((d) => d.chave));
  const notifs: Notificacao[] = [];

  for (const it of itensAtrasados) {
    if (!isLate(it.prazo)) continue;
    const key = `late-item-${it.itemId}`;
    if (dismissedKeys.has(key)) continue;
    notifs.push({
      key,
      tipo: "Task atrasada",
      cor: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      icon: "clock",
      titulo: it.desc,
      sub: `${it.freelaNome} · venceu em ${formatDateShort(it.prazo)}`,
      screen: "tasks",
      freelaId: null,
    });
  }

  for (const p of pessoaisAtrasadas) {
    if (!isLate(p.prazo)) continue;
    const key = `late-pessoal-${p.taskId}`;
    if (dismissedKeys.has(key)) continue;
    notifs.push({
      key,
      tipo: "Task atrasada",
      cor: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      icon: "clock",
      titulo: p.titulo,
      sub: `${p.projetoNome ?? "Pessoal"} · venceu em ${formatDateShort(p.prazo)}`,
      screen: "tasks",
      freelaId: null,
    });
  }

  for (const o of aguardandoConfirmacao) {
    const key = `apr-${o.id}`;
    if (dismissedKeys.has(key)) continue;
    notifs.push({
      key,
      tipo: "Orçamento aprovado",
      cor: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
      icon: "check",
      titulo: `${o.titulo} foi aprovado pelo cliente`,
      sub: `${o.freelaNome} · confirme o recebimento para liberar o cronograma`,
      screen: "freelas",
      freelaId: o.freelaId,
    });
  }

  return notifs;
}

export async function dismissNotificacao(chave: string) {
  await db.insert(notificacoesDismissidas).values({ chave }).onConflictDoNothing();
}
