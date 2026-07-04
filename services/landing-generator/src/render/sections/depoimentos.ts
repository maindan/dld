import type { Secao, SecaoItemData } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, iniciais, itemCampo, jsExpr } from "../utils";
import { avatar, sectionHeading, SECTION_CLOSE, sectionOpen, staggerStyle, varianteDe } from "./shared";

/**
 * Client quotes in 3 layout variants (contract: SECAO_BLOCKS.depoimentos):
 *
 *  - `grid`     — cards with a big accent quote mark, staggered entrance.
 *  - `marquee`  — fixed-width cards in continuous scroll rows (same
 *    `.marquee` machinery as the marcas block); 4+ quotes split into two
 *    counter-scrolling rows. Static wrapped rows under reduced motion.
 *  - `destaque` — one enormous centered featured quote per item.
 *
 * Every author renders a real photo when `imagemUrl` is set, initials over
 * the accent gradient otherwise (shared `avatar()` helper).
 */
function autorHtml(item: SecaoItemData, indicePadrao: number): string {
  const nome = itemCampo(item, "nome", `Cliente ${indicePadrao + 1}`);
  const cargo = itemCampo(item, "cargo", "");
  const imagemUrl = itemCampo(item, "imagemUrl", "");

  return `<div className="testimonial-author">
              ${avatar(imagemUrl, nome, iniciais(nome), "testimonial-avatar")}
              <div>
                <p className="testimonial-name">{${jsExpr(nome)}}</p>
                ${cargo ? `<p className="testimonial-role">{${jsExpr(cargo)}}</p>` : ""}
              </div>
            </div>`;
}

function cardHtml(item: SecaoItemData, i: number, comStagger: boolean): string {
  const texto = itemCampo(item, "texto", "");
  return `<div className="card testimonial"${comStagger ? staggerStyle(i) : ""}>
            <p className="testimonial-quote" aria-hidden="true">"</p>
            <p className="testimonial-text">{${jsExpr(texto)}}</p>
            ${autorHtml(item, i)}
          </div>`;
}

function renderMarquee(secao: Secao, design: ResolvedDesign, titulo: string, itens: SecaoItemData[]): string {
  // 4+ quotes: two counter-scrolling rows; fewer: a single row.
  const metade = itens.length >= 4 ? Math.ceil(itens.length / 2) : itens.length;
  const fileiras = itens.length >= 4 ? [itens.slice(0, metade), itens.slice(metade)] : [itens];

  const faixas = fileiras
    .map((fileira, f) => {
      const cards = fileira.map((item, i) => cardHtml(item, i, false)).join("\n              ");
      const grupo = (ariaHidden: boolean) => `<div className="marquee-group"${ariaHidden ? ` aria-hidden="true"` : ""}>
              ${cards}
            </div>`;
      return `<div className="marquee testimonials-marquee">
            <div className="marquee-track${f % 2 === 1 ? " marquee-track--reverse" : ""}">
              ${grupo(false)}
              ${grupo(true)}
            </div>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, design, "section-alt")}
        <div className="container">
          ${sectionHeading(titulo)}
          ${faixas}
        </div>
      ${SECTION_CLOSE}`;
}

function renderDestaque(secao: Secao, design: ResolvedDesign, titulo: string, itens: SecaoItemData[]): string {
  const citacoes = itens
    .map((item, i) => {
      const texto = itemCampo(item, "texto", "");
      return `<figure className="testimonial testimonial-featured">
            <p className="testimonial-quote" aria-hidden="true">"</p>
            <blockquote className="testimonial-featured-text">{${jsExpr(texto)}}</blockquote>
            ${autorHtml(item, i)}
          </figure>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, design, "section-alt")}
        <div className="container">
          ${sectionHeading(titulo)}
          ${citacoes}
        </div>
      ${SECTION_CLOSE}`;
}

export function renderDepoimentos(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "O que dizem nossos clientes");
  const itens = secao.itens ?? [];
  const variante = varianteDe(secao) || "grid";

  if (variante === "marquee") return renderMarquee(secao, design, titulo, itens);
  if (variante === "destaque") return renderDestaque(secao, design, titulo, itens);

  const cards = itens.map((item, i) => cardHtml(item, i, true)).join("\n          ");

  return `${sectionOpen(secao, design, "section-alt")}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="grid grid-3 stagger">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
