"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { ReceitaFreela } from "@/lib/queries/dashboard";

const chartConfig = {
  recebido: { label: "Recebido", color: "var(--success)" },
  pendente: { label: "A receber", color: "var(--warning)" },
} satisfies ChartConfig;

export function ReceitaFreelaChart({ dados }: { dados: ReceitaFreela[] }) {
  const altura = Math.max(dados.length * 34, 34);

  return (
    <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: `${altura}px` }}>
      <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.25} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="nome"
          type="category"
          tickLine={false}
          axisLine={false}
          width={84}
          tick={{ fontSize: 11.5, fill: "#c9d1dc" }}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => [
                ` ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))}`,
                name === "recebido" ? " recebido" : " a receber",
              ]}
            />
          }
        />
        <Bar dataKey="recebido" stackId="a" fill="var(--color-recebido)" radius={[3, 0, 0, 3]} barSize={14} />
        <Bar dataKey="pendente" stackId="a" fill="var(--color-pendente)" radius={[0, 3, 3, 0]} barSize={14} />
      </BarChart>
    </ChartContainer>
  );
}
