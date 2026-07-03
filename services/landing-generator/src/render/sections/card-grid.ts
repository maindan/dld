import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, itemCampo, jsExpr } from "../utils";
import { sectionHeading, SECTION_CLOSE, sectionOpen } from "./shared";

/**
 * Grid of cards driven by `secao.itens` — shared by "servicos" and
 * "diferenciais" (same shape: titulo/texto per item, only the section
 * default title differs). Each card gets a numbered badge in the accent
 * color as a lightweight icon stand-in (no image asset in the contract).
 */
function renderCardGrid(secao: Secao, theme: LandingPageTheme, tituloPadrao: string): string {
  const titulo = campo(secao, "titulo", tituloPadrao);
  const itens = secao.itens ?? [];

  const cards = itens
    .map((item, i) => {
      const itemTitulo = itemCampo(item, "titulo", `Item ${i + 1}`);
      const itemTexto = itemCampo(item, "texto", "");
      return `<div className="card">
            <span className="card-icon">{${jsExpr(String(i + 1).padStart(2, "0"))}}</span>
            <h3 className="card-title">{${jsExpr(itemTitulo)}}</h3>
            <p className="card-text">{${jsExpr(itemTexto)}}</p>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, theme)}
        <div className="container">
          ${sectionHeading(titulo)}
          <div className="grid grid-3">
            ${cards}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}

export function renderServicos(secao: Secao, theme: LandingPageTheme): string {
  return renderCardGrid(secao, theme, "Nossos serviços");
}

export function renderDiferenciais(secao: Secao, theme: LandingPageTheme): string {
  return renderCardGrid(secao, theme, "Por que nos escolher");
}
