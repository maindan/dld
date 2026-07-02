import { Users, Wallet, FileClock, AlertTriangle, Clock3 } from "lucide-react";
import { getDashboardOverview } from "@/lib/queries/dashboard";
import { formatBRL, formatHours } from "@/lib/format";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-border bg-card p-4">
      <span
        className="flex size-10 flex-none items-center justify-center rounded-[10px]"
        style={{ color: accent, background: `${accent}1f` }}
      >
        <Icon size={19} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[19px] font-semibold text-[#e6eaf0]">{value}</span>
        <span className="truncate text-[12px] text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

export default async function InicioPage() {
  const overview = await getDashboardOverview();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Users} label="Freelas ativos" value={String(overview.freelasAtivos)} accent="#818cf8" />
        <StatCard icon={Wallet} label="A receber" value={formatBRL(overview.aReceber)} accent="#34d399" />
        <StatCard
          icon={FileClock}
          label="Aguardando aprovação"
          value={String(overview.orcamentosPendentesAprovacao)}
          accent="#fbbf24"
        />
        <StatCard
          icon={AlertTriangle}
          label="Tasks atrasadas"
          value={String(overview.tasksAtrasadas)}
          accent="#f87171"
        />
        <StatCard icon={Clock3} label="Horas essa semana" value={formatHours(overview.horasSemana)} accent="#2dd4bf" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] border border-border bg-card p-4">
          <div className="mb-3 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
            Próximos prazos
          </div>
          {overview.proximosPrazos.length === 0 && (
            <div className="py-6 text-center text-[12.5px] text-muted-foreground">Nada nos próximos dias.</div>
          )}
          <div className="flex flex-col gap-1">
            {overview.proximosPrazos.map((p) => (
              <div
                key={p.key}
                className="flex items-center justify-between gap-2 rounded-[9px] px-2.5 py-2 hover:bg-[#1b222c]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[#c9d1dc]">{p.titulo}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{p.sub}</span>
                </span>
                <span className="flex-none font-mono text-[11.5px] text-muted-foreground">{p.prazo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-border bg-card p-4">
          <div className="mb-3 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Metas</div>
          {overview.metas.length === 0 && (
            <div className="py-6 text-center text-[12.5px] text-muted-foreground">Nenhuma meta cadastrada.</div>
          )}
          <div className="flex flex-col gap-3.5">
            {overview.metas.map((m) => (
              <div key={m.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="truncate text-[#c9d1dc]">{m.titulo}</span>
                  <span className="flex-none font-mono text-muted-foreground">
                    {formatBRL(m.arrecadado)} / {formatBRL(m.valor)}
                  </span>
                </div>
                <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#1b222c]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#818cf8] to-[#34d399]"
                    style={{ width: `${Math.round(m.progresso * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
