import type { GerarLandingPageInput } from "@danlimadev/contracts";
import { jsExpr } from "./utils";

type FooterConfig = GerarLandingPageInput["footer"];

/** Small generic (non brand-specific) share/link glyph, inline so no icon lib is needed. */
const SOCIAL_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: 6, verticalAlign: "-2px" }}><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 1 0-7.07-7.07L11.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L12.5 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>`;

function renderInfoColumn(footer: FooterConfig): string {
  const linhas: string[] = [];
  if (footer.endereco.trim()) linhas.push(`<p className="site-footer__line">{${jsExpr(footer.endereco)}}</p>`);
  if (footer.telefone.trim()) linhas.push(`<p className="site-footer__line">{${jsExpr(footer.telefone)}}</p>`);
  if (footer.email.trim()) linhas.push(`<p className="site-footer__line">{${jsExpr(footer.email)}}</p>`);
  if (linhas.length === 0) return "";
  return `<div>
            <p className="site-footer__heading">Contato</p>
            ${linhas.join("\n            ")}
          </div>`;
}

function renderRedesSociais(footer: FooterConfig): string {
  if (footer.redesSociais.length === 0) return "";
  const links = footer.redesSociais
    .map(
      (rede) =>
        `<a href={${jsExpr(rede.url)}} target="_blank" rel="noopener noreferrer">${SOCIAL_ICON}{${jsExpr(`${rede.rede}: ${rede.url}`)}}</a>`,
    )
    .join("\n              ");
  return `<div>
            <p className="site-footer__heading">Redes sociais</p>
            <div className="site-footer__social">
              ${links}
            </div>
          </div>`;
}

/**
 * Footer rich in content (address/phone/email/social) but light in markup —
 * a 2/3-column grid (CSS handles collapsing to 1 column on mobile) plus a
 * copyright bar. Visual weight (background/border color) comes entirely
 * from the theme's CSS variables, so a dark theme's footer reads dark
 * without any conditional branching here.
 */
export function renderFooter(footer: FooterConfig): string {
  const infoColuna = renderInfoColumn(footer);
  const socialColuna = renderRedesSociais(footer);
  const colunas = [infoColuna, socialColuna].filter(Boolean);

  return `<footer className="site-footer" id="rodape">
        <div className="container">
          ${colunas.length > 0 ? `<div className="site-footer__grid">
            ${colunas.join("\n            ")}
          </div>` : ""}
          <div className="site-footer__bottom">
            <p>© {new Date().getFullYear()} — {${jsExpr(footer.texto)}}</p>
          </div>
        </div>
      </footer>`;
}
