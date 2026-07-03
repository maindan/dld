import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, iniciais, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen } from "./shared";

/** Grid of team members: initials avatar (no photo field in the contract) + nome/cargo. */
export function renderEquipe(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", "Nosso time");
  const itens = secao.itens ?? [];

  const cards = itens
    .map((item, i) => {
      const nome = itemCampo(item, "nome", `Pessoa ${i + 1}`);
      const cargo = itemCampo(item, "cargo", "");
      return `<div className="card team-card">
            <span className="team-avatar">{${jsExpr(iniciais(nome))}}</span>
            <p className="team-name">{${jsExpr(nome)}}</p>
            ${cargo ? `<p className="team-role">{${jsExpr(cargo)}}</p>` : ""}
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, theme)}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="grid grid-4">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
