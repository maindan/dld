"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Plus, Send, Trash2 } from "lucide-react";
import {
  enviarOrcamentoAction,
  registrarPagamentoAction,
  createOrcamentoItemAction,
  deleteOrcamentoItemAction,
} from "@/lib/actions/freelas";
import { toggleOrcamentoItemAction } from "@/lib/actions/tasks";
import { StatusBadge } from "./status-badge";
import { formatBRL, formatDateShort } from "@/lib/format";
import type { OrcamentoView } from "@/lib/queries/freelas";

export function OrcamentoCard({ freelaId, orcamento }: { freelaId: string; orcamento: OrcamentoView }) {
  const [, startTransition] = useTransition();
  const [pagamento, setPagamento] = useState("");
  const [copiado, setCopiado] = useState(false);
  const restante = orcamento.valor - orcamento.pago;

  function copiarLink() {
    const url = `${window.location.origin}/orc/${orcamento.chave}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  function registrarPagamento() {
    const valor = Number(pagamento);
    if (!(valor > 0)) return;
    setPagamento("");
    startTransition(() => registrarPagamentoAction(freelaId, orcamento.id, valor));
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
        {(orcamento.status === "aprovado" || orcamento.status === "pago_parcial") && restante > 0 && (
          <span className="flex items-center gap-1.5">
            <input
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
              type="number"
              min="0.01"
              step="0.01"
              placeholder={`até ${formatBRL(restante)}`}
              className="w-[130px] rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
            />
            <button
              onClick={registrarPagamento}
              className="rounded-[8px] bg-success px-3 py-1.5 text-[12px] font-semibold text-background"
            >
              Registrar pagamento
            </button>
          </span>
        )}
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
            >
              {item.desc}
              {item.tempo && <span className="text-muted-foreground"> · {item.tempo}</span>}
            </span>
            {item.prazo && (
              <span className="flex-none font-mono text-[11px] text-muted-foreground">
                {formatDateShort(item.prazo)}
              </span>
            )}
            {item.valor > 0 && (
              <span className="flex-none font-mono text-[11px] text-muted-foreground">{formatBRL(item.valor)}</span>
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
        action={(fd) => startTransition(() => createOrcamentoItemAction(freelaId, orcamento.id, fd))}
        className="flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="ordem" value={orcamento.itens.length} />
        <input
          name="desc"
          required
          placeholder="Novo item..."
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
          type="submit"
          className="flex items-center gap-1 rounded-[8px] border border-dashed border-[#303a47] px-2.5 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-[#e6eaf0]"
        >
          <Plus size={13} /> item
        </button>
      </form>
    </div>
  );
}
