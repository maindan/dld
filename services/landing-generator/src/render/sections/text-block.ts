import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, jsExpr } from "../utils";
import { SECTION_CLOSE, sectionOpen, varianteDe } from "./shared";

/**
 * Shared layout for "sobre" and "contato": a width-controlled text block
 * (title + paragraph). "sobre" adds a `com-imagem` variant — two-column
 * text + image (`.about-grid` in theme-css.ts) that only kicks in when an
 * `imagemUrl` was actually provided, so the variant never renders an empty
 * media column.
 */
function renderTextBlock(secao: Secao, design: ResolvedDesign, tituloPadrao: string, textoPadrao: string): string {
  const titulo = campo(secao, "titulo", tituloPadrao);
  const texto = campo(secao, "texto", textoPadrao);

  return `${sectionOpen(secao, design, "section-alt")}
        <div className="container section-narrow">
          <h2 className="section-title">{${jsExpr(titulo)}}</h2>
          <p className="section-lead">{${jsExpr(texto)}}</p>
        </div>
      ${SECTION_CLOSE}`;
}

export function renderSobre(secao: Secao, design: ResolvedDesign): string {
  const tituloPadrao = "Sobre nós";
  const textoPadrao =
    "Uma equipe dedicada a entregar o melhor resultado em cada projeto, com atenção a cada detalhe.";
  const imagemUrl = campo(secao, "imagemUrl", "");
  const variante = varianteDe(secao) || "texto";

  if (variante === "com-imagem" && imagemUrl) {
    const titulo = campo(secao, "titulo", tituloPadrao);
    const texto = campo(secao, "texto", textoPadrao);
    return `${sectionOpen(secao, design, "section-alt")}
        <div className="container about-grid">
          <div>
            <h2 className="section-title">{${jsExpr(titulo)}}</h2>
            <p className="section-lead">{${jsExpr(texto)}}</p>
          </div>
          <img src={${jsExpr(imagemUrl)}} alt={${jsExpr(titulo)}} className="about-media-img" loading="lazy" />
        </div>
      ${SECTION_CLOSE}`;
  }

  return renderTextBlock(secao, design, tituloPadrao, textoPadrao);
}

export function renderContato(secao: Secao, design: ResolvedDesign): string {
  return renderTextBlock(secao, design, "Vamos conversar?", "Fale com a gente e tire suas dúvidas.");
}
