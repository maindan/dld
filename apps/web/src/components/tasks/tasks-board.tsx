"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, FolderPlus, Plus, Trash2 } from "lucide-react";
import {
  toggleTaskPessoalAction,
  toggleOrcamentoItemAction,
  createTaskPessoalAction,
  deleteTaskPessoalAction,
  createProjetoPessoalAction,
} from "@/lib/actions/tasks";
import { formatDateShort } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TaskItem, ProjetoPessoal, FreelaTarget, TasksOverview } from "@/lib/queries/tasks";

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

type Destino = {
  key: string;
  tipo: "pessoal" | "freela";
  id: string | null;
  nome: string;
  cor: string;
  badge: string;
};

function NovaTaskModal({
  projetos,
  freelaTargets,
}: {
  projetos: ProjetoPessoal[];
  freelaTargets: FreelaTarget[];
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [titulo, setTitulo] = useState("");
  const [prazo, setPrazo] = useState("");
  const [destino, setDestino] = useState<{ tipo: "pessoal" | "freela"; id: string | null }>({
    tipo: "pessoal",
    id: null,
  });

  const destinos = useMemo<Destino[]>(
    () => [
      { key: "pessoal", tipo: "pessoal", id: null, nome: "Pessoal", cor: "#55606e", badge: "PESSOAL" },
      ...projetos.map((p) => ({
        key: `proj:${p.id}`,
        tipo: "pessoal" as const,
        id: p.id,
        nome: p.nome,
        cor: "#818cf8",
        badge: "PROJETO",
      })),
      ...freelaTargets.map((f) => ({
        key: `freela:${f.id}`,
        tipo: "freela" as const,
        id: f.id,
        nome: f.nome,
        cor: f.cor,
        badge: "FREELA",
      })),
    ],
    [projetos, freelaTargets]
  );

  const selectedKey =
    destino.id === null ? "pessoal" : `${destino.tipo === "freela" ? "freela" : "proj"}:${destino.id}`;

  function reset() {
    setTitulo("");
    setPrazo("");
    setDestino({ tipo: "pessoal", id: null });
  }

  function submit() {
    const t = titulo.trim();
    if (!t) return;
    const fd = new FormData();
    fd.set("titulo", t);
    fd.set("prazo", prazo);
    fd.set("destinoTipo", destino.tipo);
    fd.set("destinoId", destino.id ?? "");
    setOpen(false);
    reset();
    startTransition(() => {
      createTaskPessoalAction(fd);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground">
        <Plus size={15} /> Nova task
      </DialogTrigger>
      <DialogContent className="gap-3.5 sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Nova task</DialogTitle>
        </DialogHeader>
        <input
          autoFocus
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="O que precisa ser feito? *"
          className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-muted-foreground">Projeto</label>
          <div className="flex max-h-[180px] flex-col gap-1.5 overflow-y-auto">
            {destinos.map((d) => {
              const active = d.key === selectedKey;
              return (
                <button
                  type="button"
                  key={d.key}
                  onClick={() => setDestino({ tipo: d.tipo, id: d.id })}
                  className="flex items-center gap-2.5 rounded-[9px] border px-2.5 py-2 text-left"
                  style={{
                    borderColor: active ? "#818cf8" : "#262e39",
                    background: active ? "rgba(129,140,248,0.08)" : "transparent",
                  }}
                >
                  <span className="size-[7px] flex-none rounded-full" style={{ background: d.cor }} />
                  <span className="flex-1 truncate text-[13px]">{d.nome}</span>
                  <span className="flex-none font-mono text-[10px] uppercase text-muted-foreground">
                    {d.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <label className="flex-none text-[12px] text-muted-foreground">Prazo (opcional)</label>
          <input
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className="flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-2 font-mono text-[12px] text-[#c9d1dc] outline-none focus:border-primary"
          />
        </div>
        <DialogFooter className="-mx-0 -mb-0 flex-row border-t-0 bg-transparent p-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-[9px] bg-[#222b36] py-2.5 text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!titulo.trim()}
            className="flex-[2] rounded-[9px] bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
          >
            Adicionar task
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NovoProjetoModal({ onCreated }: { onCreated: (p: ProjetoPessoal) => void }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [desc, setDesc] = useState("");
  const [planejamento, setPlanejamento] = useState("");
  const [stacks, setStacks] = useState("");

  function reset() {
    setNome("");
    setDesc("");
    setPlanejamento("");
    setStacks("");
  }

  async function submit() {
    const n = nome.trim();
    if (!n) return;
    const fd = new FormData();
    fd.set("nome", n);
    fd.set("desc", desc.trim());
    fd.set("planejamento", planejamento.trim());
    fd.set("stacks", stacks);
    setOpen(false);
    reset();
    const projeto = await createProjetoPessoalAction(fd);
    if (projeto) {
      onCreated({
        id: projeto.id,
        nome: projeto.nome,
        desc: projeto.desc,
        planejamento: projeto.planejamento,
        stacks: projeto.stacks,
        nTasks: 0,
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground">
        <FolderPlus size={15} /> Novo projeto
      </DialogTrigger>
      <DialogContent className="gap-3 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Novo projeto pessoal</DialogTitle>
        </DialogHeader>
        <input
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do projeto *"
          className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Descrição curta"
          className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
        />
        <textarea
          value={planejamento}
          onChange={(e) => setPlanejamento(e.target.value)}
          rows={3}
          placeholder="Planejamento / metas do projeto"
          className="resize-y rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-primary"
        />
        <input
          value={stacks}
          onChange={(e) => setStacks(e.target.value)}
          placeholder="Stacks (separadas por vírgula)"
          className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
        />
        <DialogFooter className="-mx-0 -mb-0 flex-row border-t-0 bg-transparent p-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-[9px] bg-[#222b36] py-2.5 text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!nome.trim()}
            className="flex-[2] rounded-[9px] bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
          >
            Criar projeto
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjetosGrid({ projetos }: { projetos: ProjetoPessoal[] }) {
  if (projetos.length === 0) {
    return (
      <div className="py-10 text-center text-[12.5px] text-muted-foreground">
        Nenhum projeto pessoal ainda.
      </div>
    );
  }
  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
      {projetos.map((p) => (
        <div key={p.id} className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-[18px]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-[rgba(139,150,165,0.14)] text-[#c9d1dc]">
              <FolderPlus size={16} />
            </span>
            <span className="flex-1 truncate text-[15px] font-semibold">{p.nome}</span>
            <span className="flex-none rounded-[5px] bg-[#11151c] px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
              {p.nTasks}
            </span>
          </div>
          {p.desc && <div className="text-[12.5px] leading-relaxed text-[#c9d1dc]">{p.desc}</div>}
          {p.planejamento && (
            <div className="flex flex-col gap-1 rounded-[9px] border border-[#1f2733] bg-[#11151c] px-3 py-2.5">
              <div className="text-[10px] tracking-wide text-muted-foreground uppercase">Planejamento</div>
              <div className="text-[12px] leading-relaxed text-muted-foreground">{p.planejamento}</div>
            </div>
          )}
          {p.stacks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.stacks.map((s) => (
                <span
                  key={s}
                  className="rounded-[5px] bg-[rgba(129,140,248,0.1)] px-2 py-0.5 font-mono text-[10.5px] text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function TasksBoard({ overview }: { overview: TasksOverview }) {
  const [projetos, setProjetos] = useState<ProjetoPessoal[]>(overview.projetos);
  const [tab, setTab] = useState<"atividades" | "projetos">("atividades");

  const pendentesCount =
    overview.atrasadas.length +
    overview.hoje.length +
    overview.proximas.length +
    overview.semPrazo.length;

  return (
    <div className="flex w-full flex-col gap-3.5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "atividades" | "projetos")} className="gap-0">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList className="h-auto gap-0.5 rounded-[9px] border border-border bg-[#11151c] p-[3px]">
            <TabsTrigger
              value="atividades"
              className="rounded-[6px] px-3.5 py-1.5 text-[12.5px] font-medium data-active:bg-warning data-active:text-background"
            >
              Atividades
            </TabsTrigger>
            <TabsTrigger
              value="projetos"
              className="rounded-[6px] px-3.5 py-1.5 text-[12.5px] font-medium data-active:bg-warning data-active:text-background"
            >
              Projetos pessoais
            </TabsTrigger>
          </TabsList>
          <div className="flex-1" />
          {tab === "atividades" ? (
            <NovaTaskModal projetos={projetos} freelaTargets={overview.freelaTargets} />
          ) : (
            <NovoProjetoModal onCreated={(p) => setProjetos((old) => [...old, p])} />
          )}
        </div>

        <TabsContent value="atividades" className="flex flex-col gap-3.5 pt-3.5">
          <div className="text-[12px] text-muted-foreground">
            Freelas têm prioridade sobre projetos pessoais.
          </div>
          <div className="rounded-[12px] border border-border bg-card p-2">
            <Section title="Atrasadas" items={overview.atrasadas} cor="#f87171" />
            <Section title="Hoje" items={overview.hoje} cor="#fbbf24" />
            <Section title="Próximas" items={overview.proximas} />
            <Section title="Sem prazo" items={overview.semPrazo} />
            {pendentesCount === 0 && (
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
        </TabsContent>

        <TabsContent value="projetos" className="pt-3.5">
          <ProjetosGrid projetos={projetos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
