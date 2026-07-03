import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen } from "./shared";

/** Chronological list — horario badge + titulo + descricao, for event schedules. */
export function renderAgenda(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", "Programação");
  const itens = secao.itens ?? [];

  const items = itens
    .map((item, i) => {
      const horario = itemCampo(item, "horario", "--:--");
      const itemTitulo = itemCampo(item, "titulo", `Atividade ${i + 1}`);
      const descricao = itemCampo(item, "descricao", "");
      return `<div className="agenda-item">
            <span className="agenda-time">{${jsExpr(horario)}}</span>
            <div>
              <p className="agenda-title">{${jsExpr(itemTitulo)}}</p>
              ${descricao ? `<p className="agenda-desc">{${jsExpr(descricao)}}</p>` : ""}
            </div>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, theme, "section-alt")}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="agenda-list">
            ${items}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
