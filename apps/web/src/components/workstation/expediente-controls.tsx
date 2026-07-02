"use client";

import { useEffect, useState, useTransition } from "react";
import { Play, Pause, Square } from "lucide-react";
import {
  startExpedienteAction,
  pausarExpedienteAction,
  retomarExpedienteAction,
  encerrarExpedienteAction,
} from "@/lib/actions/expediente";
import { formatHMS, formatHours } from "@/lib/format";
import type { ExpedienteAtivo, ProjetoOpcao, ExpedienteHistorico } from "@/lib/queries/expediente";

export function ExpedienteControls({
  expediente,
  projetos,
  historico,
}: {
  expediente: ExpedienteAtivo | null;
  projetos: ProjetoOpcao[];
  historico: ExpedienteHistorico[];
}) {
  const [, startTransition] = useTransition();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(expediente?.elapsedSeconds ?? 0);

  const syncKey = expediente ? `${expediente.id}:${expediente.tickFromMs}:${expediente.elapsedSeconds}` : null;
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

  function nomeProjeto(id: string) {
    return projetos.find((p) => p.id === id)?.nome ?? id;
  }

  return (
    <div className="flex flex-col gap-4 rounded-[12px] border border-border bg-card p-4">
      {!expediente ? (
        <>
          <div className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
            Iniciar expediente
          </div>
          <div className="flex flex-wrap gap-2">
            {projetos.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleProjeto(p.id)}
                className="rounded-full border px-3 py-1.5 text-[12.5px]"
                style={{
                  borderColor: selecionados.includes(p.id) ? "#818cf8" : "#262e39",
                  background: selecionados.includes(p.id) ? "rgba(129,140,248,0.12)" : "transparent",
                  color: selecionados.includes(p.id) ? "#c9d1dc" : "#8b96a5",
                }}
              >
                {p.nome}
              </button>
            ))}
          </div>
          <button
            disabled={selecionados.length === 0}
            onClick={() => startTransition(() => startExpedienteAction(selecionados))}
            className="flex items-center justify-center gap-2 self-start rounded-[9px] bg-success px-4 py-2.5 text-[13.5px] font-semibold text-background disabled:opacity-40"
          >
            <Play size={16} /> Iniciar expediente
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[28px] font-semibold text-[#e6eaf0]">{formatHMS(seconds)}</span>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                color: expediente.status === "running" ? "#34d399" : "#fbbf24",
                background: expediente.status === "running" ? "#34d39920" : "#fbbf2420",
              }}
            >
              {expediente.status === "running" ? "trabalhando" : "pausado"}
            </span>
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {expediente.projetos.map(nomeProjeto).join(" · ")}
          </div>
          <div className="flex items-center gap-2">
            {expediente.status === "running" ? (
              <button
                onClick={() => startTransition(() => pausarExpedienteAction(expediente.id))}
                className="flex items-center gap-1.5 rounded-[9px] border border-warning px-3.5 py-2 text-[13px] font-semibold text-warning"
              >
                <Pause size={15} /> Pausar
              </button>
            ) : (
              <button
                onClick={() => startTransition(() => retomarExpedienteAction(expediente.id))}
                className="flex items-center gap-1.5 rounded-[9px] border border-success px-3.5 py-2 text-[13px] font-semibold text-success"
              >
                <Play size={15} /> Retomar
              </button>
            )}
            <button
              onClick={() => startTransition(() => encerrarExpedienteAction(expediente.id))}
              className="flex items-center gap-1.5 rounded-[9px] bg-destructive px-3.5 py-2 text-[13px] font-semibold text-background"
            >
              <Square size={15} /> Encerrar
            </button>
          </div>
        </>
      )}

      {historico.length > 0 && (
        <div className="mt-1 flex flex-col gap-1 border-t border-border pt-3">
          <div className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Histórico recente
          </div>
          {historico.map((h) => (
            <div key={h.id} className="flex items-center justify-between text-[12px] text-muted-foreground">
              <span className="truncate">{h.projetos.map(nomeProjeto).join(" · ")}</span>
              <span className="flex-none font-mono">{formatHours(h.duracaoSegundos / 3600)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
