import { SECAO_BLOCKS, type Secao } from "@danlimadev/contracts";
import { temAnimacaoDeEntrada } from "../animation";
import type { ResolvedDesign } from "../resolve-design";
import { escapeAttr, jsExpr } from "../utils";

/**
 * Opening `<section>` tag shared by every block renderer: gives the section
 * its DOM `id` (so header nav `#anchor` links resolve — required by the
 * contract), the shared `.section` primitive plus any block-specific class,
 * and `data-reveal` when the design wants the scroll-in animation. The hero
 * opts out of `data-reveal` (`reveal: false`) — it animates on page load via
 * `data-hero-anim`, not on scroll.
 */
export function sectionOpen(
  secao: Secao,
  design: ResolvedDesign,
  extraClass = "",
  opts: { reveal?: boolean } = {},
): string {
  const classes = ["section", extraClass].filter(Boolean).join(" ");
  const reveal = opts.reveal ?? true;
  const revealAttr = reveal && temAnimacaoDeEntrada(design) ? " data-reveal" : "";
  return `<section id={${jsExpr(secao.id)}} className="${classes}"${revealAttr}>`;
}

export const SECTION_CLOSE = "</section>";

/** Shared heading block: a title + optional lead paragraph. */
export function sectionHeading(titulo: string, lead?: string): string {
  const leadHtml = lead ? `\n        <p className="section-lead">{${jsExpr(lead)}}</p>` : "";
  return `<div className="section-header">
        <h2 className="section-title">{${jsExpr(titulo)}}</h2>${leadHtml}
      </div>`;
}

/**
 * Resolves the layout variant for a section: the requested `secao.variante`
 * when it exists in the block's registered `variantes`, otherwise the
 * block's first (default) variant, otherwise "" for blocks without variants.
 * Unknown/typo'd variant ids therefore degrade to the default layout instead
 * of breaking the render.
 */
export function varianteDe(secao: Secao): string {
  const variantes = SECAO_BLOCKS[secao.tipo]?.variantes;
  if (!variantes || variantes.length === 0) return "";
  if (secao.variante && variantes.some((v) => v.id === secao.variante)) return secao.variante;
  return variantes[0]!.id;
}

/**
 * Inline `--i` custom property used by the stagger CSS
 * (`animation-delay: calc(70ms * var(--i))`). Custom `--*` keys in `style`
 * are liberadas pela augmentação `css-custom-properties.d.ts` do skeleton —
 * sem ela o csstype dos types do React rejeita a chave no typecheck do
 * projeto gerado.
 */
export function staggerStyle(i: number): string {
  return ` style={{ "--i": ${i} }}`;
}

/** `data-hero-anim` + entrance order for hero children; "" when animations are off. */
export function heroAnimAttr(design: ResolvedDesign, ordem: number): string {
  if (!temAnimacaoDeEntrada(design)) return "";
  return ` data-hero-anim style={{ "--hd": ${ordem} }}`;
}

/**
 * Round avatar: a real `<img>` when the item has an `imagemUrl`, otherwise
 * initials over the theme's accent gradient. Shared by depoimentos + equipe.
 */
export function avatar(imagemUrl: string, nome: string, iniciaisTexto: string, classBase: string): string {
  if (imagemUrl) {
    return `<img src={${jsExpr(imagemUrl)}} alt={${jsExpr(nome)}} className="${classBase}-img" loading="lazy" />`;
  }
  return `<span className="${classBase}" aria-hidden="true">{${jsExpr(iniciaisTexto)}}</span>`;
}

export { escapeAttr };
