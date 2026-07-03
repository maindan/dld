import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { temAnimacaoDeEntrada } from "../animation";
import { jsExpr } from "../utils";

/**
 * Opening `<section>` tag shared by every block renderer: gives the section
 * its DOM `id` (so header nav `#anchor` links resolve — required by the
 * contract), the shared `.section` primitive plus any block-specific class,
 * and `data-reveal` when the theme wants the scroll-in animation.
 */
export function sectionOpen(secao: Secao, theme: LandingPageTheme, extraClass = ""): string {
  const classes = ["section", extraClass].filter(Boolean).join(" ");
  const revealAttr = temAnimacaoDeEntrada(theme) ? " data-reveal" : "";
  return `<section id={${jsExpr(secao.id)}} className="${classes}"${revealAttr}>`;
}

export const SECTION_CLOSE = "</section>";

/** Shared "eyebrow-less" heading block: a title + optional lead paragraph. */
export function sectionHeading(titulo: string, lead?: string): string {
  const leadHtml = lead ? `\n        <p className="section-lead">{${jsExpr(lead)}}</p>` : "";
  return `<div className="section-header">
        <h2 className="section-title">{${jsExpr(titulo)}}</h2>${leadHtml}
      </div>`;
}
