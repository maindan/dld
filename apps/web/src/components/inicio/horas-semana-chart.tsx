"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { BarraHoras } from "@/lib/queries/dashboard";

const chartConfig = {
  horas: { label: "Horas", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function HorasSemanaChart({ bars }: { bars: BarraHoras[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[84px] w-[168px]">
      <BarChart data={bars} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          tick={{ fontSize: 9, fill: "#55606e", fontFamily: "var(--font-mono)" }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel formatter={(value) => [`${Number(value).toFixed(1)}h`, ""]} />}
        />
        <Bar dataKey="horas" fill="var(--color-horas)" radius={3} maxBarSize={16} />
      </BarChart>
    </ChartContainer>
  );
}
