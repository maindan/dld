import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, jsExpr } from "../utils";
import { renderAgenda } from "./agenda";
import { renderServicos, renderDiferenciais } from "./card-grid";
import { renderCta } from "./cta";
import { renderDepoimentos } from "./depoimentos";
import { renderEquipe } from "./equipe";
import { renderEstatisticas } from "./estatisticas";
import { renderFaq } from "./faq";
import { renderFormulario } from "./formulario";
import { renderGaleria } from "./galeria";
import { renderHabilidades } from "./habilidades";
import { renderHero } from "./hero";
import { renderMarcas } from "./marcas";
import { renderPrecos } from "./precos";
import { SECTION_CLOSE, sectionOpen } from "./shared";
import { renderContato, renderSobre } from "./text-block";

/**
 * One renderer per entry of `SECAO_BLOCKS` (packages/contracts/src/landing-page.ts).
 * `formulario` is the only one that needs data from outside its own `secao`
 * (the footer's e-mail, as the `mailto:` destination), so every renderer
 * takes the same `(secao, design, footerEmail)` signature for a uniform
 * dispatch table even though only one implementation uses the third arg.
 */
const SECTION_RENDERERS: Record<string, (secao: Secao, design: ResolvedDesign, footerEmail: string) => string> = {
  hero: (secao, design) => renderHero(secao, design),
  sobre: (secao, design) => renderSobre(secao, design),
  servicos: (secao, design) => renderServicos(secao, design),
  diferenciais: (secao, design) => renderDiferenciais(secao, design),
  estatisticas: (secao, design) => renderEstatisticas(secao, design),
  marcas: (secao, design) => renderMarcas(secao, design),
  depoimentos: (secao, design) => renderDepoimentos(secao, design),
  precos: (secao, design) => renderPrecos(secao, design),
  faq: (secao, design) => renderFaq(secao, design),
  equipe: (secao, design) => renderEquipe(secao, design),
  agenda: (secao, design) => renderAgenda(secao, design),
  galeria: (secao, design) => renderGaleria(secao, design),
  habilidades: (secao, design) => renderHabilidades(secao, design),
  formulario: (secao, design, footerEmail) => renderFormulario(secao, design, footerEmail),
  contato: (secao, design) => renderContato(secao, design),
  cta: (secao, design) => renderCta(secao, design),
};

/** Generic fallback for a `tipo` outside the 15-block catalog — renders whatever fields exist instead of silently dropping the section. */
function renderGenerico(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", secao.tipo);
  const camposRestantes = Object.entries(secao.campos).filter(([chave]) => chave !== "titulo");

  const corpo = camposRestantes
    .map(([, valor]) => (valor.trim() ? `<p className="section-lead">{${jsExpr(valor)}}</p>` : ""))
    .filter(Boolean)
    .join("\n          ");

  return `${sectionOpen(secao, design)}
        <div className="container section-narrow">
          <h2 className="section-title">{${jsExpr(titulo)}}</h2>
          ${corpo}
        </div>
      ${SECTION_CLOSE}`;
}

export function renderSection(secao: Secao, design: ResolvedDesign, footerEmail: string): string {
  const renderer = SECTION_RENDERERS[secao.tipo];
  if (!renderer) return renderGenerico(secao, design);
  return renderer(secao, design, footerEmail);
}

export { SECTION_RENDERERS };
