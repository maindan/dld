import { notFound } from "next/navigation";
import { Terminal, Check, Clock } from "lucide-react";
import { getCronogramaPorChave } from "@/lib/queries/public";
import { formatDateLong } from "@/lib/format";

export default async function CronogramaPublicoPage({ params }: { params: Promise<{ chave: string }> }) {
  const { chave } = await params;
  const cronograma = await getCronogramaPorChave(chave);
  if (!cronograma) notFound();

  return (
    <div className="flex flex-1 justify-center p-6 [background:radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(129,140,248,0.1),transparent)]">
      <div className="flex w-full max-w-[560px] flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
            <Terminal size={17} />
          </div>
          <div className="font-mono text-[16px] font-semibold">
            <span className="text-primary">~/</span>{cronograma.freelaNome}
          </div>
        </div>

        {cronograma.resumo && <p className="text-[13px] text-muted-foreground">{cronograma.resumo}</p>}

        <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5">
          <div className="flex flex-col gap-1.5">
            <div className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Cronograma</div>
            <div className="flex items-center gap-2.5">
              <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-success"
                  style={{ width: `${cronograma.pct}%` }}
                />
              </div>
              <span className="flex-none font-mono text-[11.5px] text-success">{cronograma.pct}%</span>
            </div>
          </div>
          {cronograma.itens.length === 0 ? (
            <div className="py-8 text-center text-[12.5px] text-muted-foreground">
              Nenhum item com prazo definido ainda.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {cronograma.itens.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-[9px] px-2 py-2.5">
                  <span
                    className="flex size-6 flex-none items-center justify-center rounded-full"
                    style={{
                      color: item.done ? "#34d399" : "#fbbf24",
                      background: item.done ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
                    }}
                  >
                    {item.done ? <Check size={13} /> : <Clock size={13} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[13px]"
                      style={{ color: item.done ? "#55606e" : "#c9d1dc" }}
                    >
                      {item.desc}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">{item.orcamentoTitulo}</span>
                  </span>
                  <span className="flex-none font-mono text-[11.5px] text-muted-foreground">
                    {formatDateLong(item.prazo)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
