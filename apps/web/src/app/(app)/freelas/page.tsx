import Link from "next/link";
import { Users2 } from "lucide-react";
import { getFreelasListView } from "@/lib/queries/freelas-list";
import { getClientesList } from "@/lib/queries/clientes";
import { CreateFreelaForm } from "@/components/freelas/create-freela-form";
import { formatBRL, formatDateShort } from "@/lib/format";

function proxPrazoCor(proxAtrasado: boolean, proxPrazo: string | null): string {
  if (proxAtrasado) return "#f87171";
  if (proxPrazo) {
    const dias = (new Date(proxPrazo).getTime() - new Date(new Date().toISOString().slice(0, 10)).getTime()) / 86_400_000;
    if (dias <= 3) return "#fbbf24";
  }
  return "#8b96a5";
}

export default async function FreelasPage() {
  const [{ freelas: freelasList, recebidoTotal, aReceberTotal }, clientesList] = await Promise.all([
    getFreelasListView(),
    getClientesList(),
  ]);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[160px] flex-1 text-[12.5px] text-muted-foreground">
          Seus projetos de freela, orçamentos e cronogramas.
        </div>
        <div className="flex gap-4 text-[12px]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-semibold text-success">{formatBRL(recebidoTotal)}</span>
            <span className="text-[#55606e]">recebido</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-semibold text-[#c9d1dc]">{formatBRL(aReceberTotal)}</span>
            <span className="text-[#55606e]">a receber</span>
          </div>
        </div>
        <Link
          href="/freelas/clientes"
          className="flex flex-none items-center gap-1.5 self-start rounded-[9px] border border-border bg-card px-3.5 py-2 text-[13px] text-muted-foreground hover:border-[#3a4553] hover:text-[#e6eaf0]"
        >
          <Users2 size={15} /> Gerenciar clientes
        </Link>
        <CreateFreelaForm existingCount={freelasList.length} clientes={clientesList} />
      </div>

      {freelasList.length === 0 ? (
        <div className="rounded-[14px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhum freela cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {freelasList.map((f) => (
            <Link
              key={f.id}
              href={`/freelas/${f.id}`}
              className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-[18px] hover:border-[#3a4553]"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex size-9 flex-none items-center justify-center rounded-full font-mono text-[14px] font-bold text-background"
                  style={{ background: f.cor }}
                >
                  {f.inicial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-semibold text-[#e6eaf0]">{f.nome}</div>
                  <div className="truncate text-[11.5px] text-muted-foreground">
                    {f.tipo || "Sem tipo"} · {f.clienteNome}
                  </div>
                </div>
              </div>

              <div className="flex gap-[18px]">
                <div className="flex flex-col gap-px">
                  <span className="font-mono text-[14px] font-semibold text-success">{formatBRL(f.recebido)}</span>
                  <span className="text-[10.5px] text-[#55606e]">recebido</span>
                </div>
                <div className="flex flex-col gap-px">
                  <span className="font-mono text-[14px] font-semibold text-[#c9d1dc]">{formatBRL(f.aReceber)}</span>
                  <span className="text-[10.5px] text-[#55606e]">a receber</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[#1f2733] pt-2.5 text-[12px]">
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {f.proxima ? `→ ${f.proxima}` : "Sem próxima entrega"}
                </span>
                {f.proxPrazo && (
                  <span
                    className="flex-none font-mono text-[11px]"
                    style={{ color: proxPrazoCor(f.proxAtrasado, f.proxPrazo) }}
                  >
                    {formatDateShort(f.proxPrazo)}
                  </span>
                )}
              </div>

              <div className="font-mono text-[10.5px] text-[#55606e]">
                {f.orcamentosAbertos} orçamento{f.orcamentosAbertos === 1 ? "" : "s"} ativo{f.orcamentosAbertos === 1 ? "" : "s"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
