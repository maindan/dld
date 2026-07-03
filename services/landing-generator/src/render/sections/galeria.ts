import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen } from "./shared";

/**
 * Grid of projects/work. The contract has no image-upload field for gallery
 * items, so each card's "thumbnail" is a gradient tile in the theme's accent
 * colors rather than a fake stock photo — an honest placeholder instead of
 * a broken `<img>`.
 */
export function renderGaleria(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", "Trabalhos recentes");
  const itens = secao.itens ?? [];

  const cards = itens
    .map((item, i) => {
      const itemTitulo = itemCampo(item, "titulo", `Projeto ${i + 1}`);
      const descricao = itemCampo(item, "descricao", "");
      return `<div className="card gallery-card">
            <div className="gallery-thumb" aria-hidden="true" />
            <div className="gallery-body">
              <h3 className="card-title">{${jsExpr(itemTitulo)}}</h3>
              <p className="card-text">{${jsExpr(descricao)}}</p>
            </div>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, theme)}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="grid grid-3">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
