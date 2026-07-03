import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, jsExpr } from "../utils";
import { SECTION_CLOSE, sectionOpen } from "./shared";

/** Full-width highlighted band closing out the page with one last CTA. */
export function renderCta(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", "Pronto para começar?");
  const subtitulo = campo(secao, "subtitulo", "Fale com a gente agora mesmo.");
  const cta = campo(secao, "cta", "Entrar em contato");

  return `${sectionOpen(secao, theme, "cta-band")}
        <div className="container">
          <h2 className="section-title" style={{ marginInline: "auto" }}>{${jsExpr(titulo)}}</h2>
          <p className="section-lead" style={{ marginInline: "auto" }}>{${jsExpr(subtitulo)}}</p>
          <div style={{ marginTop: 32 }}>
            <button type="button" className="btn btn-primary">{${jsExpr(cta)}}</button>
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
