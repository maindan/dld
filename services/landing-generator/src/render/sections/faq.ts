import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen } from "./shared";

/** Native `<details>/<summary>` accordion — zero JS needed for the toggle. */
export function renderFaq(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", "Perguntas frequentes");
  const itens = secao.itens ?? [];

  const items = itens
    .map((item, i) => {
      const pergunta = itemCampo(item, "pergunta", `Pergunta ${i + 1}`);
      const resposta = itemCampo(item, "resposta", "");
      return `<details className="faq-item">
              <summary>{${jsExpr(pergunta)}}</summary>
              <p className="faq-answer">{${jsExpr(resposta)}}</p>
            </details>`;
    })
    .join("\n            ");

  return `${sectionOpen(secao, theme, "section-alt")}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="faq-list">
            ${items}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
