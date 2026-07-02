"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  toggleTaskPessoalAction,
  toggleOrcamentoItemAction,
  createTaskPessoalAction,
  deleteTaskPessoalAction,
  createProjetoPessoalAction,
} from "@/lib/actions/tasks";
import { formatDateShort } from "@/lib/format";
import type { TaskItem, ProjetoPessoal, TasksOverview } from "@/lib/queries/tasks";

function TaskRow({ task }: { task: TaskItem }) {
  const [, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useState(task.done);

  function toggle() {
    setOptimisticDone((v) => !v);
    startTransition(() => {
      if (task.tipo === "pessoal") {
        toggleTaskPessoalAction(task.id, !optimisticDone);
      } else {
        toggleOrcamentoItemAction(task.id, !optimisticDone);
      }
    });
  }

  const label = task.freelaId ? (
    <Link href={`/freelas/${task.freelaId}`} className="hover:underline">
      {task.sub}
    </Link>
  ) : (
    task.sub
  );

  return (
    <div className="flex items-center gap-3 rounded-[9px] px-2.5 py-2.5 hover:bg-[#1b222c]">
      <button
        onClick={toggle}
        className="flex size-5 flex-none items-center justify-center rounded-[6px] border"
        style={{
          borderColor: optimisticDone ? "#34d399" : "#303a47",
          background: optimisticDone ? "#34d399" : "transparent",
        }}
      >
        {optimisticDone && <Check size={13} className="text-background" />}
      </button>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[13.5px]"
          style={{
            color: optimisticDone ? "#55606e" : "#c9d1dc",
            textDecoration: optimisticDone ? "line-through" : "none",
          }}
        >
          {task.titulo}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">{label}</span>
      </span>
      {task.prazo && (
        <span className="flex-none font-mono text-[11px] text-muted-foreground">
          {formatDateShort(task.prazo)}
        </span>
      )}
      {task.tipo === "pessoal" && (
        <button
          onClick={() => startTransition(() => deleteTaskPessoalAction(task.id))}
          className="flex-none p-1 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

function Section({ title, items, cor }: { title: string; items: TaskItem[]; cor?: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase"
        style={{ color: cor ?? "#8b96a5" }}
      >
        {title} · {items.length}
      </div>
      {items.map((t) => (
        <TaskRow key={`${t.tipo}-${t.id}`} task={t} />
      ))}
    </div>
  );
}

export function TasksBoard({ overview }: { overview: TasksOverview }) {
  const [, startTransition] = useTransition();
  const [novoProjeto, setNovoProjeto] = useState("");
  const [projetos, setProjetos] = useState<ProjetoPessoal[]>(overview.projetos);
  const [addingProjeto, setAddingProjeto] = useState(false);

  async function criarProjeto() {
    const nome = novoProjeto.trim();
    if (!nome) return;
    setNovoProjeto("");
    setAddingProjeto(false);
    const projeto = await createProjetoPessoalAction(nome);
    if (projeto) setProjetos((p) => [...p, { id: projeto.id, nome: projeto.nome }]);
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        action={(fd) => startTransition(() => createTaskPessoalAction(fd))}
        className="flex flex-wrap items-center gap-2 rounded-[12px] border border-border bg-card p-3"
      >
        <input
          name="titulo"
          required
          placeholder="Nova task pessoal..."
          className="min-w-[180px] flex-1 rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <input
          name="prazo"
          type="date"
          className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] text-muted-foreground outline-none focus:border-primary"
        />
        <select
          name="projetoId"
          className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] text-muted-foreground outline-none focus:border-primary"
        >
          <option value="">Pessoal</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
        {addingProjeto ? (
          <span className="flex items-center gap-1.5">
            <input
              autoFocus
              value={novoProjeto}
              onChange={(e) => setNovoProjeto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), criarProjeto())}
              placeholder="nome do projeto"
              className="w-[140px] rounded-[9px] border border-border bg-[#0e1116] px-2.5 py-2 text-[12.5px] outline-none focus:border-primary"
            />
            <button type="button" onClick={criarProjeto} className="text-[12px] text-primary">
              salvar
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setAddingProjeto(true)}
            className="text-[12px] text-muted-foreground hover:text-primary"
          >
            + projeto
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          <Plus size={15} /> Adicionar
        </button>
      </form>

      <div className="rounded-[12px] border border-border bg-card p-2">
        <Section title="Atrasadas" items={overview.atrasadas} cor="#f87171" />
        <Section title="Hoje" items={overview.hoje} cor="#fbbf24" />
        <Section title="Próximas" items={overview.proximas} />
        <Section title="Sem prazo" items={overview.semPrazo} />
        {overview.atrasadas.length +
          overview.hoje.length +
          overview.proximas.length +
          overview.semPrazo.length ===
          0 && (
          <div className="py-8 text-center text-[12.5px] text-muted-foreground">
            Nenhuma task pendente. 🎉
          </div>
        )}
      </div>

      {overview.concluidas.length > 0 && (
        <details className="rounded-[12px] border border-border bg-card p-2">
          <summary className="cursor-pointer px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Concluídas · {overview.concluidas.length}
          </summary>
          <div className="mt-1 flex flex-col gap-0.5">
            {overview.concluidas.map((t) => (
              <TaskRow key={`${t.tipo}-${t.id}`} task={t} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
