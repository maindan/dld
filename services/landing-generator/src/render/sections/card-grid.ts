import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen, staggerStyle, varianteDe } from "./shared";

/**
 * "servicos" and "diferenciais" share the same item shape (titulo/texto) and
 * the same 3 layout variants:
 *
 *  - `grid`  — cards with hover lift + accent border glow and a numbered
 *    mono badge per card.
 *  - `bento` — the first item spans 2 columns / 2 rows with much larger
 *    typography; the rest fill the grid around it.
 *  - `lista` — editorial horizontal rows with hairlines and a big index
 *    number on the left. No cards at all.
 *
 * Grid children stagger in (`.stagger` + per-child `--i`).
 */
function renderCardGrid(secao: Secao, design: ResolvedDesign, tituloPadrao: string): string {
  const titulo = campo(secao, "titulo", tituloPadrao);
  const subtitulo = campo(secao, "subtitulo", "");
  const itens = secao.itens ?? [];
  const variante = varianteDe(secao) || "grid";

  const heading = sectionHeading(titulo, subtitulo || undefined);

  if (variante === "lista") {
    const rows = itens
      .map((item, i) => {
        const itemTitulo = itemCampo(item, "titulo", `Item ${i + 1}`);
        const itemTexto = itemCampo(item, "texto", "");
        return `<div className="row-item"${staggerStyle(i)}>
            <span className="row-index" aria-hidden="true">{${jsExpr(String(i + 1).padStart(2, "0"))}}</span>
            <div>
              <h3 className="card-title">{${jsExpr(itemTitulo)}}</h3>
              <p className="card-text">{${jsExpr(itemTexto)}}</p>
            </div>
          </div>`;
      })
      .join("\n          ");

    return `${sectionOpen(secao, design)}
        <div className="container">
          ${heading}
          <div className="cards-rows stagger">
            ${rows}
          </div>
        </div>
      ${SECTION_CLOSE}`;
  }

  const gridClass = variante === "bento" ? "grid cards-bento stagger" : "grid grid-3 cards-grid stagger";

  const cards = itens
    .map((item, i) => {
      const itemTitulo = itemCampo(item, "titulo", `Item ${i + 1}`);
      const itemTexto = itemCampo(item, "texto", "");
      return `<div className="card card--hover"${staggerStyle(i)}>
            <span className="card-index" aria-hidden="true">{${jsExpr(String(i + 1).padStart(2, "0"))}}</span>
            <h3 className="card-title">{${jsExpr(itemTitulo)}}</h3>
            <p className="card-text">{${jsExpr(itemTexto)}}</p>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, design)}
        <div className="container">
          ${heading}
          <div className="${gridClass}">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}

export function renderServicos(secao: Secao, design: ResolvedDesign): string {
  return renderCardGrid(secao, design, "Nossos serviços");
}

export function renderDiferenciais(secao: Secao, design: ResolvedDesign): string {
  return renderCardGrid(secao, design, "Por que nos escolher");
}
