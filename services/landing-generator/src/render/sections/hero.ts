import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, jsExpr } from "../utils";
import { SECTION_CLOSE, sectionOpen } from "./shared";

/** Hero: big title + subtitle + CTA button, near full viewport height. */
export function renderHero(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", "Sua marca, do jeito certo");
  const subtitulo = campo(
    secao,
    "subtitulo",
    "Uma landing page pensada para transformar visitantes em clientes.",
  );
  const cta = campo(secao, "cta", "Fale conosco");

  return `${sectionOpen(secao, theme, "hero")}
        <div className="container hero-inner">
          <h1 className="hero-title">{${jsExpr(titulo)}}</h1>
          <p className="hero-subtitle">{${jsExpr(subtitulo)}}</p>
          <button type="button" className="btn btn-primary">{${jsExpr(cta)}}</button>
        </div>
      ${SECTION_CLOSE}`;
}
