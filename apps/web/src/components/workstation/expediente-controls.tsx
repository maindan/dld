"use client";

import { useEffect, useState, useTransition } from "react";
import { Play, Pause, Square, Check } from "lucide-react";
import {
  startExpedienteAction,
  pausarExpedienteAction,
  retomarExpedienteAction,
  encerrarExpedienteAction,
} from "@/lib/actions/expediente";
import { formatHMS, formatHours } from "@/lib/format";
import type { ExpedienteAtivo, ProjetoOpcao, ExpedienteResumo } from "@/lib/queries/expediente";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function ExpedienteControls({
  expediente,
  projetos,
  resumo,
}: {
  expediente: ExpedienteAtivo | null;
  projetos: ProjetoOpcao[];
  resumo: ExpedienteResumo;
}) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(expediente?.elapsedSeconds ?? 0);

  // The server is the source of truth for elapsed time; this key changes whenever a fresh
  // server snapshot arrives, and only then do we reset the locally-ticking clock to match it.
  const syncKey = expediente ? `${expediente.id}:${expediente.status}:${expediente.tickFromMs}:${expediente.elapsedSeconds}` : null;
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setSeconds(expediente?.elapsedSeconds ?? 0);
  }

  useEffect(() => {
    if (!expediente || expediente.status !== "running") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [expediente]);

  function toggleProjeto(id: string) {
    setSelecionados((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]));
  }

  function projetoInfo(id: string): ProjetoOpcao {
    return projetos.find((p) => p.id === id) ?? { id, nome: id, cor: "#2dd4bf" };
  }

  function handleIniciar() {
    if (selecionados.length === 0) return;
    const escolhidos = selecionados;
    setModalOpen(false);
    setSelecionados([]);
    startTransition(() => startExpedienteAction(escolhidos));
  }

  const status = expediente?.status ?? "idle";

  return (
    <div className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-border bg-card p-5">
      <div className="text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Expediente</div>

      {status === "idle" && (
        <div className="flex flex-1 flex-col gap-3">
          <div className="font-mono text-[40px] leading-none font-semibold text-muted-foreground">00:00:00</div>
          <div className="text-[12.5px] leading-relaxed text-muted-foreground">
            Nenhum expediente ativo. Inicie indicando os projetos em que vai trabalhar.
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-[9px] bg-primary py-2.5 text-[14px] font-semibold text-primary-foreground hover:bg-primary/80"
          >
            <Play size={16} /> Iniciar expediente
          </button>
        </div>
      )}

      {status === "running" && expediente && (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="size-[9px] flex-none animate-pulse rounded-full bg-success" />
            <span className="font-mono text-[40px] leading-none font-semibold text-foreground">{formatHMS(seconds)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {expediente.projetos.map((id) => {
              const p = projetoInfo(id);
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 rounded-[6px] border border-border bg-muted px-2.5 py-1 text-[12px] text-foreground"
                >
                  <span className="size-1.5 flex-none rounded-full" style={{ background: p.cor }} />
                  {p.nome}
                </span>
              );
            })}
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => pausarExpedienteAction(expediente.id))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[9px] bg-muted py-2.5 text-[13px] font-semibold text-foreground hover:bg-muted/70 disabled:opacity-50"
            >
              <Pause size={15} /> Pausar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => encerrarExpedienteAction(expediente.id))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-destructive/35 bg-destructive/10 py-2.5 text-[13px] font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
            >
              <Square size={15} /> Encerrar
            </button>
          </div>
        </div>
      )}

      {status === "paused" && expediente && (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="size-[9px] flex-none rounded-full bg-warning" />
            <span className="font-mono text-[40px] leading-none font-semibold text-muted-foreground">
              {formatHMS(seconds)}
            </span>
          </div>
          <div className="text-[12.5px] text-warning">Expediente em pausa</div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => retomarExpedienteAction(expediente.id))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[9px] bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
            >
              <Play size={15} /> Retomar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => encerrarExpedienteAction(expediente.id))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-destructive/35 bg-destructive/10 py-2.5 text-[13px] font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
            >
              <Square size={15} /> Encerrar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-5 border-t border-border pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[17px] font-semibold text-foreground">
            {formatHours(resumo.hojeSegundos / 3600)}
          </span>
          <span className="text-[11px] text-muted-foreground">hoje</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[17px] font-semibold text-foreground">
            {formatHours(resumo.semanaSegundos / 3600)}
          </span>
          <span className="text-[11px] text-muted-foreground">esta semana</span>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar expediente</DialogTitle>
            <p className="text-[12.5px] text-muted-foreground">Em quais projetos você vai trabalhar?</p>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {projetos.map((p) => {
              const ativo = selecionados.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProjeto(p.id)}
                  className="flex items-center gap-2.5 rounded-[10px] border bg-muted/40 px-3 py-2.5 text-left transition-colors"
                  style={{ borderColor: ativo ? "var(--primary)" : "var(--border)" }}
                >
                  <span
                    className="flex size-[18px] flex-none items-center justify-center rounded-[5px] border-[1.5px] text-primary-foreground"
                    style={{
                      borderColor: ativo ? "var(--primary)" : "var(--muted-foreground)",
                      background: ativo ? "var(--primary)" : "transparent",
                    }}
                  >
                    {ativo && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="size-[7px] flex-none rounded-full" style={{ background: p.cor }} />
                  <span className="text-[13.5px] text-foreground">{p.nome}</span>
                </button>
              );
            })}
          </div>

          <DialogFooter className="sm:flex-row sm:justify-stretch">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-[9px] bg-muted py-2.5 text-center text-[13px] font-medium text-foreground hover:bg-muted/70"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={selecionados.length === 0 || isPending}
              onClick={handleIniciar}
              className="flex-[2] rounded-[9px] bg-primary py-2.5 text-center text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
            >
              Começar a trabalhar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
