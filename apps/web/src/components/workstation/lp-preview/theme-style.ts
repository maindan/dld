import type { CSSProperties } from "react";
import type {
  DesignConfig,
  EstiloAnimacao,
  EstiloBackground,
  EstiloBotao,
  EstiloCard,
} from "@danlimadev/contracts";
import type { LandingPageTheme } from "@danlimadev/landing-generator/models";

/**
 * Resolution layer: theme defaults <- per-page DesignConfig overrides. Every
 * lp-preview component consumes a ResolvedDesign (never the raw theme + raw
 * overrides separately) so the "qual valor vale agora" question is answered in
 * exactly one place — the same precedence the generator applies.
 */
export interface ResolvedDesign {
  fonteTitulo: string;
  fonteCorpo: string;
  estiloBotao: EstiloBotao;
  estiloAnimacao: EstiloAnimacao;
  estiloBackground: EstiloBackground;
  estiloCard: EstiloCard;
  radius: number;
  /** Comes straight from the theme — dark/light base is not overridable per page. */
  escuro: boolean;
}

export function resolveDesign(tema: LandingPageTheme, design?: DesignConfig | null): ResolvedDesign {
  return {
    fonteTitulo: design?.fonteTitulo ?? tema.fonteTitulo,
    fonteCorpo: design?.fonteCorpo ?? tema.fonteCorpo,
    estiloBotao: design?.estiloBotao ?? tema.estiloBotao,
    estiloAnimacao: design?.estiloAnimacao ?? tema.estiloAnimacao,
    estiloBackground: design?.estiloBackground ?? tema.estiloBackground,
    estiloCard: design?.estiloCard ?? tema.estiloCard,
    radius: design?.radius ?? tema.radius,
    escuro: tema.escuro,
  };
}

/** Google Fonts families that are serifs — used only to pick a sane CSS fallback. */
const SERIF_FONTS = new Set(["Fraunces", "Playfair Display", "Source Serif 4"]);

function fontFallback(family: string): string {
  return SERIF_FONTS.has(family) ? "serif" : "sans-serif";
}

/**
 * CSS custom properties derived from a LandingPageTheme (+ resolved per-page design),
 * consumed by every lp-preview component via `var(--lp-*)`. Centralizing this keeps
 * the preview's palette/typography in lockstep with the theme catalog without each
 * block re-deriving it.
 */
export interface LpThemeVars extends CSSProperties {
  "--lp-cor": string;
  "--lp-cor-secundaria": string;
  "--lp-fundo": string;
  "--lp-fundo-alt": string;
  "--lp-texto": string;
  "--lp-texto-suave": string;
  "--lp-radius": string;
  "--lp-fonte-titulo": string;
  "--lp-fonte-corpo": string;
}

export function temaVars(tema: LandingPageTheme, corAcento?: string, design?: ResolvedDesign): LpThemeVars {
  const d = design ?? resolveDesign(tema);
  return {
    "--lp-cor": corAcento || tema.cor,
    "--lp-cor-secundaria": tema.corSecundaria,
    "--lp-fundo": tema.corFundo,
    "--lp-fundo-alt": tema.corFundoAlt,
    "--lp-texto": tema.corTexto,
    "--lp-texto-suave": tema.corTextoSuave,
    "--lp-radius": `${d.radius}px`,
    "--lp-fonte-titulo": `"${d.fonteTitulo}", ${fontFallback(d.fonteTitulo)}`,
    "--lp-fonte-corpo": `"${d.fonteCorpo}", ${fontFallback(d.fonteCorpo)}`,
    fontFamily: `"${d.fonteCorpo}", ${fontFallback(d.fonteCorpo)}`,
    color: tema.corTexto,
    background: tema.corFundo,
  } as LpThemeVars;
}

/** Border radius helper — most cards use the full resolved radius, small chips use a fraction of it. */
export function lpRadius(design: ResolvedDesign, factor = 1): number {
  return Math.round(design.radius * factor);
}

export function botaoRadius(design: ResolvedDesign): number {
  if (design.estiloBotao === "pill") return 999;
  if (design.estiloBotao === "reto") return 0;
  return Math.max(6, lpRadius(design, 0.7));
}

/**
 * Card surface treatment per resolved `estiloCard`. Shared by every card-ish
 * element in the preview (services, testimonials, pricing, gallery, team...).
 */
export function cardSurface(design: ResolvedDesign): CSSProperties {
  switch (design.estiloCard) {
    case "glass":
      return {
        background: design.escuro ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.6)",
        border: design.escuro ? "1px solid rgba(255,255,255,0.11)" : "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      };
    case "elevated":
      return {
        background: "var(--lp-fundo)",
        border: "1px solid color-mix(in srgb, var(--lp-texto) 7%, transparent)",
        boxShadow: design.escuro
          ? "0 18px 40px -18px rgba(0,0,0,0.75)"
          : "0 18px 40px -22px rgba(15,20,30,0.28)",
      };
    case "outline":
      return {
        background: "transparent",
        border: "1px solid color-mix(in srgb, var(--lp-texto) 18%, transparent)",
      };
    case "flat":
    default:
      return { background: "var(--lp-fundo-alt)" };
  }
}

/**
 * Keyframes + marquee classes shared by the live preview and the editor's Design
 * tab mini-swatches. Rendered as a plain <style> tag (a few hundred bytes; duplicate
 * tags across preview instances are harmless).
 */
export const LP_PREVIEW_CSS = `
@keyframes lp-aurora {
  0% { transform: translate3d(-4%, -3%, 0) scale(1); }
  100% { transform: translate3d(5%, 4%, 0) scale(1.12); }
}
@keyframes lp-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.lp-marquee { overflow: hidden; }
.lp-marquee-track {
  display: flex;
  width: max-content;
  animation: lp-marquee var(--lp-marquee-dur, 22s) linear infinite;
}
`;
