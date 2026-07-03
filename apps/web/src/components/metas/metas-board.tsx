"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Link2, Target, X } from "lucide-react";
import {
  createMetaAction,
  deleteMetaAction,
  linkOrcamentosAction,
  unlinkOrcamentoAction,
} from "@/lib/actions/metas";
import { formatBRL } from "@/lib/format";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MetasOverview, MetaDetalhe } from "@/lib/queries/metas";

function NovaMetaDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createMetaAction(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex flex-none items-center gap-1.5 rounded-[9px] bg-success px-3.5 py-2 text-[12.5px] font-semibold text-background">
        <Plus size={15} /> Nova meta
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova meta financeira</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <input
            name="titulo"
            required
            placeholder="Ex.: MacBook Pro novo"
            className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13.5px] outline-none focus:border-success"
          />
          <input
            name="valor"
            type="number"
            min="1"
            step="0.01"
            required
            placeholder="Valor da meta (R$)"
            className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 font-mono text-[13px] outline-none focus:border-success"
          />
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Depois de criar, vincule os orçamentos a receber que vão abastecer a meta.
          </p>
          <DialogFooter className="mx-0 mb-0 gap-2 border-t-0 bg-transparent p-0">
            <DialogClose className="flex-1 rounded-[9px] bg-[#222b36] py-2.5 text-center text-[13px] font-medium text-[#c9d1dc]">
              Cancelar
            </DialogClose>
            <button
              type="submit"
              disabled={pending}
              className="flex-[2] rounded-[9px] bg-success py-2.5 text-center text-[13px] font-semibold text-background disabled:opacity-60"
            >
              Criar meta
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VincularOrcamentosDialog({
  meta,
  disponiveis,
}: {
  meta: MetaDetalhe;
  disponiveis: MetasOverview["orcamentosDisponiveis"];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const ligadosIds = new Set(meta.recursos.map((r) => r.orcamentoId));
  const opcoes = disponiveis.filter((o) => !ligadosIds.has(o.id));

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function concluir() {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      handleOpenChange(false);
      return;
    }
    startTransition(async () => {
      await linkOrcamentosAction(meta.id, ids);
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="flex items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-border py-2 text-[12px] text-muted-foreground hover:border-success hover:text-[#c9d1dc]">
        <Link2 size={13} /> Vincular orçamentos
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular orçamentos</DialogTitle>
          <p className="text-[12.5px] text-muted-foreground">
            {meta.titulo} — selecione recursos a receber.
          </p>
        </DialogHeader>

        {opcoes.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-border p-5 text-center text-[12.5px] text-muted-foreground">
            Nenhum orçamento com valor a receber no momento.
          </div>
        ) : (
          <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto">
            {opcoes.map((o) => {
              const checked = selected.has(o.id);
              return (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-[#11151c] px-3 py-2.5 has-[:checked]:border-success"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(o.id)}
                    className="size-[16px] flex-none accent-success"
                  />
                  <span
                    className="size-[7px] flex-none rounded-full"
                    style={{ background: o.freelaCor }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px]">{o.titulo}</span>
                    <span className="block font-mono text-[10.5px] text-muted-foreground">
                      {o.codigo}
                    </span>
                  </span>
                  <span className="flex-none font-mono text-[12px] text-success">
                    {formatBRL(o.valorReceber)}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <DialogFooter className="mx-0 mb-0 border-t-0 bg-transparent p-0">
          <button
            type="button"
            onClick={concluir}
            disabled={pending}
            className="w-full rounded-[9px] bg-success py-2.5 text-center text-[13px] font-semibold text-background disabled:opacity-60"
          >
            Concluir
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetaCard({
  meta,
  disponiveis,
}: {
  meta: MetaDetalhe;
  disponiveis: MetasOverview["orcamentosDisponiveis"];
}) {
  const [, startTransition] = useTransition();
  const pct = Math.min(100, Math.round(meta.progresso * 100));
  const falta = Math.max(0, meta.valor - meta.arrecadado);

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-[18px]">
      <div className="flex items-center gap-2.5">
        <div className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-success/12 text-success">
          <Target size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-semibold text-[#e6eaf0]">{meta.titulo}</div>
          <div className="font-mono text-[11.5px] text-muted-foreground">
            meta {formatBRL(meta.valor)}
          </div>
        </div>
        <div
          className={`font-mono text-[18px] font-semibold ${pct >= 100 ? "text-success" : "text-[#e6eaf0]"}`}
        >
          {pct}%
        </div>
        <button
          onClick={() => startTransition(() => deleteMetaAction(meta.id))}
          className="flex-none p-1.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-[9px] w-full overflow-hidden rounded-[5px] bg-[#11151c]">
          <div
            className="h-full rounded-[5px] bg-gradient-to-r from-success to-[#2dd4bf]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-4 text-[11.5px]">
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-semibold text-success">
              {formatBRL(meta.arrecadado)}
            </span>
            <span className="text-muted-foreground">reservado</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-semibold text-[#c9d1dc]">{formatBRL(falta)}</span>
            <span className="text-muted-foreground">faltam</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <div className="text-[10.5px] tracking-wide text-muted-foreground uppercase">
          Recursos vinculados
        </div>
        {meta.recursos.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {meta.recursos.map((r) => (
              <div key={r.orcamentoId} className="flex items-center gap-2 text-[12px]">
                <span
                  className="size-[7px] flex-none rounded-full"
                  style={{ background: r.freelaCor }}
                />
                <span className="min-w-0 flex-1 truncate text-[#c9d1dc]">
                  {r.titulo} <span className="text-muted-foreground">· {r.codigo}</span>
                </span>
                <span className="flex-none font-mono text-[11px] text-success">
                  {formatBRL(r.valorReceber)}
                </span>
                <button
                  onClick={() => startTransition(() => unlinkOrcamentoAction(meta.id, r.orcamentoId))}
                  className="flex-none text-muted-foreground hover:text-destructive"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <VincularOrcamentosDialog meta={meta} disponiveis={disponiveis} />
      </div>
    </div>
  );
}

export function MetasBoard({ overview }: { overview: MetasOverview }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <div className="flex-1 text-[12.5px] text-muted-foreground">
          Objetivos financeiros abastecidos por orçamentos a receber.
        </div>
        <NovaMetaDialog />
      </div>

      {overview.metas.length === 0 ? (
        <div className="rounded-[14px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhuma meta cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {overview.metas.map((m) => (
            <MetaCard key={m.id} meta={m} disponiveis={overview.orcamentosDisponiveis} />
          ))}
        </div>
      )}
    </div>
  );
}
