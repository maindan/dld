"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronUp, Copy, FileCheck2, Plus, Send, Trash2 } from "lucide-react";
import {
  enviarOrcamentoAction,
  registrarParcelaPagamentoAction,
  createOrcamentoItemAction,
  deleteOrcamentoItemAction,
  updateParcelaImpostosAction,
  updateOrcamentoTermosAction,
} from "@/lib/actions/freelas";
import { toggleOrcamentoItemAction } from "@/lib/actions/tasks";
import { StatusBadge } from "./status-badge";
import { formatBRL, formatDateShort } from "@/lib/format";
import type { OrcamentoView, ParcelaView } from "@/lib/queries/freelas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PARCELA_LABEL: Record<ParcelaView["tipo"], string> = {
  aprovacao: "Aprovação (50%)",
  entrega: "Entrega (50%)",
};

function podeConfirmarParcela(orcamento: OrcamentoView, parcela: ParcelaView): boolean {
  if (parcela.pago) return false;
  if (parcela.tipo === "aprovacao") return orcamento.status === "aprovado";
  const aprovacao = orcamento.parcelas.find((p) => p.tipo === "aprovacao");
  return !!aprovacao?.pago;
}

function ConfirmarParcelaDialog({
  freelaId,
  orcamentoTitulo,
  parcela,
  open,
  onOpenChange,
}: {
  freelaId: string;
  orcamentoTitulo: string;
  parcela: ParcelaView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, startTransition] = useTransition();

  function confirmar() {
    if (!parcela) return;
    startTransition(() => registrarParcelaPagamentoAction(freelaId, parcela.id));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar recebimento</DialogTitle>
        </DialogHeader>
        {parcela && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-[12.5px] leading-relaxed text-muted-foreground">
                {orcamentoTitulo} · {PARCELA_LABEL[parcela.tipo]}
              </div>
              <div className="text-[12px] leading-relaxed text-muted-foreground">
                {parcela.tipo === "aprovacao"
                  ? "Ao confirmar, as atividades entram no cronograma do projeto."
                  : "Ao confirmar, o orçamento é marcado como pago integralmente."}
              </div>
            </div>
            <button
              type="button"
              onClick={confirmar}
              className="flex items-center justify-between gap-2.5 rounded-[10px] border border-border bg-[#11151c] px-3.5 py-3 text-left transition-colors hover:border-success"
            >
              <span className="text-[13.5px] font-medium">Confirmar {formatBRL(parcela.valor)}</span>
              <Check size={16} className="text-success" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Inputs are uncontrolled (defaultValue + key on the server value) instead of
 * controlled state synced via useEffect — that pattern causes cascading
 * renders. Keying on the server value re-mounts the input (picking up the
 * fresh default) whenever a save round-trips, while typing in between never
 * changes the key and so never gets clobbered mid-edit.
 */
function ParcelaRow({
  freelaId,
  orcamento,
  parcela,
  onConfirmar,
}: {
  freelaId: string;
  orcamento: OrcamentoView;
  parcela: ParcelaView;
  onConfirmar: (parcela: ParcelaView) => void;
}) {
  const [, startTransition] = useTransition();

  function salvar(patch: Partial<{ faturado: boolean; impostoNf: string; retencao: string }>) {
    const fd = new FormData();
    fd.set("faturado", String(patch.faturado ?? parcela.faturado));
    fd.set("percentualImpostoNf", patch.impostoNf ?? String(parcela.percentualImpostoNf));
    fd.set("percentualRetencaoCliente", patch.retencao ?? String(parcela.percentualRetencaoCliente));
    startTransition(() => updateParcelaImpostosAction(freelaId, parcela.id, fd));
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[8px] bg-[#11151c] px-2.5 py-2 text-[11.5px]">
      <div className="flex min-w-[150px] flex-none items-center gap-2">
        <span className={parcela.pago ? "text-success" : "text-muted-foreground"}>
          {parcela.pago ? <Check size={13} className="inline" /> : null} {PARCELA_LABEL[parcela.tipo]}
        </span>
        <span className="font-mono text-[11px] text-[#c9d1dc]">{formatBRL(parcela.valor)}</span>
      </div>
      <button
        type="button"
        onClick={() => salvar({ faturado: !parcela.faturado })}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold"
        style={{
          color: parcela.faturado ? "#34d399" : "#8b96a5",
          background: parcela.faturado ? "#34d39920" : "#8b96a520",
        }}
      >
        <FileCheck2 size={12} /> {parcela.faturado ? "Faturado (NF emitida)" : "Marcar como faturado"}
      </button>
      <label className="flex items-center gap-1.5 text-muted-foreground">
        Imposto na emissão
        <input
          key={`imposto-${parcela.id}-${parcela.percentualImpostoNf}`}
          defaultValue={parcela.percentualImpostoNf}
          onBlur={(e) => salvar({ impostoNf: e.target.value })}
          type="number"
          min="0"
          max="100"
          step="0.1"
          className="w-[52px] rounded-[6px] border border-border bg-[#0e1116] px-1.5 py-1 text-center font-mono text-[11px] outline-none focus:border-primary"
        />
        %
      </label>
      <label className="flex items-center gap-1.5 text-muted-foreground">
        Retenção do cliente
        <input
          key={`retencao-${parcela.id}-${parcela.percentualRetencaoCliente}`}
          defaultValue={parcela.percentualRetencaoCliente}
          onBlur={(e) => salvar({ retencao: e.target.value })}
          type="number"
          min="0"
          max="100"
          step="0.1"
          className="w-[52px] rounded-[6px] border border-border bg-[#0e1116] px-1.5 py-1 text-center font-mono text-[11px] outline-none focus:border-primary"
        />
        %
      </label>
      <div className="ml-auto flex items-center gap-2.5">
        <span className="font-mono text-[12px]" style={{ color: "#c9d1dc" }}>
          líquido {formatBRL(parcela.valorLiquido)}
        </span>
        {podeConfirmarParcela(orcamento, parcela) && (
          <button
            type="button"
            onClick={() => onConfirmar(parcela)}
            className="flex items-center gap-1 rounded-[7px] bg-warning px-2.5 py-1 text-[11px] font-semibold text-background"
          >
            <Check size={12} /> Confirmar
          </button>
        )}
      </div>
    </div>
  );
}

export function OrcamentoCard({ freelaId, orcamento }: { freelaId: string; orcamento: OrcamentoView }) {
  const [, startTransition] = useTransition();
  const [copiado, setCopiado] = useState(false);
  const [parcelaConfirmando, setParcelaConfirmando] = useState<ParcelaView | null>(null);
  const [showNovoDetalhado, setShowNovoDetalhado] = useState(false);
  const [showTermos, setShowTermos] = useState(false);

  function copiarLink() {
    const url = `${window.location.origin}/orc/${orcamento.chave}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              ORC-{String(orcamento.numero).padStart(3, "0")}
            </span>
            <StatusBadge status={orcamento.status} />
          </div>
          <div className="mt-0.5 text-[14.5px] font-semibold text-[#e6eaf0]">{orcamento.titulo}</div>
          <div className="text-[11.5px] text-muted-foreground">
            {formatDateShort(orcamento.data)}
            {orcamento.prazoExec && ` · prazo: ${orcamento.prazoExec}`}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[15px] font-semibold text-[#e6eaf0]">{formatBRL(orcamento.valor)}</span>
          {orcamento.pago > 0 && (
            <span className="font-mono text-[11.5px] text-success">recebido {formatBRL(orcamento.pago)}</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {orcamento.status === "rascunho" && (
          <button
            onClick={() => startTransition(() => enviarOrcamentoAction(freelaId, orcamento.id))}
            className="flex items-center gap-1.5 rounded-[8px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
          >
            <Send size={13} /> Enviar
          </button>
        )}
        <button
          onClick={copiarLink}
          className="flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-[#e6eaf0]"
        >
          <Copy size={13} /> {copiado ? "Copiado!" : "Link do orçamento"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {orcamento.parcelas.map((parcela) => (
          <ParcelaRow
            key={parcela.id}
            freelaId={freelaId}
            orcamento={orcamento}
            parcela={parcela}
            onConfirmar={setParcelaConfirmando}
          />
        ))}
      </div>

      <div className="flex flex-col gap-0.5 border-t border-border pt-2">
        {orcamento.itens.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 hover:bg-[#1b222c]">
            <button
              onClick={() =>
                startTransition(() => toggleOrcamentoItemAction(item.id, !item.done))
              }
              className="flex size-[18px] flex-none items-center justify-center rounded-[6px] border"
              style={{
                borderColor: item.done ? "#34d399" : "#303a47",
                background: item.done ? "#34d399" : "transparent",
              }}
            >
              {item.done && <Check size={11} className="text-background" />}
            </button>
            <span
              className="min-w-0 flex-1 truncate text-[12.5px]"
              style={{ color: item.done ? "#55606e" : "#c9d1dc", textDecoration: item.done ? "line-through" : "none" }}
              title={item.bullets.length > 0 ? item.bullets.join("\n") : undefined}
            >
              {item.desc}
              {item.tempo && <span className="text-muted-foreground"> · {item.tempo}</span>}
              {item.link && <span className="text-primary"> · link</span>}
              {item.bullets.length > 0 && (
                <span className="text-muted-foreground"> · {item.bullets.length} detalhe(s)</span>
              )}
            </span>
            {item.prazo && (
              <span className="flex-none font-mono text-[11px] text-muted-foreground">
                {formatDateShort(item.prazo)}
              </span>
            )}
            <button
              onClick={() => startTransition(() => deleteOrcamentoItemAction(freelaId, item.id))}
              className="flex-none p-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <form
        action={(fd) => {
          startTransition(() => createOrcamentoItemAction(freelaId, orcamento.id, fd));
          setShowNovoDetalhado(false);
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="ordem" value={orcamento.itens.length} />
        <div className="flex flex-wrap items-center gap-2">
          <input
            name="desc"
            required
            placeholder="Novo item... (título do grupo no orçamento)"
            className="min-w-[140px] flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
          />
          <input
            name="tempo"
            placeholder="tempo"
            className="w-[80px] rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
          />
          <input
            name="valor"
            type="number"
            min="0"
            step="0.01"
            placeholder="R$"
            className="w-[90px] rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
          />
          <input
            name="prazo"
            type="date"
            className="rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] text-muted-foreground outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowNovoDetalhado((v) => !v)}
            className="flex items-center gap-1 rounded-[8px] border border-border px-2 py-1.5 text-[12px] text-muted-foreground hover:text-[#e6eaf0]"
          >
            {showNovoDetalhado ? <ChevronUp size={13} /> : <ChevronDown size={13} />} link/detalhes
          </button>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-[8px] border border-dashed border-[#303a47] px-2.5 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-[#e6eaf0]"
          >
            <Plus size={13} /> item
          </button>
        </div>
        {showNovoDetalhado && (
          <div className="flex flex-col gap-2 rounded-[8px] bg-[#11151c] p-2.5">
            <input
              name="link"
              placeholder="Link (opcional) — ex.: https://site-do-cliente.com.br"
              className="rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
            />
            <textarea
              name="bullets"
              rows={3}
              placeholder={"Detalhes do escopo, um por linha:\n- Criação de protótipo no Figma\n- Aplicação do design no site"}
              className="resize-y rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
            />
          </div>
        )}
      </form>

      <div className="border-t border-border pt-2.5">
        <button
          type="button"
          onClick={() => setShowTermos((v) => !v)}
          className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-[#e6eaf0]"
        >
          {showTermos ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Termos exibidos no orçamento público
        </button>
        {showTermos && (
          <form
            action={(fd) =>
              startTransition(() =>
                updateOrcamentoTermosAction(freelaId, orcamento.id, String(fd.get("termos") ?? "")),
              )
            }
            className="mt-2 flex flex-col gap-2"
          >
            <textarea
              name="termos"
              defaultValue={orcamento.termos}
              rows={4}
              className="resize-y rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-2 text-[12px] leading-relaxed outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="w-fit rounded-[8px] bg-[#222b36] px-3 py-1.5 text-[12px] font-medium text-[#c9d1dc] hover:bg-[#2a3441]"
            >
              Salvar termos
            </button>
          </form>
        )}
      </div>

      <ConfirmarParcelaDialog
        freelaId={freelaId}
        orcamentoTitulo={orcamento.titulo}
        parcela={parcelaConfirmando}
        open={!!parcelaConfirmando}
        onOpenChange={(open) => !open && setParcelaConfirmando(null)}
      />
    </div>
  );
}
