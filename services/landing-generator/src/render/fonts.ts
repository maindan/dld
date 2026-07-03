import type { LandingPageTheme } from "../models";

const WEIGHTS = "400;500;600;700;800";

/**
 * Builds the Google Fonts CSS2 stylesheet URL for a theme's title + body
 * fonts (deduped when they're the same family), e.g. for the "produto"
 * theme (Space Grotesk / Inter):
 *   https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap
 */
export function buildGoogleFontsHref(theme: LandingPageTheme): string {
  const familias = Array.from(new Set([theme.fonteTitulo, theme.fonteCorpo]));
  const query = familias
    .map((familia) => `family=${familia.trim().replace(/\s+/g, "+")}:wght@${WEIGHTS}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

/** CSS `font-family` value with a generic fallback stack, quoting the Google Fonts name. */
export function fontFamilyCss(familia: string): string {
  return `'${familia}', ui-sans-serif, system-ui, -apple-system, sans-serif`;
}
