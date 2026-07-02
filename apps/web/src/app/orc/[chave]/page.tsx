import { notFound } from "next/navigation";
import { Terminal } from "lucide-react";
import { getOrcamentoPorChave } from "@/lib/queries/public";
import { formatBRL, formatDateLong } from "@/lib/format";
import { StatusBadge } from "@/components/freelas/status-badge";
import { AprovarOrcamentoButton } from "@/components/public/aprovar-orcamento-button";

export default async function OrcamentoPublicoPage({ params }: { params: Promise<{ chave: string }> }) {
  const { chave } = await params;
  const orcamento = await getOrcamentoPorChave(chave);
  if (!orcamento) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6 [background:radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(129,140,248,0.1),transparent)]">
      <div className="flex w-full max-w-[520px] flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
            <Terminal size={17} />
          </div>
          <div className="font-mono text-[16px] font-semibold">
            <span className="text-primary">~/</span>{orcamento.freelaNome}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-mono text-[11px] text-muted-foreground">
                ORC-{String(orcamento.numero).padStart(3, "0")}
              </div>
              <div className="text-[18px] font-semibold text-[#e6eaf0]">{orcamento.titulo}</div>
              <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                {formatDateLong(orcamento.data)}
                {orcamento.prazoExec && ` · prazo de execução: ${orcamento.prazoExec}`}
              </div>
            </div>
            <StatusBadge status={orcamento.status} />
          </div>

          <div className="flex flex-col gap-1 border-t border-border pt-3">
            {orcamento.itens.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 py-1.5 text-[13px]">
                <span className="min-w-0 flex-1 truncate text-[#c9d1dc]">
                  {item.desc}
                  {item.tempo && <span className="text-muted-foreground"> · {item.tempo}</span>}
                </span>
                {item.valor > 0 && <span className="font-mono text-muted-foreground">{formatBRL(item.valor)}</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-[13px] text-muted-foreground">Valor total</span>
            <span className="font-mono text-[19px] font-semibold text-[#e6eaf0]">{formatBRL(orcamento.valor)}</span>
          </div>

          {orcamento.status === "enviado" && <AprovarOrcamentoButton chave={chave} />}
          {orcamento.status !== "enviado" && orcamento.status !== "recusado" && orcamento.aprovadoEm && (
            <div className="rounded-[9px] bg-success/10 px-4 py-2.5 text-center text-[12.5px] font-semibold text-success">
              Aprovado em {formatDateLong(orcamento.aprovadoEm.toISOString().slice(0, 10))}
            </div>
          )}
          {orcamento.status === "recusado" && (
            <div className="rounded-[9px] bg-destructive/10 px-4 py-2.5 text-center text-[12.5px] font-semibold text-destructive">
              Orçamento recusado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
