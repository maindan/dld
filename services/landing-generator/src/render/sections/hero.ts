import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, jsExpr } from "../utils";
import { heroAnimAttr, SECTION_CLOSE, sectionOpen, varianteDe } from "./shared";

/**
 * Hero in 3 layout variants (contract: SECAO_BLOCKS.hero.variantes):
 *
 *  - `centrado`  — optional pill badge, giant centered title with the last
 *    word in an accent gradient (background-clip: text), constrained
 *    subtitle, prominent CTA.
 *  - `split`     — copy on the left, media on the right: the `imagemUrl`
 *    field when present, otherwise an abstract browser-window mockup drawn
 *    entirely in CSS (dots bar + skeleton lines + blocks in theme colors).
 *  - `editorial` — enormous left-aligned typography (clamp up to 7.5rem),
 *    no card, hairline underneath, understated underlined CTA.
 *
 * The hero animates on page load (not on scroll): each child carries
 * `data-hero-anim` with a `--hd` order index for the 120ms stagger, and the
 * primary CTA pulses once. All of it disabled for `estiloAnimacao: "none"`
 * and behind prefers-reduced-motion.
 */
export function renderHero(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "Sua marca, do jeito certo");
  const subtitulo = campo(
    secao,
    "subtitulo",
    "Uma landing page pensada para transformar visitantes em clientes.",
  );
  const cta = campo(secao, "cta", "Fale conosco");
  const badge = campo(secao, "badge", "");
  const imagemUrl = campo(secao, "imagemUrl", "");
  const variante = varianteDe(secao) || "centrado";

  if (variante === "split") {
    return renderSplit(secao, design, { titulo, subtitulo, cta, badge, imagemUrl });
  }
  if (variante === "editorial") {
    return renderEditorial(secao, design, { titulo, subtitulo, cta, badge, imagemUrl });
  }
  return renderCentrado(secao, design, { titulo, subtitulo, cta, badge, imagemUrl });
}

/** Stacked hero image below the copy (centrado/editorial); "" when no imagemUrl. */
function heroMediaStack(design: ResolvedDesign, copy: HeroCopy, ordem: number): string {
  if (!copy.imagemUrl) return "";
  return `
          <div className="hero-media hero-media--stack"${heroAnimAttr(design, ordem)}>
            <img src={${jsExpr(copy.imagemUrl)}} alt={${jsExpr(copy.titulo)}} className="hero-media-img" />
          </div>`;
}

interface HeroCopy {
  titulo: string;
  subtitulo: string;
  cta: string;
  badge: string;
  imagemUrl?: string;
}

/**
 * Splits the title so its last word gets the accent gradient. The split is
 * done generator-side (deterministic) and both halves go through `jsExpr`,
 * so user copy is never interpolated raw into TSX.
 */
function tituloComGradiente(titulo: string): string {
  const palavras = titulo.trim().split(/\s+/);
  if (palavras.length <= 1) {
    return `<span className="hero-grad">{${jsExpr(titulo)}}</span>`;
  }
  const inicio = `${palavras.slice(0, -1).join(" ")} `;
  const ultima = palavras[palavras.length - 1]!;
  return `{${jsExpr(inicio)}}<span className="hero-grad">{${jsExpr(ultima)}}</span>`;
}

function badgeHtml(design: ResolvedDesign, badge: string): string {
  if (!badge) return "";
  return `<span className="hero-badge"${heroAnimAttr(design, 0)}>{${jsExpr(badge)}}</span>
          `;
}

function renderCentrado(secao: Secao, design: ResolvedDesign, copy: HeroCopy): string {
  return `${sectionOpen(secao, design, "hero hero--centrado", { reveal: false })}
        <div className="container hero-inner">
          ${badgeHtml(design, copy.badge)}<h1 className="hero-title"${heroAnimAttr(design, 1)}>${tituloComGradiente(copy.titulo)}</h1>
          <p className="hero-subtitle"${heroAnimAttr(design, 2)}>{${jsExpr(copy.subtitulo)}}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg hero-cta"${heroAnimAttr(design, 3)}>{${jsExpr(copy.cta)}}</button>
          </div>${heroMediaStack(design, copy, 4)}
        </div>
      ${SECTION_CLOSE}`;
}

/** CSS-drawn browser-window mockup for split heroes without an image — never an empty rectangle. */
const MOCKUP = `<div className="hero-mockup" aria-hidden="true">
              <div className="hero-mockup-bar"><span /><span /><span /></div>
              <div className="hero-mockup-body">
                <div className="mock-line mock-line--title" />
                <div className="mock-line" />
                <div className="mock-line mock-line--short" />
                <div className="mock-blocks">
                  <div className="mock-block" />
                  <div className="mock-block mock-block--accent" />
                  <div className="mock-block" />
                </div>
              </div>
            </div>`;

function renderSplit(secao: Secao, design: ResolvedDesign, copy: HeroCopy): string {
  const media = copy.imagemUrl
    ? `<img src={${jsExpr(copy.imagemUrl)}} alt={${jsExpr(copy.titulo)}} className="hero-media-img" />`
    : MOCKUP;

  return `${sectionOpen(secao, design, "hero hero--split", { reveal: false })}
        <div className="container hero-inner">
          <div>
            ${badgeHtml(design, copy.badge)}<h1 className="hero-title"${heroAnimAttr(design, 1)}>${tituloComGradiente(copy.titulo)}</h1>
            <p className="hero-subtitle"${heroAnimAttr(design, 2)}>{${jsExpr(copy.subtitulo)}}</p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary btn-lg hero-cta"${heroAnimAttr(design, 3)}>{${jsExpr(copy.cta)}}</button>
            </div>
          </div>
          <div className="hero-media"${heroAnimAttr(design, 2)}>
            ${media}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}

function renderEditorial(secao: Secao, design: ResolvedDesign, copy: HeroCopy): string {
  const eyebrow = copy.badge
    ? `<span className="hero-eyebrow"${heroAnimAttr(design, 0)}>{${jsExpr(copy.badge)}}</span>
          `
    : "";

  return `${sectionOpen(secao, design, "hero hero--editorial", { reveal: false })}
        <div className="container hero-inner">
          ${eyebrow}<h1 className="hero-title hero-title--editorial"${heroAnimAttr(design, 1)}>{${jsExpr(copy.titulo)}}</h1>
          <p className="hero-subtitle"${heroAnimAttr(design, 2)}>{${jsExpr(copy.subtitulo)}}</p>
          <button type="button" className="hero-cta-link"${heroAnimAttr(design, 3)}>{${jsExpr(copy.cta)}}<span aria-hidden="true">{" \\u2192"}</span></button>${heroMediaStack(design, copy, 4)}
          <div className="hero-hairline" aria-hidden="true" />
        </div>
      ${SECTION_CLOSE}`;
}
