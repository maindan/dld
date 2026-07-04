import type { GerarLandingPageInput } from "@danlimadev/contracts";
import type { ResolvedDesign } from "./resolve-design";
import { jsExpr } from "./utils";

type HeaderConfig = GerarLandingPageInput["header"];

function navHref(secaoId: string): string {
  if (secaoId === "topo") return "#topo";
  if (secaoId === "rodape") return "#rodape";
  return `#${secaoId}`;
}

function renderLogo(header: HeaderConfig, corAcento: string): string {
  if (!header.mostrarLogo) return "";
  if (header.logoUrl) {
    return `<img src={${jsExpr(header.logoUrl)}} alt="Logo" className="site-header__logo-img" />`;
  }
  // No logoUrl but mostrarLogo=true: a colored block using the accent color
  // stands in for the logo so the header layout never breaks.
  return `<span className="site-header__logo-fallback" style={{ background: ${jsExpr(corAcento)} }} aria-hidden="true" />`;
}

function renderTitulo(header: HeaderConfig): string {
  if (!header.mostrarTitulo || !header.titulo.trim()) return "";
  return `<span>{${jsExpr(header.titulo)}}</span>`;
}

function renderNav(header: HeaderConfig): string {
  if (header.navItems.length === 0) return "";
  const links = header.navItems
    .map(
      (item) =>
        `<a href={${jsExpr(navHref(item.secaoId))}}>{${jsExpr(item.label)}}</a>`,
    )
    .join("\n          ");
  return `<nav className="site-header__nav">
          ${links}
        </nav>`;
}

/**
 * Renders one of the 4 `estiloHeader` variants (real, distinct CSS classes
 * defined in `theme-css.ts` — this function only decides which class and
 * which pieces of `header` to include). `[data-site-header]` is the hook the
 * scroll script (`buildHeaderScrollScript`) toggles `.is-scrolled` on.
 */
export function renderHeader(header: HeaderConfig, design: ResolvedDesign): string {
  const logo = renderLogo(header, design.corAcento);
  const titulo = renderTitulo(header);
  const nav = renderNav(header);
  const brand =
    logo || titulo
      ? `<div className="site-header__brand">
          ${[logo, titulo].filter(Boolean).join("\n          ")}
        </div>`
      : "";

  return `<header className="site-header site-header--${design.estiloHeader}" data-site-header>
        <div className="container">
          ${brand}
          ${nav}
        </div>
      </header>`;
}
