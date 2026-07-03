import { notFound } from "next/navigation";
import { Terminal } from "lucide-react";
import { getOrcamentoPorChave } from "@/lib/queries/public";
import { formatBRL, formatDateExtenso } from "@/lib/format";
import { PROVIDER_INFO } from "@/lib/provider-info";
import { StatusBadge } from "@/components/freelas/status-badge";
import { AprovarOrcamentoButton } from "@/components/public/aprovar-orcamento-button";
import { BaixarPdfButton } from "@/components/public/baixar-pdf-button";

export default async function OrcamentoPublicoPage({ params }: { params: Promise<{ chave: string }> }) {
  const { chave } = await params;
  const orcamento = await getOrcamentoPorChave(chave);
  if (!orcamento) notFound();

  const metade = orcamento.valor / 2;
  const referencia =
    orcamento.freelaResumo || `prestação de serviço de desenvolvimento e manutenção de sites e sistemas`;

  return (
    <div className="flex flex-1 justify-center overflow-y-auto p-6 print:overflow-visible print:p-0 [background:radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(129,140,248,0.1),transparent)] print:[background:none]">
      <div className="flex w-full max-w-[720px] flex-col gap-5 print:max-w-none print:gap-0">
        <div className="flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex size-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
              <Terminal size={15} />
            </div>
            <div className="font-mono text-[14px] font-semibold">
              <span className="text-primary">~/</span>{orcamento.freelaNome}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={orcamento.status} />
            <BaixarPdfButton />
          </div>
        </div>

        {/* The document itself — this block is what prints. */}
        <div className="dl-orc-doc flex flex-col gap-4 rounded-[14px] border border-border bg-card p-8 text-[13.5px] leading-relaxed text-[#c9d1dc] print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black">
          <h1 className="text-center text-[19px] font-semibold text-[#e6eaf0] print:text-black">Orçamento de Preço</h1>

          <div className="flex flex-col gap-0.5">
            <div className="font-semibold text-[#e6eaf0] print:text-black">{PROVIDER_INFO.nome}</div>
            <div>
              <strong className="text-[#e6eaf0] print:text-black">E-mail</strong>: {PROVIDER_INFO.email}
            </div>
            <div>
              <strong className="text-[#e6eaf0] print:text-black">Telefone</strong>: {PROVIDER_INFO.telefone}
            </div>
          </div>

          <p>
            Orçamento destinado à{" "}
            <strong className="text-[#e6eaf0] print:text-black">{orcamento.clienteNome}</strong>, referente a{" "}
            {referencia}.
          </p>

          <div className="font-semibold text-[#e6eaf0] print:text-black">Descrição do serviço:</div>

          <div className="flex flex-col gap-4">
            {orcamento.itens.length === 0 && (
              <div className="text-muted-foreground italic">Nenhum item cadastrado neste orçamento.</div>
            )}
            {orcamento.itens.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="font-semibold text-[#e6eaf0] print:text-black">
                  {item.desc}
                  {item.link && (
                    <>
                      {" ("}
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary underline print:text-black">
                        {item.link}
                      </a>
                      {")"}
                    </>
                  )}
                </div>
                {item.bullets.length > 0 && (
                  <ul className="list-disc pl-6">
                    {item.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {item.valor > 0 && (
                  <div className="text-right font-semibold text-[#e6eaf0] print:text-black">
                    Valor {formatBRL(item.valor)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 font-semibold text-[#e6eaf0] print:text-black">
            <div>
              Valor total: {formatBRL(orcamento.valor)} (esse valor já inclui as retenções e os recolhimentos
              previstos em lei)
            </div>
            <div>
              Forma de Pagamento: 50% ({formatBRL(metade)}) na aprovação do orçamento e 50% ({formatBRL(metade)}) na
              entrega do serviço.
            </div>
          </div>

          <hr className="border-border print:border-black/30" />

          <p className="text-[12.5px] text-muted-foreground print:text-black">{orcamento.termos}</p>

          <p>
            {PROVIDER_INFO.cidade}, {formatDateExtenso(orcamento.data)}.
          </p>
        </div>

        <div className="flex flex-col gap-3 print:hidden">
          {orcamento.status === "enviado" && <AprovarOrcamentoButton chave={chave} />}
          {orcamento.status !== "enviado" && orcamento.status !== "recusado" && orcamento.aprovadoEm && (
            <div className="rounded-[9px] bg-success/10 px-4 py-2.5 text-center text-[12.5px] font-semibold text-success">
              Aprovado em {formatDateExtenso(orcamento.aprovadoEm.toISOString().slice(0, 10))}
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
