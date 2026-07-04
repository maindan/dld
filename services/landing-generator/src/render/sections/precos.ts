import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, itemBool, itemCampo, jsExpr, linhasDe } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen, staggerStyle } from "./shared";

/** Pricing columns; the item with `destaque=true` gets the highlighted treatment. */
export function renderPrecos(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "Planos e preços");
  const itens = secao.itens ?? [];

  const cards = itens
    .map((item, i) => {
      const nome = itemCampo(item, "nome", "Plano");
      const preco = itemCampo(item, "preco", "Sob consulta");
      const recursos = linhasDe(itemCampo(item, "recursos", ""));
      const destaque = itemBool(item, "destaque");

      const featuresHtml = recursos
        .map((linha) => `<li>{${jsExpr(linha)}}</li>`)
        .join("\n              ");

      return `<div className="card pricing-card${destaque ? " pricing-card--destaque" : ""}"${staggerStyle(i)}>
            ${destaque ? `<span className="pricing-badge">Mais popular</span>` : ""}
            <p className="pricing-name">{${jsExpr(nome)}}</p>
            <p className="pricing-price">{${jsExpr(preco)}}</p>
            <ul className="pricing-features">
              ${featuresHtml}
            </ul>
            <button type="button" className="btn ${destaque ? "btn-primary" : "btn-outline"}">Escolher plano</button>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, design)}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="grid grid-3 stagger">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
