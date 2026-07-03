"use client";

import { useMemo } from "react";
import type { OrcamentoView } from "@/lib/queries/freelas";

export function AtividadesDashboard({ orcamentos }: { orcamentos: OrcamentoView[] }) {
  const { total, done, porOrcamento } = useMemo(() => {
    const comItens = orcamentos.filter((o) => o.itens.length > 0);
    let total = 0;
    let done = 0;
    const porOrcamento = comItens.map((o) => {
      const t = o.itens.length;
      const d = o.itens.filter((it) => it.done).length;
      total += t;
      done += d;
      return { id: o.id, numero: o.numero, titulo: o.titulo, total: t, done: d };
    });
    return { total, done, porOrcamento };
  }, [orcamentos]);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-4">
      <div className="text-[10.5px] tracking-wide text-muted-foreground uppercase">Progresso de atividades</div>

      {total === 0 ? (
        <div className="py-6 text-center text-[12.5px] text-muted-foreground">
          Nenhuma atividade cadastrada nos orçamentos ainda.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-[9px] overflow-hidden rounded-full bg-[#11151c]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-success to-[#2dd4bf] transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="flex-none font-mono text-[13px] font-semibold text-success">{pct}%</div>
          </div>
          <div className="text-[12px] text-muted-foreground">
            <span className="font-mono text-[#c9d1dc]">{done}</span> de{" "}
            <span className="font-mono text-[#c9d1dc]">{total}</span> atividades concluídas
          </div>

          {porOrcamento.length > 1 && (
            <div className="flex flex-col gap-2 border-t border-[#1f2733] pt-3">
              {porOrcamento.map((o) => {
                const p = o.total > 0 ? Math.round((o.done / o.total) * 100) : 0;
                return (
                  <div key={o.id} className="flex items-center gap-2.5 text-[11.5px]">
                    <span className="w-[70px] flex-none truncate font-mono text-[#55606e]">ORC-{String(o.numero).padStart(3, "0")}</span>
                    <span className="min-w-0 flex-1 truncate text-[#8b96a5]">{o.titulo}</span>
                    <div className="h-[5px] w-[72px] flex-none overflow-hidden rounded-full bg-[#11151c]">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p}%` }} />
                    </div>
                    <span className="w-8 flex-none text-right font-mono text-[#55606e]">{p}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
