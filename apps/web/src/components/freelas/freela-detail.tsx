"use client";

import { useState, useTransition } from "react";
import { Copy, Plus } from "lucide-react";
import {
  createOrcamentoAction,
  createObservacaoAction,
  createReuniaoAction,
  createContratoAction,
  toggleContratoStatusAction,
} from "@/lib/actions/freelas";
import { OrcamentoCard } from "./orcamento-card";
import { formatDateShort } from "@/lib/format";
import type { FreelaDetail as FreelaDetailData } from "@/lib/queries/freelas";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4">
      <div className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{title}</div>
      {children}
    </div>
  );
}

export function FreelaDetail({ freela }: { freela: FreelaDetailData }) {
  const [, startTransition] = useTransition();
  const [copiado, setCopiado] = useState(false);
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false);

  function copiarCronograma() {
    const url = `${window.location.origin}/cronograma/${freela.chaveCrono}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-[12px] border border-border bg-card p-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="size-3 flex-none rounded-full" style={{ background: freela.cor }} />
            <span className="text-[17px] font-semibold text-[#e6eaf0]">{freela.nome}</span>
          </div>
          <div className="mt-1 text-[12.5px] text-muted-foreground">
            {freela.clienteNome}
            {freela.clienteEmail && ` · ${freela.clienteEmail}`}
            {freela.clienteWhatsapp && ` · ${freela.clienteWhatsapp}`}
          </div>
          {freela.resumo && <div className="mt-2 max-w-[520px] text-[12.5px] text-[#c9d1dc]">{freela.resumo}</div>}
        </div>
        <button
          onClick={copiarCronograma}
          className="flex flex-none items-center gap-1.5 rounded-[9px] border border-border px-3 py-2 text-[12.5px] text-muted-foreground hover:border-primary hover:text-[#e6eaf0]"
        >
          <Copy size={14} /> {copiado ? "Copiado!" : "Link do cronograma"}
        </button>
      </div>

      <Card title="Orçamentos">
        {showNovoOrcamento ? (
          <form
            action={(fd) => {
              startTransition(() => createOrcamentoAction(freela.id, fd));
              setShowNovoOrcamento(false);
            }}
            className="flex flex-wrap items-center gap-2 rounded-[9px] border border-border bg-[#0e1116] p-3"
          >
            <input
              name="titulo"
              required
              placeholder="Título do orçamento"
              className="min-w-[160px] flex-1 rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
            <input
              name="valor"
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="Valor (R$)"
              className="w-[130px] rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
            <input
              name="data"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] text-muted-foreground outline-none focus:border-primary"
            />
            <input
              name="prazoExec"
              placeholder="prazo de execução"
              className="w-[140px] rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-[8px] bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground">
              Criar
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowNovoOrcamento(true)}
            className="flex items-center gap-1.5 self-start text-[12.5px] text-primary"
          >
            <Plus size={14} /> Novo orçamento
          </button>
        )}

        {freela.orcamentos.length === 0 ? (
          <div className="py-4 text-center text-[12.5px] text-muted-foreground">Nenhum orçamento ainda.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {freela.orcamentos.map((o) => (
              <OrcamentoCard key={o.id} freelaId={freela.id} orcamento={o} />
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Observações">
          <form
            action={(fd) => startTransition(() => createObservacaoAction(freela.id, fd))}
            className="flex items-center gap-2"
          >
            <input
              name="texto"
              required
              placeholder="Nova observação..."
              className="flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-[8px] bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground">
              +
            </button>
          </form>
          <div className="flex flex-col gap-1.5">
            {freela.observacoes.length === 0 && (
              <div className="py-2 text-center text-[12px] text-muted-foreground">Nada por aqui.</div>
            )}
            {freela.observacoes.map((o) => (
              <div key={o.id} className="rounded-[8px] bg-[#1b222c] px-2.5 py-2 text-[12.5px] text-[#c9d1dc]">
                <span className="mr-2 font-mono text-[11px] text-muted-foreground">{formatDateShort(o.data)}</span>
                {o.texto}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Reuniões">
          <form
            action={(fd) => startTransition(() => createReuniaoAction(freela.id, fd))}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <input
                name="titulo"
                required
                placeholder="Título da reunião"
                className="flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
              />
              <input
                name="data"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] text-muted-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                name="topicos"
                placeholder="tópicos, separados por vírgula"
                className="flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
              />
              <button type="submit" className="rounded-[8px] bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground">
                +
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-1.5">
            {freela.reunioes.length === 0 && (
              <div className="py-2 text-center text-[12px] text-muted-foreground">Nenhuma reunião ainda.</div>
            )}
            {freela.reunioes.map((r) => (
              <div key={r.id} className="rounded-[8px] bg-[#1b222c] px-2.5 py-2 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#c9d1dc]">{r.titulo}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{formatDateShort(r.data)}</span>
                </div>
                {r.topicos.length > 0 && (
                  <div className="mt-1 text-[11.5px] text-muted-foreground">{r.topicos.join(" · ")}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Contratos">
        <form
          action={(fd) => startTransition(() => createContratoAction(freela.id, fd))}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            name="titulo"
            required
            placeholder="Título do contrato"
            className="min-w-[160px] flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
          />
          <input
            name="tipo"
            placeholder="tipo"
            className="w-[140px] rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
          />
          <input
            name="data"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] text-muted-foreground outline-none focus:border-primary"
          />
          <button type="submit" className="rounded-[8px] bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground">
            Adicionar
          </button>
        </form>
        <div className="flex flex-col gap-1.5">
          {freela.contratos.length === 0 && (
            <div className="py-2 text-center text-[12px] text-muted-foreground">Nenhum contrato ainda.</div>
          )}
          {freela.contratos.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-[8px] bg-[#1b222c] px-2.5 py-2 text-[12.5px]">
              <span className="min-w-0 flex-1 truncate text-[#c9d1dc]">
                {c.titulo}
                {c.tipo && <span className="text-muted-foreground"> · {c.tipo}</span>}
              </span>
              <span className="flex-none font-mono text-[11px] text-muted-foreground">{formatDateShort(c.data)}</span>
              <button
                onClick={() =>
                  startTransition(() => toggleContratoStatusAction(freela.id, c.id, c.status !== "assinado"))
                }
                className="flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  color: c.status === "assinado" ? "#34d399" : "#fbbf24",
                  background: c.status === "assinado" ? "#34d39920" : "#fbbf2420",
                }}
              >
                {c.status === "assinado" ? "Assinado" : "Pendente"}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
