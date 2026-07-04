import type { Secao } from "@danlimadev/contracts";
import type { ResolvedDesign } from "../resolve-design";
import { campo, itemCampo, jsExpr } from "../utils";
import { escapeAttr, sectionHeading, SECTION_CLOSE, sectionOpen, staggerStyle } from "./shared";

interface ValorNumerico {
  /** Machine value for `data-target` (dot decimal separator). */
  target: string;
  /** Fraction digits, so 4,8 animates as 0,0 → 4,8 and 120 stays integer. */
  decimals: number;
  /** pt-BR formatted final value — the static content (no-JS / reduced motion). */
  display: string;
}

/**
 * Parses the free-typed "valor" field into a countable number. Accepts plain
 * integers ("120", "1200") and one decimal separator, comma or dot ("4,8" /
 * "4.8"). Anything else (e.g. "24/7") is rendered as a literal, without the
 * counter. Deterministic generator-side work — the client script only eases
 * from 0 to `data-target`.
 */
export function parseValorEstatistica(valor: string): ValorNumerico | null {
  const s = valor.trim();
  const m = /^(\d+)(?:[.,](\d+))?$/.exec(s);
  if (!m) return null;
  const inteiro = m[1]!;
  const fracao = m[2] ?? "";
  const decimals = fracao.length;
  const target = fracao ? `${inteiro}.${fracao}` : inteiro;
  const display = Number.parseFloat(target).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return { target, decimals, display };
}

/**
 * Big impact numbers (title font, accent color) with a vanilla-JS count-up
 * from 0 when the section enters the viewport (~1.2s ease-out — see
 * `buildCounterScript`). The final formatted value ships as the static
 * content, so `prefers-reduced-motion` and no-JS visitors see the number
 * immediately; the script only animates where motion is welcome.
 */
export function renderEstatisticas(secao: Secao, design: ResolvedDesign): string {
  const titulo = campo(secao, "titulo", "");
  const itens = secao.itens ?? [];

  const stats = itens
    .map((item, i) => {
      const valor = itemCampo(item, "valor", "0");
      const sufixo = itemCampo(item, "sufixo", "");
      const label = itemCampo(item, "label", "");
      const parsed = parseValorEstatistica(valor);

      const valorHtml = parsed
        ? `<span data-counter data-target="${escapeAttr(parsed.target)}" data-decimals="${parsed.decimals}">{${jsExpr(parsed.display)}}</span>`
        : `<span>{${jsExpr(valor)}}</span>`;
      const sufixoHtml = sufixo ? `<span className="stat-suffix">{${jsExpr(sufixo)}}</span>` : "";

      return `<div className="stat"${staggerStyle(i)}>
            <p className="stat-value">${valorHtml}${sufixoHtml}</p>
            <p className="stat-label">{${jsExpr(label)}}</p>
          </div>`;
    })
    .join("\n          ");

  return `${sectionOpen(secao, design, "stats-section")}
        <div className="container">
          ${titulo ? sectionHeading(titulo) : ""}
          <div className="stats-grid stagger">
            ${stats}
          </div>
        </div>
      ${SECTION_CLOSE}`;
}
