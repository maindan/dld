"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Link2, X } from "lucide-react";
import {
  createMetaAction,
  deleteMetaAction,
  linkOrcamentoAction,
  unlinkOrcamentoAction,
} from "@/lib/actions/metas";
import { formatBRL } from "@/lib/format";
import type { MetasOverview, MetaDetalhe } from "@/lib/queries/metas";

function MetaCard({
  meta,
  disponiveis,
}: {
  meta: MetaDetalhe;
  disponiveis: MetasOverview["orcamentosDisponiveis"];
}) {
  const [, startTransition] = useTransition();
  const [linking, setLinking] = useState(false);
  const ligadosIds = new Set(meta.recursos.map((r) => r.orcamentoId));
  const opcoes = disponiveis.filter((o) => !ligadosIds.has(o.id));

  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[15px] font-semibold text-[#e6eaf0]">{meta.titulo}</div>
          <div className="font-mono text-[12.5px] text-muted-foreground">
            {formatBRL(meta.arrecadado)} / {formatBRL(meta.valor)}
          </div>
        </div>
        <button
          onClick={() => startTransition(() => deleteMetaAction(meta.id))}
          className="flex-none p-1.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="h-[8px] w-full overflow-hidden rounded-full bg-[#1b222c]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#818cf8] to-[#34d399]"
          style={{ width: `${Math.round(meta.progresso * 100)}%` }}
        />
      </div>

      {meta.recursos.length > 0 && (
        <div className="flex flex-col gap-1">
          {meta.recursos.map((r) => (
            <div
              key={r.orcamentoId}
              className="flex items-center justify-between gap-2 rounded-[8px] bg-[#1b222c] px-2.5 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-[12px] text-[#c9d1dc]">
                {r.titulo} <span className="text-muted-foreground">· {r.freelaNome}</span>
              </span>
              <span className="flex-none font-mono text-[11px] text-muted-foreground">
                {formatBRL(r.pago)}
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

      {linking ? (
        <div className="flex items-center gap-2">
          <select
            autoFocus
            className="flex-1 rounded-[9px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            onChange={(e) => {
              if (!e.target.value) return;
              startTransition(() => linkOrcamentoAction(meta.id, e.target.value));
              setLinking(false);
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Selecionar orçamento...
            </option>
            {opcoes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.titulo} · {o.freelaNome}
              </option>
            ))}
          </select>
          <button onClick={() => setLinking(false)} className="text-muted-foreground hover:text-[#e6eaf0]">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setLinking(true)}
          disabled={opcoes.length === 0}
          className="flex items-center gap-1.5 self-start text-[12px] text-primary disabled:opacity-40"
        >
          <Link2 size={13} /> Vincular orçamento
        </button>
      )}
    </div>
  );
}

export function MetasBoard({ overview }: { overview: MetasOverview }) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      <form
        action={(fd) => startTransition(() => createMetaAction(fd))}
        className="flex flex-wrap items-center gap-2 rounded-[12px] border border-border bg-card p-3"
      >
        <input
          name="titulo"
          required
          placeholder="Nome da meta..."
          className="min-w-[180px] flex-1 rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <input
          name="valor"
          type="number"
          min="1"
          step="0.01"
          required
          placeholder="Valor alvo (R$)"
          className="w-[160px] rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          <Plus size={15} /> Nova meta
        </button>
      </form>

      {overview.metas.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhuma meta cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {overview.metas.map((m) => (
            <MetaCard key={m.id} meta={m} disponiveis={overview.orcamentosDisponiveis} />
          ))}
        </div>
      )}
    </div>
  );
}
