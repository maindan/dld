import type { CSSProperties } from "react";
import type { LandingPageTheme } from "@danlimadev/landing-generator/models";

/**
 * CSS custom properties derived from a LandingPageTheme, consumed by every lp-preview
 * component via `var(--lp-*)`. Centralizing this keeps the preview's palette/typography
 * in lockstep with the theme catalog without each block re-deriving it.
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

export function temaVars(tema: LandingPageTheme, corAcento?: string): LpThemeVars {
  return {
    "--lp-cor": corAcento || tema.cor,
    "--lp-cor-secundaria": tema.corSecundaria,
    "--lp-fundo": tema.corFundo,
    "--lp-fundo-alt": tema.corFundoAlt,
    "--lp-texto": tema.corTexto,
    "--lp-texto-suave": tema.corTextoSuave,
    "--lp-radius": `${tema.radius}px`,
    "--lp-fonte-titulo": `"${tema.fonteTitulo}", ${tema.escuro ? "sans-serif" : "serif"}`,
    "--lp-fonte-corpo": `"${tema.fonteCorpo}", sans-serif`,
    fontFamily: `"${tema.fonteCorpo}", sans-serif`,
    color: tema.corTexto,
    background: tema.corFundo,
  } as LpThemeVars;
}

/** Border radius helper — most cards use the full theme radius, small chips use a fraction of it. */
export function lpRadius(tema: LandingPageTheme, factor = 1): number {
  return Math.round(tema.radius * factor);
}

export function botaoRadius(tema: LandingPageTheme): number {
  if (tema.estiloBotao === "pill") return 999;
  if (tema.estiloBotao === "reto") return 0;
  return Math.max(6, lpRadius(tema, 0.7));
}
