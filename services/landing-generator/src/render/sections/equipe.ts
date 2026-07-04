import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, iniciais, itemCampo, jsExpr } from "../utils";
import { avatar, sectionHeading, SECTION_CLOSE, sectionOpen, staggerStyle } from "./shared";

/** Grid of team members: real photo when `imagemUrl` is set, initials avatar otherwise. */
export function renderEquipe(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "Nosso time");
  const itens = secao.itens ?? [];

  const cards = itens
    .map((item, i) => {
      const nome = itemCampo(item, "nome", `Pessoa ${i + 1}`);
      const cargo = itemCampo(item, "cargo", "");
      const imagemUrl = itemCampo(item, "imagemUrl", "");
      return `<div className="card team-card"${staggerStyle(i)}>
            ${avatar(imagemUrl, nome, iniciais(nome), "team-avatar")}
            <p className="team-name">{${jsExpr(nome)}}</p>
            ${cargo ? `<p className="team-role">{${jsExpr(cargo)}}</p>` : ""}
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, design)}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="grid grid-4 stagger">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
