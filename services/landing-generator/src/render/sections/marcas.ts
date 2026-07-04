import type { Secao, SecaoItemData } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, itemCampo, jsExpr } from "../utils";
import { SECTION_CLOSE, sectionOpen } from "./shared";

/**
 * Social-proof logo strip in continuous marquee scroll. Pure CSS animation
 * (`.marquee-track` in theme-css.ts) — the track holds the logo group twice,
 * the aria-hidden clone providing the seamless loop. On
 * `prefers-reduced-motion` the clone is hidden and the real group wraps into
 * a static centered row, so no visitor ever depends on the motion.
 */
function renderMarca(item: SecaoItemData, indice: number): string {
  const nome = itemCampo(item, "nome", `Marca ${indice + 1}`);
  const imagemUrl = itemCampo(item, "imagemUrl", "");
  if (imagemUrl) {
    return `<img src={${jsExpr(imagemUrl)}} alt={${jsExpr(nome)}} className="marca-logo" loading="lazy" />`;
  }
  return `<span className="marca-nome">{${jsExpr(nome)}}</span>`;
}

export function renderMarcas(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "");
  const itens = secao.itens ?? [];

  const logos = itens.map(renderMarca).join("\n              ");
  const grupo = (ariaHidden: boolean) => `<div className="marquee-group"${ariaHidden ? ` aria-hidden="true"` : ""}>
              ${logos}
            </div>`;

  return `${sectionOpen(secao, design, "marcas-section")}
        <div className="container">
          ${titulo ? `<p className="marcas-title">{${jsExpr(titulo)}}</p>` : ""}
          <div className="marquee">
            <div className="marquee-track">
              ${grupo(false)}
              ${grupo(true)}
            </div>
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
