import type { DesignConfig } from "@danlimadev/contracts";
import type {
  EstiloAnimacao,
  EstiloBackground,
  EstiloBotao,
  EstiloCard,
  EstiloHeader,
  LandingPageTheme,
} from "../models";

/**
 * The single design object every renderer consumes. It is the chosen theme
 * (`LANDING_PAGE_MODELS`) merged, field by field, with the page's optional
 * `input.design` overrides — only fields the user actually set override the
 * theme's default — plus the accent color, so nothing downstream ever needs
 * to look at the raw theme or the raw input again.
 */
export interface ResolvedDesign {
  temaId: string;
  corAcento: string;
  corSecundaria: string;
  corFundo: string;
  corFundoAlt: string;
  corTexto: string;
  corTextoSuave: string;
  fonteTitulo: string;
  fonteCorpo: string;
  estiloHeader: EstiloHeader;
  estiloBotao: EstiloBotao;
  estiloAnimacao: EstiloAnimacao;
  estiloBackground: EstiloBackground;
  estiloCard: EstiloCard;
  radius: number;
  escuro: boolean;
}

export function resolveDesign(
  theme: LandingPageTheme,
  corAcento: string,
  overrides?: DesignConfig,
): ResolvedDesign {
  const d = overrides ?? {};
  return {
    temaId: theme.id,
    corAcento,
    corSecundaria: theme.corSecundaria,
    corFundo: theme.corFundo,
    corFundoAlt: theme.corFundoAlt,
    corTexto: theme.corTexto,
    corTextoSuave: theme.corTextoSuave,
    fonteTitulo: d.fonteTitulo?.trim() || theme.fonteTitulo,
    fonteCorpo: d.fonteCorpo?.trim() || theme.fonteCorpo,
    estiloHeader: theme.estiloHeader,
    estiloBotao: d.estiloBotao ?? theme.estiloBotao,
    estiloAnimacao: d.estiloAnimacao ?? theme.estiloAnimacao,
    estiloBackground: d.estiloBackground ?? theme.estiloBackground,
    estiloCard: d.estiloCard ?? theme.estiloCard,
    // `??` (not `||`): radius 0 is a legitimate override (sharp corners).
    radius: d.radius ?? theme.radius,
    escuro: theme.escuro,
  };
}

/** True when this design's sections should get scroll/entrance animations at all. */
export function temAnimacao(design: ResolvedDesign): boolean {
  return design.estiloAnimacao !== "none";
}
