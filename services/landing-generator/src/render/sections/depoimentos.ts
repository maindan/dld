import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, iniciais, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen } from "./shared";

/** Cards of client quotes, one per `secao.itens` entry (nome/cargo/texto). */
export function renderDepoimentos(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", "O que dizem nossos clientes");
  const itens = secao.itens ?? [];

  const cards = itens
    .map((item) => {
      const nome = itemCampo(item, "nome", "Cliente satisfeito");
      const cargo = itemCampo(item, "cargo", "");
      const texto = itemCampo(item, "texto", "");
      return `<div className="card testimonial">
            <p className="testimonial-quote" aria-hidden="true">"</p>
            <p className="testimonial-text">{${jsExpr(texto)}}</p>
            <div className="testimonial-author">
              <span className="testimonial-avatar">{${jsExpr(iniciais(nome))}}</span>
              <div>
                <p className="testimonial-name">{${jsExpr(nome)}}</p>
                ${cargo ? `<p className="testimonial-role">{${jsExpr(cargo)}}</p>` : ""}
              </div>
            </div>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, theme, "section-alt")}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="grid grid-3">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
