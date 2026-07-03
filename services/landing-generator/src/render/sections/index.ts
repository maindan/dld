import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, jsExpr } from "../utils";
import { renderAgenda } from "./agenda";
import { renderServicos, renderDiferenciais } from "./card-grid";
import { renderCta } from "./cta";
import { renderDepoimentos } from "./depoimentos";
import { renderEquipe } from "./equipe";
import { renderFaq } from "./faq";
import { renderFormulario } from "./formulario";
import { renderGaleria } from "./galeria";
import { renderHabilidades } from "./habilidades";
import { renderHero } from "./hero";
import { renderPrecos } from "./precos";
import { SECTION_CLOSE, sectionOpen } from "./shared";
import { renderContato, renderSobre } from "./text-block";

/**
 * One renderer per entry of `SECAO_BLOCKS` (packages/contracts/src/landing-page.ts).
 * `formulario` is the only one that needs data from outside its own `secao`
 * (the footer's e-mail, as the `mailto:` destination), so every renderer
 * takes the same `(secao, theme, footerEmail)` signature for a uniform
 * dispatch table even though only one implementation uses the third arg.
 */
const SECTION_RENDERERS: Record<string, (secao: Secao, theme: LandingPageTheme, footerEmail: string) => string> = {
  hero: (secao, theme) => renderHero(secao, theme),
  sobre: (secao, theme) => renderSobre(secao, theme),
  servicos: (secao, theme) => renderServicos(secao, theme),
  diferenciais: (secao, theme) => renderDiferenciais(secao, theme),
  depoimentos: (secao, theme) => renderDepoimentos(secao, theme),
  precos: (secao, theme) => renderPrecos(secao, theme),
  faq: (secao, theme) => renderFaq(secao, theme),
  equipe: (secao, theme) => renderEquipe(secao, theme),
  agenda: (secao, theme) => renderAgenda(secao, theme),
  galeria: (secao, theme) => renderGaleria(secao, theme),
  habilidades: (secao, theme) => renderHabilidades(secao, theme),
  formulario: (secao, theme, footerEmail) => renderFormulario(secao, theme, footerEmail),
  contato: (secao, theme) => renderContato(secao, theme),
  cta: (secao, theme) => renderCta(secao, theme),
};

/** Generic fallback for a `tipo` outside the 13-block catalog — renders whatever fields exist instead of silently dropping the section. */
function renderGenerico(secao: Secao, theme: LandingPageTheme): string {
  const titulo = campo(secao, "titulo", secao.tipo);
  const camposRestantes = Object.entries(secao.campos).filter(([chave]) => chave !== "titulo");

  const corpo = camposRestantes
    .map(([, valor]) => (valor.trim() ? `<p className="section-lead">{${jsExpr(valor)}}</p>` : ""))
    .filter(Boolean)
    .join("\n          ");

  return `${sectionOpen(secao, theme)}
        <div className="container section-narrow">
          <h2 className="section-title">{${jsExpr(titulo)}}</h2>
          ${corpo}
        </div>
      ${SECTION_CLOSE}`;
}

export function renderSection(secao: Secao, theme: LandingPageTheme, footerEmail: string): string {
  const renderer = SECTION_RENDERERS[secao.tipo];
  if (!renderer) return renderGenerico(secao, theme);
  return renderer(secao, theme, footerEmail);
}

export { SECTION_RENDERERS };
