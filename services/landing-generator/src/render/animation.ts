import type { LandingPageTheme } from "../models";

/** True when this theme's sections should get `data-reveal` + the IntersectionObserver script. */
export function temAnimacaoDeEntrada(theme: LandingPageTheme): boolean {
  return theme.estiloAnimacao !== "none";
}

/**
 * CSS for the scroll-reveal effect. Each variant defines the "hidden" state
 * on `[data-reveal]` and the "revealed" state once the IntersectionObserver
 * script (see `buildRevealScript`) adds `.is-visible`. `estiloAnimacao ===
 * "none"` renders no rule at all — sections never get `data-reveal` for that
 * theme (see `sections/index.ts`), so nothing needs hiding.
 */
export function buildRevealCss(theme: LandingPageTheme): string {
  if (theme.estiloAnimacao === "none") return "";

  const base = `
[data-reveal] {
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
[data-reveal].is-visible {
  opacity: 1 !important;
  transform: none !important;
}
`;

  const estados: Record<Exclude<LandingPageTheme["estiloAnimacao"], "none">, string> = {
    "fade-up": `[data-reveal] { opacity: 0; transform: translateY(28px); }`,
    "zoom-in": `[data-reveal] { opacity: 0; transform: scale(0.92); }`,
    "slide-in": `[data-reveal] { opacity: 0; transform: translateX(-40px); }`,
  };

  return `${estados[theme.estiloAnimacao]}\n${base}`;
}

/**
 * Vanilla-JS IntersectionObserver that flips `.is-visible` on `[data-reveal]`
 * elements as they enter the viewport. No library, no framework hook — this
 * is injected as a plain `<script>` tag in the generated `app/page.tsx`, so
 * it has to be self-contained ES5-safe-ish code with no external deps.
 * Falls back to marking everything visible immediately if the browser has
 * no IntersectionObserver support.
 */
export function buildRevealScript(theme: LandingPageTheme): string {
  if (!temAnimacaoDeEntrada(theme)) return "";

  return `(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (els.length === 0) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach(function (el) { observer.observe(el); });
})();`;
}

/**
 * Toggles `.is-scrolled` on the header once the page scrolls past a small
 * threshold. Used by the "solido-fixo" (shadow-on-scroll), "transparente-
 * sobre-hero" (transparent -> solid) and "pill-flutuante" (deeper shadow)
 * header styles. "centralizado" is static in normal flow and doesn't need it.
 */
export function buildHeaderScrollScript(theme: LandingPageTheme): string {
  if (theme.estiloHeader === "centralizado") return "";

  return `(function () {
  var header = document.querySelector("[data-site-header]");
  if (!header) return;
  var onScroll = function () {
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();`;
}
