"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getRelatorioHorasAction } from "@/lib/actions/expediente";
import { formatHours } from "@/lib/format";
import type { RelatorioHoras, RelatorioPeriodo } from "@/lib/queries/expediente";

function BarChart({ dados, scrollable }: { dados: RelatorioHoras; scrollable?: boolean }) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        className={
          scrollable
            ? "flex max-h-[272px] flex-col gap-2.5 overflow-y-auto pr-1"
            : "flex flex-1 flex-col justify-center gap-2.5"
        }
      >
        {dados.bars.length === 0 && (
          <div className="py-8 text-center text-[12.5px] text-muted-foreground">Sem registros no período.</div>
        )}
        {dados.bars.map((b) => (
          <div key={b.key} className="flex items-center gap-3">
            <span className="w-14 flex-none truncate text-right font-mono text-[11.5px] text-muted-foreground">
              {b.label}
            </span>
            <span className="h-3.5 flex-1 overflow-hidden rounded-[4px] bg-muted">
              <span
                className="block h-full rounded-[4px] opacity-90"
                style={{ width: `${b.horas > 0 ? Math.max(b.pct, 3) : 0}%`, background: b.cor }}
              />
            </span>
            <span className="w-13 flex-none font-mono text-[11.5px] text-foreground">{formatHours(b.horas)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border pt-3">
        <span className="flex-1 text-[11.5px] text-muted-foreground">
          Total no período · por {dados.unidadeLabel}
        </span>
        <span className="font-mono text-[14px] font-semibold text-foreground">{formatHours(dados.totalHoras)}</span>
      </div>
    </div>
  );
}

export function RelatorioHorasCard({
  semana,
  mesInicial,
  projeto,
}: {
  semana: RelatorioHoras;
  mesInicial: RelatorioHoras;
  projeto: RelatorioHoras;
}) {
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<RelatorioPeriodo>("semana");
  const [mes, setMes] = useState(mesInicial);
  const [mesOffset, setMesOffset] = useState(0);

  function irParaMes(delta: number) {
    const novoOffset = Math.min(0, mesOffset + delta);
    if (novoOffset === mesOffset) return;
    setMesOffset(novoOffset);
    startTransition(async () => {
      const dados = await getRelatorioHorasAction("mes", novoOffset);
      setMes(dados);
    });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-[14px] border border-border bg-card p-5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as RelatorioPeriodo)} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Relatório de horas
          </div>

          {tab === "mes" && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => irParaMes(-1)}
                className="flex size-[26px] items-center justify-center rounded-[7px] border border-border text-muted-foreground hover:border-primary hover:text-foreground"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="min-w-[62px] text-center text-[12.5px] font-semibold text-foreground capitalize">
                {mes.monthLabel}
              </span>
              <button
                type="button"
                onClick={() => irParaMes(1)}
                disabled={!mes.canGoNextMonth}
                className="flex size-[26px] items-center justify-center rounded-[7px] border border-border text-muted-foreground hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <TabsList className="bg-muted">
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>
            <TabsTrigger value="projeto">Projeto</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="semana" className="flex flex-1 flex-col">
          <BarChart dados={semana} />
        </TabsContent>
        <TabsContent value="mes" className="flex flex-1 flex-col">
          <BarChart dados={mes} scrollable />
        </TabsContent>
        <TabsContent value="projeto" className="flex flex-1 flex-col">
          <BarChart dados={projeto} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
