"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, Pencil, Loader2 } from "lucide-react";
import { LANDING_PAGE_MODELS } from "@danlimadev/landing-generator/models";
import { createLandingPageAction, deleteLandingPageAction } from "@/lib/actions/landing-pages";
import type { LandingPageListItem } from "@/lib/queries/landing-pages";
import { buildInitialLandingPageState } from "@/lib/landing-pages/initial-secoes";
import { LandingPagePreview } from "@/components/workstation/lp-preview";

/** Scale applied to the full-size preview to make it fit the picker card. Both the
 * outer card and the inner wrapper use percentage sizing so this stays crisp at any
 * card width — see the width/height math below. */
const THUMB_SCALE = 0.26;

export function LandingPagesSection({ drafts }: { drafts: LandingPageListItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pickingId, setPickingId] = useState<string | null>(null);

  function pickModel(modeloId: string) {
    if (isPending) return;
    setPickingId(modeloId);
    startTransition(async () => {
      const row = await createLandingPageAction(modeloId, null);
      router.push(`/workstation/landing-pages/${row.id}/editor`);
    });
  }

  function remove(id: string) {
    startTransition(() => deleteLandingPageAction(id));
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <div className="font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
          Gerador de landing pages
        </div>
        <div className="text-[12.5px] text-muted-foreground">
          Escolha um modelo para personalizar e gerar um projeto Next.js pré-configurado.
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_PAGE_MODELS.map((lm) => (
            <ModeloCard
              key={lm.id}
              modeloId={lm.id}
              nome={lm.nome}
              desc={lm.desc}
              disabled={isPending}
              loading={isPending && pickingId === lm.id}
              onPick={() => pickModel(lm.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <div className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Rascunhos e gerados
        </div>
        {drafts.length === 0 ? (
          <div className="py-4 text-center text-[12.5px] text-muted-foreground">Nenhuma landing page ainda.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {drafts.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-[9px] bg-muted px-3 py-2.5">
                <span className="size-3 flex-none rounded-full" style={{ background: d.corAcento }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-foreground">{d.titulo || "Sem título"}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {d.modeloNome} · {d.freelaNome ?? "sem freela"} · {d.geradoEm ? "gerado" : "rascunho"}
                  </span>
                </span>
                <button
                  onClick={() => router.push(`/workstation/landing-pages/${d.id}/editor`)}
                  className="flex flex-none items-center gap-1.5 rounded-[8px] border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  <Pencil size={13} /> Editar
                </button>
                {d.geradoEm && (
                  <a
                    href={`/api/landing-pages/${d.id}/gerar`}
                    className="flex flex-none items-center gap-1.5 rounded-[8px] border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    <Download size={13} /> Baixar .zip
                  </a>
                )}
                <button onClick={() => remove(d.id)} className="flex-none p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Renders a real (scaled-down) preview of the theme's starter page instead of an
 * abstract skeleton, so the six models are visually distinguishable at a glance. */
function ModeloCard({
  modeloId,
  nome,
  desc,
  disabled,
  loading,
  onPick,
}: {
  modeloId: string;
  nome: string;
  desc: string;
  disabled: boolean;
  loading: boolean;
  onPick: () => void;
}) {
  const tema = LANDING_PAGE_MODELS.find((m) => m.id === modeloId)!;
  const seed = useMemo(() => buildInitialLandingPageState(modeloId, tema.cor), [modeloId, tema.cor]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className="flex flex-col overflow-hidden rounded-[12px] border border-border bg-background text-left transition-colors hover:border-[var(--lm-cor)] disabled:cursor-wait disabled:opacity-60"
      style={{ ["--lm-cor" as string]: tema.cor }}
    >
      <div
        className="relative w-full overflow-hidden border-b border-border"
        style={{ aspectRatio: "16 / 11", background: tema.corFundo }}
      >
        <div
          className="pointer-events-none absolute top-0 left-0"
          style={{
            width: `${100 / THUMB_SCALE}%`,
            height: `${100 / THUMB_SCALE}%`,
            transform: `scale(${THUMB_SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <LandingPagePreview
            tema={tema}
            corAcento={seed.corAcento}
            header={seed.header}
            secoes={seed.secoes}
            footer={seed.footer}
            whatsapp={seed.whatsapp}
            interactive={false}
          />
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <div className="text-[13.5px] font-semibold text-foreground">{nome}</div>
        <div className="text-[11.5px] text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}
