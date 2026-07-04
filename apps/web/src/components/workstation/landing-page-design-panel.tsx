"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import {
  ESTILOS_ANIMACAO,
  ESTILOS_BACKGROUND,
  ESTILOS_BOTAO,
  ESTILOS_CARD,
  ESTILO_ANIMACAO_LABELS,
  ESTILO_BACKGROUND_LABELS,
  ESTILO_BOTAO_LABELS,
  ESTILO_CARD_LABELS,
  FONTE_PAIRINGS,
  type DesignConfig,
  type EstiloAnimacao,
  type EstiloBotao,
} from "@danlimadev/contracts";
import type { LandingPageTheme } from "@danlimadev/landing-generator/models";
import {
  LP_PREVIEW_CSS,
  LpBackgroundDecor,
  cardSurface,
  resolveDesign,
  useGoogleFonts,
} from "@/components/workstation/lp-preview";

const CORES_DESTAQUE = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa"];

/** Looping mini-demos for the animation picker (editor-only, not part of the preview CSS). */
const DEMO_CSS = `
@keyframes lpe-fade-up { 0% { opacity: 0; transform: translateY(7px); } 35%, 75% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(7px); } }
@keyframes lpe-zoom-in { 0% { opacity: 0; transform: scale(0.55); } 35%, 75% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.55); } }
@keyframes lpe-slide-in { 0% { opacity: 0; transform: translateX(-10px); } 35%, 75% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(-10px); } }
`;

const DEMO_ANIMATION: Record<EstiloAnimacao, string | undefined> = {
  "fade-up": "lpe-fade-up 2.4s ease-in-out infinite",
  "zoom-in": "lpe-zoom-in 2.4s ease-in-out infinite",
  "slide-in": "lpe-slide-in 2.4s ease-in-out infinite",
  none: undefined,
};

/**
 * "Design" tab of the landing page editor: accent color, curated font pairing,
 * background / button / card / animation style and corner radius. Every control
 * shows the theme default when no override is set and offers a one-click
 * "restaurar padrão do tema" that clears just that override (undefined). The
 * parent persists via the existing debounced autosave.
 */
export function LandingPageDesignPanel({
  tema,
  design,
  corAcento,
  onCorChange,
  onDesignField,
}: {
  tema: LandingPageTheme;
  design: DesignConfig | null;
  corAcento: string;
  onCorChange: (cor: string) => void;
  onDesignField: <K extends keyof DesignConfig>(key: K, value: DesignConfig[K] | undefined) => void;
}) {
  const resolved = resolveDesign(tema, design);

  // Load every curated pairing on demand (this panel only mounts when the tab
  // opens) so each pairing's name renders in its own title font.
  const familias = useMemo(() => {
    const set = new Set<string>();
    for (const p of FONTE_PAIRINGS) {
      set.add(p.titulo);
      set.add(p.corpo);
    }
    return [...set];
  }, []);
  useGoogleFonts(familias);

  // CSS vars so LpBackgroundDecor / cardSurface render the swatches with the
  // page's real palette instead of the app chrome's.
  const swatchVars: CSSProperties = {
    ["--lp-cor" as string]: corAcento,
    ["--lp-cor-secundaria" as string]: tema.corSecundaria,
    ["--lp-fundo" as string]: tema.corFundo,
    ["--lp-fundo-alt" as string]: tema.corFundoAlt,
    ["--lp-texto" as string]: tema.corTexto,
  };

  const parPadrao =
    FONTE_PAIRINGS.find((p) => p.titulo === tema.fonteTitulo && p.corpo === tema.fonteCorpo) ??
    FONTE_PAIRINGS.find((p) => p.titulo === tema.fonteTitulo);
  const fonteOverride = design?.fonteTitulo !== undefined || design?.fonteCorpo !== undefined;
  const parAtivo = fonteOverride
    ? (FONTE_PAIRINGS.find((p) => p.titulo === resolved.fonteTitulo && p.corpo === resolved.fonteCorpo) ??
      FONTE_PAIRINGS.find((p) => p.titulo === resolved.fonteTitulo))
    : parPadrao;

  const swatches = useMemo(
    () => [tema.cor, ...CORES_DESTAQUE.filter((c) => c.toLowerCase() !== tema.cor.toLowerCase())],
    [tema.cor],
  );
  const corPadrao = corAcento.toLowerCase() === tema.cor.toLowerCase();

  return (
    <div className="flex flex-col gap-5">
      <style>{LP_PREVIEW_CSS + DEMO_CSS}</style>

      {/* ------------------------------------------------ Cor de destaque */}
      <section className="flex flex-col gap-2">
        <ControlHeader
          label="Cor de destaque"
          padraoLabel={tema.cor}
          override={!corPadrao}
          onReset={() => onCorChange(tema.cor)}
        />
        <div className="flex flex-wrap items-center gap-2">
          {swatches.map((cor) => (
            <button
              key={cor}
              onClick={() => onCorChange(cor)}
              title={cor}
              className="size-[30px] rounded-[8px]"
              style={{
                background: cor,
                boxShadow:
                  corAcento.toLowerCase() === cor.toLowerCase() ? `0 0 0 2px var(--card), 0 0 0 4px ${cor}` : undefined,
              }}
            />
          ))}
          <label
            className="relative flex size-[30px] cursor-pointer items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-[#3a4553] text-[13px] text-muted-foreground hover:border-primary hover:text-foreground"
            title="Cor livre"
          >
            +
            <input
              type="color"
              value={corAcento}
              onChange={(e) => onCorChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          <span className="font-mono text-[10.5px] text-muted-foreground">{corAcento}</span>
        </div>
      </section>

      {/* ------------------------------------------------ Tipografia */}
      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <ControlHeader
          label="Par tipográfico"
          padraoLabel={parPadrao ? parPadrao.titulo : tema.fonteTitulo}
          override={fonteOverride}
          onReset={() => {
            onDesignField("fonteTitulo", undefined);
            onDesignField("fonteCorpo", undefined);
          }}
        />
        <div className="flex flex-col gap-1">
          {FONTE_PAIRINGS.map((p) => {
            const ativo = parAtivo?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onDesignField("fonteTitulo", p.titulo);
                  onDesignField("fonteCorpo", p.corpo);
                }}
                className="flex items-center justify-between gap-2 rounded-[9px] border px-3 py-2 text-left"
                style={{
                  borderColor: ativo ? "var(--primary)" : "var(--border)",
                  background: ativo ? "rgba(129,140,248,0.08)" : "transparent",
                }}
              >
                <span className="flex min-w-0 flex-col">
                  <span
                    className="truncate text-[15px] text-foreground"
                    style={{ fontFamily: `"${p.titulo}", sans-serif` }}
                  >
                    {p.nome}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    Título {p.titulo} · Corpo {p.corpo}
                  </span>
                </span>
                {parPadrao?.id === p.id && <PadraoBadge />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ Estilo de fundo */}
      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <ControlHeader
          label="Estilo de fundo"
          padraoLabel={ESTILO_BACKGROUND_LABELS[tema.estiloBackground]}
          override={design?.estiloBackground !== undefined}
          onReset={() => onDesignField("estiloBackground", undefined)}
        />
        <div className="grid grid-cols-3 gap-2">
          {ESTILOS_BACKGROUND.map((estilo) => {
            const ativo = resolved.estiloBackground === estilo;
            return (
              <button
                key={estilo}
                onClick={() => onDesignField("estiloBackground", estilo)}
                className="flex flex-col items-center gap-1.5"
                title={ESTILO_BACKGROUND_LABELS[estilo]}
              >
                <span
                  className="relative block h-[72px] w-full overflow-hidden rounded-[9px] border"
                  style={{
                    ...swatchVars,
                    background: tema.corFundo,
                    borderColor: ativo ? corAcento : "var(--border)",
                    boxShadow: ativo ? `0 0 0 1px ${corAcento}` : undefined,
                  }}
                >
                  <LpBackgroundDecor estilo={estilo} escuro={tema.escuro} />
                  {tema.estiloBackground === estilo && (
                    <span className="absolute top-1 right-1 z-10">
                      <PadraoBadge />
                    </span>
                  )}
                </span>
                <span
                  className="text-center text-[9.5px] leading-tight"
                  style={{ color: ativo ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {ESTILO_BACKGROUND_LABELS[estilo]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ Estilo de botão */}
      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <ControlHeader
          label="Estilo de botão"
          padraoLabel={ESTILO_BOTAO_LABELS[tema.estiloBotao]}
          override={design?.estiloBotao !== undefined}
          onReset={() => onDesignField("estiloBotao", undefined)}
        />
        <div className="grid grid-cols-3 gap-2">
          {ESTILOS_BOTAO.map((estilo) => (
            <OptionCard
              key={estilo}
              ativo={resolved.estiloBotao === estilo}
              padrao={tema.estiloBotao === estilo}
              label={ESTILO_BOTAO_LABELS[estilo]}
              onClick={() => onDesignField("estiloBotao", estilo)}
            >
              <span
                style={{
                  display: "block",
                  width: 44,
                  height: 17,
                  background: corAcento,
                  borderRadius: botaoDemoRadius(estilo),
                }}
              />
            </OptionCard>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Estilo de card */}
      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <ControlHeader
          label="Estilo de card"
          padraoLabel={ESTILO_CARD_LABELS[tema.estiloCard]}
          override={design?.estiloCard !== undefined}
          onReset={() => onDesignField("estiloCard", undefined)}
        />
        <div className="grid grid-cols-4 gap-2">
          {ESTILOS_CARD.map((estilo) => (
            <OptionCard
              key={estilo}
              ativo={resolved.estiloCard === estilo}
              padrao={tema.estiloCard === estilo}
              label={ESTILO_CARD_LABELS[estilo]}
              onClick={() => onDesignField("estiloCard", estilo)}
              demoStyle={{ ...swatchVars, background: tema.corFundo }}
            >
              <span
                className="flex flex-col gap-1 p-1.5"
                style={{
                  ...cardSurface({ ...resolved, estiloCard: estilo }),
                  width: "82%",
                  height: 34,
                  borderRadius: 7,
                }}
              >
                <span style={{ width: "55%", height: 4, borderRadius: 2, background: corAcento, opacity: 0.9 }} />
                <span
                  style={{
                    width: "80%",
                    height: 3,
                    borderRadius: 2,
                    background: tema.corTextoSuave,
                    opacity: 0.55,
                  }}
                />
              </span>
            </OptionCard>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Animação */}
      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <ControlHeader
          label="Animação de entrada"
          padraoLabel={ESTILO_ANIMACAO_LABELS[tema.estiloAnimacao]}
          override={design?.estiloAnimacao !== undefined}
          onReset={() => onDesignField("estiloAnimacao", undefined)}
        />
        <div className="grid grid-cols-4 gap-2">
          {ESTILOS_ANIMACAO.map((estilo) => (
            <OptionCard
              key={estilo}
              ativo={resolved.estiloAnimacao === estilo}
              padrao={tema.estiloAnimacao === estilo}
              label={ESTILO_ANIMACAO_LABELS[estilo]}
              onClick={() => onDesignField("estiloAnimacao", estilo)}
            >
              <span
                style={{
                  display: "block",
                  width: 13,
                  height: 13,
                  borderRadius: 4,
                  background: corAcento,
                  opacity: estilo === "none" ? 0.55 : undefined,
                  animation: DEMO_ANIMATION[estilo],
                }}
              />
            </OptionCard>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Radius */}
      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <ControlHeader
          label="Arredondamento (radius)"
          padraoLabel={`${tema.radius}px`}
          override={design?.radius !== undefined}
          onReset={() => onDesignField("radius", undefined)}
        />
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={28}
            step={1}
            value={resolved.radius}
            onChange={(e) => onDesignField("radius", Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span
            className="flex size-9 flex-none items-center justify-center border border-border bg-background font-mono text-[10.5px] text-foreground"
            style={{ borderRadius: Math.max(2, resolved.radius * 0.5) }}
          >
            {resolved.radius}
          </span>
        </div>
      </section>
    </div>
  );
}

function botaoDemoRadius(estilo: EstiloBotao): number {
  if (estilo === "pill") return 999;
  if (estilo === "reto") return 0;
  return 5;
}

function ControlHeader({
  label,
  padraoLabel,
  override,
  onReset,
}: {
  label: string;
  padraoLabel: string;
  override: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[12px] font-medium text-foreground">{label}</span>
      {override ? (
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[10.5px] text-primary hover:underline"
          title="Voltar ao padrão do tema"
        >
          <RotateCcw size={10} /> restaurar padrão do tema
        </button>
      ) : (
        <span className="truncate text-[10px] text-muted-foreground/80">padrão do tema · {padraoLabel}</span>
      )}
    </div>
  );
}

function PadraoBadge() {
  return (
    <span className="rounded-[4px] bg-[#222b36] px-1.5 py-0.5 text-[8.5px] font-semibold tracking-wide text-muted-foreground uppercase">
      padrão
    </span>
  );
}

function OptionCard({
  ativo,
  padrao,
  label,
  onClick,
  demoStyle,
  children,
}: {
  ativo: boolean;
  padrao: boolean;
  label: string;
  onClick: () => void;
  demoStyle?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5" title={label}>
      <span
        className="relative flex h-[46px] w-full items-center justify-center overflow-hidden rounded-[9px] border bg-background"
        style={{
          borderColor: ativo ? "var(--primary)" : "var(--border)",
          boxShadow: ativo ? "0 0 0 1px var(--primary)" : undefined,
          ...demoStyle,
        }}
      >
        {children}
        {padrao && (
          <span className="absolute top-1 right-1">
            <PadraoBadge />
          </span>
        )}
      </span>
      <span
        className="text-center text-[9.5px] leading-tight"
        style={{ color: ativo ? "var(--primary)" : "var(--muted-foreground)" }}
      >
        {label}
      </span>
    </button>
  );
}
