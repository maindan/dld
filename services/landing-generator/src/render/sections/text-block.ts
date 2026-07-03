import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, jsExpr } from "../utils";
import { SECTION_CLOSE, sectionOpen } from "./shared";

/**
 * Shared layout for "sobre" and "contato": a simple width-controlled text
 * block (title + paragraph). Both blocks share the same two fields
 * (titulo/texto) and the same visual treatment; only the copy defaults and
 * the alternating background differ.
 */
function renderTextBlock(secao: Secao, theme: LandingPageTheme, tituloPadrao: string, textoPadrao: string): string {
  const titulo = campo(secao, "titulo", tituloPadrao);
  const texto = campo(secao, "texto", textoPadrao);

  return `${sectionOpen(secao, theme, "section-alt")}
        <div className="container section-narrow">
          <h2 className="section-title">{${jsExpr(titulo)}}</h2>
          <p className="section-lead">{${jsExpr(texto)}}</p>
        </div>
      ${SECTION_CLOSE}`;
}

export function renderSobre(secao: Secao, theme: LandingPageTheme): string {
  return renderTextBlock(
    secao,
    theme,
    "Sobre nós",
    "Uma equipe dedicada a entregar o melhor resultado em cada projeto, com atenção a cada detalhe.",
  );
}

export function renderContato(secao: Secao, theme: LandingPageTheme): string {
  return renderTextBlock(secao, theme, "Vamos conversar?", "Fale com a gente e tire suas dúvidas.");
}
