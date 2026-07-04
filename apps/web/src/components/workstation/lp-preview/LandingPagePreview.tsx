"use client";

import { useMemo } from "react";
import type { DesignConfig, HeaderConfig, FooterConfig, WhatsappConfig, Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "@danlimadev/landing-generator/models";
import { LP_PREVIEW_CSS, resolveDesign, temaVars } from "./theme-style";
import { useGoogleFonts } from "./use-google-fonts";
import { HeaderPreview } from "./HeaderPreview";
import { FooterPreview } from "./FooterPreview";
import { SecaoPreview } from "./SecaoPreview";
import { WhatsappButtonPreview } from "./WhatsappButtonPreview";

export type PreviewSelecao =
  | { tipo: "header" }
  | { tipo: "secao"; id: string }
  | { tipo: "footer" }
  | { tipo: "whatsapp" };

export interface LandingPagePreviewProps {
  tema: LandingPageTheme;
  /** Per-page design overrides (Design tab); null/absent = pure theme defaults. */
  design?: DesignConfig | null;
  corAcento: string;
  header: HeaderConfig;
  secoes: Secao[];
  footer: FooterConfig;
  whatsapp: WhatsappConfig;
  /** false for the model-picker thumbnails: renders inert, no click-to-select, no hover cursor. */
  interactive?: boolean;
  selecionado?: PreviewSelecao | null;
  onSelect?: (sel: PreviewSelecao) => void;
}

/**
 * Full-page live preview, reused by both the editor (interactive, wired to the
 * selection/edit state) and the model-picker grid (inert, scaled down thumbnail).
 * Resolves theme defaults + per-page design overrides once (resolveDesign) and
 * feeds every child from that single source of truth, so any Design-tab change
 * re-renders the whole page instantly.
 * Renders header -> sections in order -> footer -> floating WhatsApp button.
 */
export function LandingPagePreview({
  tema,
  design = null,
  corAcento,
  header,
  secoes,
  footer,
  whatsapp,
  interactive = true,
  selecionado = null,
  onSelect,
}: LandingPagePreviewProps) {
  const resolved = useMemo(() => resolveDesign(tema, design), [tema, design]);
  useGoogleFonts([resolved.fonteTitulo, resolved.fonteCorpo]);
  const vars = temaVars(tema, corAcento, resolved);
  const overlay = tema.estiloHeader === "transparente-sobre-hero";
  const primeiraSecao = secoes[0];

  const headerNode = (
    <HeaderPreview
      tema={tema}
      header={header}
      corAcento={corAcento}
      interactive={interactive}
      selected={selecionado?.tipo === "header"}
      onSelect={() => onSelect?.({ tipo: "header" })}
    />
  );

  return (
    <div style={vars} className="relative flex min-h-full flex-col">
      <style>{LP_PREVIEW_CSS}</style>
      {overlay ? (
        <div className="relative">
          {headerNode}
          {primeiraSecao && (
            <SecaoPreview
              design={resolved}
              secao={primeiraSecao}
              corAcento={corAcento}
              alt={false}
              decorada
              interactive={interactive}
              selected={selecionado?.tipo === "secao" && selecionado.id === primeiraSecao.id}
              onSelect={() => onSelect?.({ tipo: "secao", id: primeiraSecao.id })}
            />
          )}
        </div>
      ) : (
        headerNode
      )}

      {secoes.map((s, i) => {
        if (overlay && i === 0) return null;
        return (
          <SecaoPreview
            key={s.id}
            design={resolved}
            secao={s}
            corAcento={corAcento}
            alt={i % 2 === 1}
            decorada={i === 0}
            interactive={interactive}
            selected={selecionado?.tipo === "secao" && selecionado.id === s.id}
            onSelect={() => onSelect?.({ tipo: "secao", id: s.id })}
          />
        );
      })}

      <FooterPreview
        footer={footer}
        corAcento={corAcento}
        interactive={interactive}
        selected={selecionado?.tipo === "footer"}
        onSelect={() => onSelect?.({ tipo: "footer" })}
      />

      <WhatsappButtonPreview whatsapp={whatsapp} />
    </div>
  );
}
