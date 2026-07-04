import { slugify, type GerarLandingPageInput } from "@danlimadev/contracts";
import { LANDING_PAGE_MODELS, type LandingPageTheme } from "../models";
import { buildCounterScript, buildHeaderScrollScript, buildRevealScript } from "./animation";
import { renderBackgroundDecor } from "./backgrounds";
import { buildGoogleFontsHref } from "./fonts";
import { renderFooter } from "./footer";
import { renderHeader } from "./header";
import { resolveDesign, type ResolvedDesign } from "./resolve-design";
import { renderSection } from "./sections";
import { buildGlobalsCss } from "./theme-css";
import { jsExpr } from "./utils";
import { renderWhatsappButton } from "./whatsapp";

export interface RenderedProject {
  slug: string;
  pageTsx: string;
  layoutTsx: string;
  globalsCss: string;
}

export function getTheme(modeloId: string): LandingPageTheme {
  const theme = LANDING_PAGE_MODELS.find((modelo) => modelo.id === modeloId);
  if (!theme) {
    throw new Error(`Modelo de landing page desconhecido: "${modeloId}"`);
  }
  return theme;
}

/**
 * Renders the 3 files that actually vary per generated project — everything
 * else lives untouched in `src/skeleton/`. This is the single place that
 * assembles header + every dynamic section + footer + the WhatsApp float
 * button + the scroll-reveal script into one real `app/page.tsx`, plus the
 * theme's `app/layout.tsx` (fonts, `<html>/<body>`) and `app/globals.css`.
 */
export function renderProject(input: GerarLandingPageInput): RenderedProject {
  const theme = getTheme(input.modeloId);
  const design = resolveDesign(theme, input.corAcento, input.design);
  const slug = slugify(input.header.titulo) || slugify(input.modeloId) || "landing-page";

  const decorHtml = renderBackgroundDecor(design);
  const headerHtml = renderHeader(input.header, design);
  const sectionsHtml = input.secoes
    .map((secao) => renderSection(secao, design, input.footer.email))
    .join("\n\n      ");
  const footerHtml = renderFooter(input.footer);
  const whatsappHtml = renderWhatsappButton(input.whatsapp);

  // Counter script only ships when there's a stats block to animate.
  const temEstatisticas = input.secoes.some((secao) => secao.tipo === "estatisticas");
  const scripts = [
    buildHeaderScrollScript(design),
    buildRevealScript(design),
    temEstatisticas ? buildCounterScript() : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    slug,
    pageTsx: buildPageTsx({ decorHtml, headerHtml, sectionsHtml, footerHtml, whatsappHtml, scripts }),
    layoutTsx: buildLayoutTsx(design, input.header.titulo || slug),
    globalsCss: buildGlobalsCss(design),
  };
}

interface PageParts {
  decorHtml: string;
  headerHtml: string;
  sectionsHtml: string;
  footerHtml: string;
  whatsappHtml: string;
  scripts: string;
}

function buildPageTsx(parts: PageParts): string {
  // The reveal + header-scroll scripts are plain vanilla JS (no framework
  // hook needed), so they're shipped as a literal <script> tag rather than
  // a "use client" component. `jsExpr` here embeds the *script's own source
  // code* as a safely-escaped JS string literal inside the generated
  // page.tsx file — same trick as embedding user copy, just applied to JS
  // instead of text.
  const scriptTag = parts.scripts
    ? `\n      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ${jsExpr(parts.scripts)} }} />`
    : "";

  const decor = parts.decorHtml ? `\n      ${parts.decorHtml}\n` : "";

  return `export default function Page() {
  return (
    <main id="topo">${decor}
      ${parts.headerHtml}

      ${parts.sectionsHtml}

      ${parts.footerHtml}

      ${parts.whatsappHtml}${scriptTag}
    </main>
  );
}
`;
}

function buildLayoutTsx(design: ResolvedDesign, title: string): string {
  const fontsHref = buildGoogleFontsHref(design);
  return `import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: ${jsExpr(title)},
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href=${jsExpr(fontsHref)} />
      </head>
      <body>{children}</body>
    </html>
  );
}
`;
}
