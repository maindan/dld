import type { ResolvedDesign } from "./resolve-design";

/**
 * Available weights per curated family (FONTE_PAIRINGS in the contract plus
 * the theme defaults). The Google Fonts css2 endpoint 400s when a requested
 * weight doesn't exist for the family — Archivo Black only ships 400, Space
 * Grotesk stops at 700 — so each family requests only what it really has.
 */
const FAMILY_WEIGHTS: Record<string, string> = {
  Inter: "400;500;600;700;800",
  "Space Grotesk": "400;500;600;700",
  Fraunces: "400;500;600;700;800;900",
  "Playfair Display": "400;500;600;700;800;900",
  "Archivo Black": "400",
  "Source Serif 4": "400;500;600;700;800;900",
  Sora: "400;500;600;700;800",
  Syne: "400;500;600;700;800",
  Manrope: "400;500;600;700;800",
  "Bricolage Grotesque": "400;500;600;700;800",
};

const DEFAULT_WEIGHTS = "400;500;600;700";

/** Families that should fall back to a serif stack instead of sans-serif. */
const SERIF_FAMILIES = new Set(["Fraunces", "Playfair Display", "Source Serif 4"]);

function weightsFor(familia: string): string {
  return FAMILY_WEIGHTS[familia.trim()] ?? DEFAULT_WEIGHTS;
}

/**
 * Builds the Google Fonts CSS2 stylesheet URL for the resolved title + body
 * fonts (deduped when they're the same family), e.g. for the "produto"
 * theme (Space Grotesk / Inter):
 *   https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap
 */
export function buildGoogleFontsHref(design: ResolvedDesign): string {
  const familias = Array.from(new Set([design.fonteTitulo, design.fonteCorpo]));
  const query = familias
    .map((familia) => `family=${familia.trim().replace(/\s+/g, "+")}:wght@${weightsFor(familia)}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

/** CSS `font-family` value with a generic fallback stack, quoting the Google Fonts name. */
export function fontFamilyCss(familia: string): string {
  if (SERIF_FAMILIES.has(familia.trim())) {
    return `'${familia}', Georgia, 'Times New Roman', serif`;
  }
  return `'${familia}', ui-sans-serif, system-ui, -apple-system, sans-serif`;
}
