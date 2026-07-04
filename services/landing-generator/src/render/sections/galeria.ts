import type { Secao, SecaoItemData } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen, staggerStyle, varianteDe } from "./shared";

/**
 * Grid of projects/work in 2 variants (contract: SECAO_BLOCKS.galeria):
 *
 *  - `grid`    — uniform card grid.
 *  - `masonry` — CSS-columns mosaic with 3 cycling thumb heights.
 *
 * Each card's thumb is the real `imagemUrl` (with a hover zoom) when set;
 * otherwise a gradient tile in one of 3 accent mixes with the title overlaid
 * — an honest placeholder instead of a broken `<img>`. When the image is
 * real the title moves into the card body.
 */
function cardHtml(item: SecaoItemData, i: number, variante: string): string {
  const titulo = itemCampo(item, "titulo", `Projeto ${i + 1}`);
  const descricao = itemCampo(item, "descricao", "");
  const imagemUrl = itemCampo(item, "imagemUrl", "");
  const alturaClass = variante === "masonry" ? ` thumb-h${(i % 3) + 1}` : "";

  const thumb = imagemUrl
    ? `<div className="gallery-thumb${alturaClass}">
              <img src={${jsExpr(imagemUrl)}} alt={${jsExpr(titulo)}} className="gallery-img" loading="lazy" />
            </div>`
    : `<div className="gallery-thumb gallery-thumb--g${(i % 3) + 1}${alturaClass}">
              <span className="gallery-thumb-title">{${jsExpr(titulo)}}</span>
            </div>`;

  const corpoLinhas = [
    imagemUrl ? `<h3 className="card-title">{${jsExpr(titulo)}}</h3>` : "",
    descricao ? `<p className="card-text">{${jsExpr(descricao)}}</p>` : "",
  ].filter(Boolean);

  const corpo = corpoLinhas.length
    ? `\n            <div className="gallery-body">
              ${corpoLinhas.join("\n              ")}
            </div>`
    : "";

  return `<div className="card card--hover gallery-card"${variante === "masonry" ? "" : staggerStyle(i)}>
            ${thumb}${corpo}
          </div>`;
}

export function renderGaleria(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "Trabalhos recentes");
  const itens = secao.itens ?? [];
  const variante = varianteDe(secao) || "grid";

  const cards = itens.map((item, i) => cardHtml(item, i, variante)).join("\n          ");
  const gridHtml =
    variante === "masonry"
      ? `<div className="gallery-masonry">
            ${cards}
          </div>`
      : `<div className="grid grid-3 stagger">
            ${cards}
          </div>`;

  return `${sectionOpen(secao, design)}
        <div className="container">
          ${sectionHeading(titulo)}
          ${gridHtml}
        </div>
      ${SECTION_CLOSE}`;
}
