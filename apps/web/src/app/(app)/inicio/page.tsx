import Link from "next/link";
import { Target } from "lucide-react";
import { getDashboardHome } from "@/lib/queries/dashboard";
import { HorasSemanaChart } from "@/components/inicio/horas-semana-chart";
import { ReceitaFreelaChart } from "@/components/inicio/receita-freela-chart";

export default async function InicioPage() {
  const d = await getDashboardHome();

  return (
    <div className="grid grid-cols-4 gap-3.5">
      {/* horas na semana + mini chart (span 2) */}
      <div className="col-span-2 flex flex-col gap-3.5 rounded-[14px] border border-border bg-[linear-gradient(135deg,#171d26,#12161d)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <div className="font-mono text-[10.5px] tracking-[0.08em] text-[#55606e] uppercase">
              Horas na semana
            </div>
            <div className="font-mono text-[38px] leading-none font-semibold text-foreground">{d.semanaFmt}</div>
            <div className="flex items-center gap-[7px] text-[12.5px] text-muted-foreground">
              <span className="size-[7px] flex-none rounded-full" style={{ background: d.expStatusCor }} />
              {d.expStatusLabel}
            </div>
          </div>
          <HorasSemanaChart bars={d.bars} />
        </div>
        <Link
          href="/workstation"
          className="hidden text-[12.5px] font-medium text-primary hover:underline md:block"
        >
          Abrir workstation →
        </Link>
      </div>

      {/* receita por freela (span 2, row span 2) */}
      <div className="col-span-2 row-span-2 flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.08em] text-[#55606e] uppercase">Receita por freela</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-[8px] rounded-[2px] bg-success" />
              Recebido
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-[8px] rounded-[2px] bg-warning" />
              A receber
            </span>
          </div>
        </div>

        <div className="flex gap-5">
          <div className="flex flex-col gap-0.5">
            <div className="font-mono text-lg font-semibold text-success">{d.recTotalFmt}</div>
            <div className="text-[10.5px] text-muted-foreground">recebido</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-mono text-lg font-semibold text-warning">{d.pendenteTotalFmt}</div>
            <div className="text-[10.5px] text-muted-foreground">a receber</div>
          </div>
        </div>

        {d.receitaPorFreela.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-[12.5px] text-muted-foreground">
            Nenhuma receita registrada.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <ReceitaFreelaChart dados={d.receitaPorFreela} />
          </div>
        )}

        <Link href="/freelas" className="text-[12.5px] font-medium text-primary hover:underline">
          Ver freelas →
        </Link>
      </div>

      {/* tasks atrasadas (span 2) */}
      <div className="col-span-2 flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 font-mono text-[10.5px] tracking-[0.08em] text-[#55606e] uppercase">
            Tasks atrasadas
          </div>
          <div className="font-mono text-[22px] leading-none font-semibold" style={{ color: d.lateNumCor }}>
            {d.lateCount}
          </div>
        </div>
        {d.lateList.length === 0 && (
          <div className="text-[12.5px] text-muted-foreground">Nenhuma task atrasada.</div>
        )}
        {d.lateList.map((lt) => (
          <div key={lt.key} className="flex items-center gap-[9px] text-[12.5px]">
            <span className="size-1.5 flex-none rounded-full" style={{ background: lt.cor }} />
            <span className="min-w-0 flex-1 truncate text-[#c9d1dc]">{lt.titulo}</span>
            <span className="flex-none text-[11px] text-[#55606e]">{lt.origem}</span>
            <span className="flex-none font-mono text-[11px] text-destructive">{lt.prazoFmt}</span>
          </div>
        ))}
        <Link href="/tasks" className="text-[12.5px] font-medium text-primary hover:underline">
          Ver tasks →
        </Link>
      </div>

      {/* orçamentos (1) */}
      <div className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-5">
        <div className="font-mono text-[10.5px] tracking-[0.08em] text-[#55606e] uppercase">Orçamentos</div>
        <div className="flex items-baseline gap-[7px]">
          <div className="font-mono text-[28px] leading-none font-semibold text-primary">{d.enviadosN}</div>
          <div className="text-[11.5px] text-muted-foreground">no cliente</div>
        </div>
        <div className="flex items-baseline gap-[7px]">
          <div className="font-mono text-lg leading-none font-semibold text-warning">{d.aprovadosN}</div>
          <div className="text-[11.5px] text-muted-foreground">a confirmar</div>
        </div>
      </div>

      {/* a receber (1) */}
      <div className="flex flex-col gap-1.5 rounded-[14px] border border-border bg-card p-5">
        <div className="font-mono text-[10.5px] tracking-[0.08em] text-[#55606e] uppercase">A receber</div>
        <div className="font-mono text-[22px] leading-tight font-semibold text-[#c9d1dc]">{d.aRecTotalFmt}</div>
        <div className="flex-1" />
        <Link
          href="/metas"
          className="flex items-center gap-1.5 text-xs font-medium text-success hover:underline"
        >
          <Target size={14} />
          Metas
        </Link>
      </div>

      {/* próximas entregas (span 2) */}
      <div className="col-span-2 flex flex-col gap-[11px] rounded-[14px] border border-border bg-card p-5">
        <div className="font-mono text-[10.5px] tracking-[0.08em] text-[#55606e] uppercase">Próximas entregas</div>
        {d.prox3.length === 0 && <div className="text-[12.5px] text-muted-foreground">Nada agendado.</div>}
        {d.prox3.map((px) => (
          <div key={px.key} className="flex items-center gap-[9px] text-[12.5px]">
            <span className="size-1.5 flex-none rounded-full" style={{ background: px.cor }} />
            <span className="min-w-0 flex-1 truncate text-[#c9d1dc]">{px.desc}</span>
            <span className="flex-none text-[11px] text-[#55606e]">{px.freela}</span>
            <span className="flex-none font-mono text-[11px] text-muted-foreground">{px.prazoFmt}</span>
          </div>
        ))}
      </div>

      {/* blog & portfolio (span 2) */}
      <div className="col-span-2 flex items-center gap-4 rounded-[14px] border border-border bg-card p-5">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="font-mono text-[10.5px] tracking-[0.08em] text-[#55606e] uppercase">Blog & Portfolio</div>
          <div className="flex items-baseline gap-2">
            <div className="font-mono text-2xl leading-none font-semibold text-foreground">{d.postsN}</div>
            <div className="text-xs text-muted-foreground">
              posts · {d.rascunhosN} rascunho · {d.pfN} no portfolio
            </div>
          </div>
        </div>
        <Link href="/blog" className="flex-none text-[12.5px] font-medium text-primary hover:underline">
          Abrir blog →
        </Link>
      </div>
    </div>
  );
}
