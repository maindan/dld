"use client";

import { useState, useTransition } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { createLandingPageDraftAction, deleteLandingPageDraftAction } from "@/lib/actions/landing-pages";
import type { LandingPageDraft } from "@/lib/queries/landing-pages";
import type { ProjetoOpcao } from "@/lib/queries/expediente";

const CORES = ["#818cf8", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa"];

export function LandingPagesSection({
  drafts,
  freelas,
}: {
  drafts: LandingPageDraft[];
  freelas: ProjetoOpcao[];
}) {
  const [, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [cor, setCor] = useState(CORES[0]);

  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
          Landing pages
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-[12.5px] text-primary"
        >
          <Plus size={14} /> Nova
        </button>
      </div>

      {showForm && (
        <form
          action={(fd) => {
            startTransition(() => createLandingPageDraftAction(fd));
            setShowForm(false);
          }}
          className="flex flex-col gap-2.5 rounded-[9px] border border-border bg-[#0e1116] p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="marca"
              required
              placeholder="Nome da marca"
              className="min-w-[160px] flex-1 rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
            <select
              name="freelaId"
              className="rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] text-muted-foreground outline-none focus:border-primary"
            >
              <option value="">Sem freela vinculado</option>
              {freelas
                .filter((f) => f.id !== "pessoal")
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
            </select>
            <div className="flex items-center gap-1.5">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className="size-5 rounded-full"
                  style={{ background: c, outline: cor === c ? `2px solid ${c}55` : "none", outlineOffset: 2 }}
                />
              ))}
              <input type="hidden" name="corAcento" value={cor} />
            </div>
          </div>
          <input
            name="footerContato"
            placeholder="Texto de contato (rodapé)"
            className="rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="self-start rounded-[8px] bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground"
          >
            Criar rascunho
          </button>
        </form>
      )}

      {drafts.length === 0 ? (
        <div className="py-4 text-center text-[12.5px] text-muted-foreground">Nenhuma landing page ainda.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {drafts.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-[9px] bg-[#1b222c] px-3 py-2.5">
              <span className="size-3 flex-none rounded-full" style={{ background: d.corAcento }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-[#c9d1dc]">{d.marca}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {d.freelaNome ?? "sem freela"} · {d.geradoEm ? "gerado" : "rascunho"}
                </span>
              </span>
              <a
                href={`/api/landing-pages/${d.id}/gerar`}
                className="flex flex-none items-center gap-1.5 rounded-[8px] border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-[#e6eaf0]"
              >
                <Download size={13} /> Baixar .zip
              </a>
              <button
                onClick={() => startTransition(() => deleteLandingPageDraftAction(d.id))}
                className="flex-none p-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
