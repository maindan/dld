"use client";

import type { HeaderConfig, FooterConfig, WhatsappConfig, Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "@danlimadev/landing-generator/models";
import { temaVars } from "./theme-style";
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
 * Renders header -> sections in order -> footer -> floating WhatsApp button.
 */
export function LandingPagePreview({
  tema,
  corAcento,
  header,
  secoes,
  footer,
  whatsapp,
  interactive = true,
  selecionado = null,
  onSelect,
}: LandingPagePreviewProps) {
  useGoogleFonts([tema.fonteTitulo, tema.fonteCorpo]);
  const vars = temaVars(tema, corAcento);
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
      {overlay ? (
        <div className="relative">
          {headerNode}
          {primeiraSecao && (
            <SecaoPreview
              tema={tema}
              secao={primeiraSecao}
              corAcento={corAcento}
              alt={false}
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
            tema={tema}
            secao={s}
            corAcento={corAcento}
            alt={i % 2 === 1}
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
