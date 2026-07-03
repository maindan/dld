"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatBRL } from "@/lib/format";

interface FatiaFinanceira {
  key: "recebido" | "imposto" | "aReceber";
  nome: string;
  valor: number;
  cor: string;
}

const chartConfig = {
  recebido: { label: "Recebido (líquido)", color: "var(--success)" },
  imposto: { label: "Imposto/retenção", color: "var(--destructive)" },
  aReceber: { label: "A receber", color: "var(--warning)" },
} satisfies ChartConfig;

export function FinanceiroDashboard({
  totalValor,
  totalPagoLiquido,
  totalImposto,
  totalAReceber,
}: {
  totalValor: number;
  totalPagoLiquido: number;
  totalImposto: number;
  totalAReceber: number;
}) {
  const todasFatias: FatiaFinanceira[] = [
    { key: "recebido" as const, nome: "Recebido (líquido)", valor: totalPagoLiquido, cor: "#34d399" },
    { key: "imposto" as const, nome: "Imposto/retenção", valor: totalImposto, cor: "#f87171" },
    { key: "aReceber" as const, nome: "A receber", valor: totalAReceber, cor: "#fbbf24" },
  ];
  const fatias = todasFatias.filter((f) => f.valor > 0);

  if (totalValor <= 0 || fatias.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
        <div className="text-[10.5px] tracking-wide text-muted-foreground uppercase">
          Representação financeira
        </div>
        <div className="py-6 text-center text-[12.5px] text-muted-foreground">
          Nenhum valor lançado ainda neste projeto.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4">
      <div className="text-[10.5px] tracking-wide text-muted-foreground uppercase">Representação financeira</div>
      <div className="flex items-center gap-5">
        <ChartContainer config={chartConfig} className="aspect-square h-[136px] w-[136px] flex-none">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => [` ${formatBRL(Number(value))}`, ` ${item.payload.nome}`]}
                />
              }
            />
            <Pie data={fatias} dataKey="valor" nameKey="nome" innerRadius={44} outerRadius={66} strokeWidth={2} stroke="var(--card)">
              {fatias.map((f) => (
                <Cell key={f.key} fill={f.cor} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null;
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-mono text-[13px] font-semibold">
                        {formatBRL(totalValor)}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 15} className="fill-[#55606e] text-[9.5px]">
                        valor total
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-1 flex-col gap-2.5">
          {fatias.map((f) => (
            <div key={f.key} className="flex items-center gap-[9px]">
              <span className="size-[9px] flex-none rounded-[3px]" style={{ background: f.cor }} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#c9d1dc]">{f.nome}</span>
              <span className="font-mono text-xs text-muted-foreground">{formatBRL(f.valor)}</span>
              <span className="w-10 flex-none text-right font-mono text-[11px] text-[#55606e]">
                {Math.round((f.valor / totalValor) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
