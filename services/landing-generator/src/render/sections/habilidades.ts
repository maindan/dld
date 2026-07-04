import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, itemCampo, jsExpr, nivelPercentual } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen } from "./shared";

/** Progress bars, one per skill, width proportional to the `nivel` field (0-100). */
export function renderHabilidades(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "Habilidades");
  const itens = secao.itens ?? [];

  const rows = itens
    .map((item, i) => {
      const nome = itemCampo(item, "nome", `Habilidade ${i + 1}`);
      const nivel = nivelPercentual(itemCampo(item, "nivel", ""));
      return `<div className="skill-row">
            <div className="skill-label">
              <span>{${jsExpr(nome)}}</span>
              <span className="skill-level">{${jsExpr(`${nivel}%`)}}</span>
            </div>
            <div className="skill-track">
              <div className="skill-fill" style={{ "--w": ${jsExpr(`${nivel}%`)} }} />
            </div>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, design)}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="skills-list">
            ${rows}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
