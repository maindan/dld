import type { ResolvedDesign } from "./resolve-design";
import { temAnimacao } from "./resolve-design";

/**
 * All motion in the generated page, in one place:
 *
 *  - scroll reveal per section (`[data-reveal]` + IntersectionObserver)
 *  - staggered entrance for grid children (`.stagger > *` with a per-child
 *    `--i` custom property set inline by the section renderers)
 *  - hero entrance on page load (`[data-hero-anim]` + `--hd` index) with a
 *    single soft pulse on the primary CTA
 *  - the animated stat counters script (estatisticas block)
 *  - the header scroll-state script
 *
 * Restraint rules: one shared easing curve `cubic-bezier(0.22, 1, 0.36, 1)`,
 * 0.5-0.7s durations, and every hidden state / keyframe lives inside
 * `@media (prefers-reduced-motion: no-preference)` — reduced-motion users
 * (and `estiloAnimacao: "none"` pages) always get the fully visible page.
 */

export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** True when this design's sections should get `data-reveal` + the IntersectionObserver script. */
export function temAnimacaoDeEntrada(design: ResolvedDesign): boolean {
  return temAnimacao(design);
}

/**
 * CSS for scroll reveal + grid stagger + hero entrance. Each `estiloAnimacao`
 * variant defines the hidden state on `[data-reveal]`; the observer script
 * adds `.is-visible`. `"none"` emits nothing — sections never get
 * `data-reveal` for that design (see `sections/shared.ts`).
 */
export function buildRevealCss(design: ResolvedDesign): string {
  // Narrowed via the local (not `temAnimacao`) so TS can prove the index below
  // never receives "none".
  const anim = design.estiloAnimacao;
  if (anim === "none") return "";

  const hidden: Record<Exclude<ResolvedDesign["estiloAnimacao"], "none">, string> = {
    "fade-up": "opacity: 0; transform: translateY(28px);",
    "zoom-in": "opacity: 0; transform: scale(0.94);",
    "slide-in": "opacity: 0; transform: translateX(-40px);",
  };

  return `
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] {
    ${hidden[anim]}
    transition: opacity 0.65s ease, transform 0.65s ${EASE};
    will-change: opacity, transform;
  }

  [data-reveal].is-visible {
    opacity: 1;
    transform: none;
  }

  /* Grid children enter one after the other (70ms steps) once their section
     reveals. Keyframe animation (not transition) so the per-child delay never
     leaks into hover transitions. */
  [data-reveal] .stagger > * {
    opacity: 0;
  }

  [data-reveal].is-visible .stagger > * {
    animation: stagger-in 0.6s ${EASE} both;
    animation-delay: calc(70ms * var(--i, 0));
  }

  @keyframes stagger-in {
    from {
      opacity: 0;
      transform: translateY(22px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  /* Hero enters on page load (not on scroll): title, subtitle and CTA rise
     in with a 120ms stagger via --hd, and the primary CTA pulses once. */
  [data-hero-anim] {
    animation: hero-enter 0.7s ${EASE} both;
    animation-delay: calc(120ms * var(--hd, 0));
  }

  .hero-cta {
    animation:
      hero-enter 0.7s ${EASE} both,
      cta-pulse 1.5s ${EASE} 1.15s 1;
    animation-delay: calc(120ms * var(--hd, 0)), 1.15s;
  }

  @keyframes hero-enter {
    from {
      opacity: 0;
      transform: translateY(26px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes cta-pulse {
    from {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 45%, transparent);
    }
    to {
      box-shadow: 0 0 0 22px transparent;
    }
  }

  /* Skill bars fill from zero when their section reveals. */
  [data-reveal] .skill-fill {
    width: 0;
    transition: width 1.1s ${EASE} 0.25s;
  }

  [data-reveal].is-visible .skill-fill {
    width: var(--w, 60%);
  }
}
`;
}

/**
 * Vanilla-JS IntersectionObserver that flips `.is-visible` on `[data-reveal]`
 * elements as they enter the viewport. No library, no framework hook — this
 * is injected as a plain `<script>` tag in the generated `app/page.tsx`, so
 * it has to be self-contained ES5-safe-ish code with no external deps.
 * Falls back to marking everything visible immediately if the browser has
 * no IntersectionObserver support.
 */
export function buildRevealScript(design: ResolvedDesign): string {
  if (!temAnimacao(design)) return "";

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
 * Animated counters for the "estatisticas" block. Each `[data-counter]` span
 * ships with its final formatted value as static content (so no-JS and
 * reduced-motion visitors simply see the number); the script rewinds it to
 * zero and counts up over ~1.2s with an ease-out curve when it enters the
 * viewport. pt-BR formatting, decimal places taken from `data-decimals`.
 */
export function buildCounterScript(): string {
  return `(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll("[data-counter]"));
  if (els.length === 0) return;
  var reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(n, dec) {
    return n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function run(el) {
    var target = parseFloat(el.getAttribute("data-target") || "");
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10) || 0;
    if (isNaN(target)) return;
    var dur = 1200;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, dec);
      if (p < 1) window.requestAnimationFrame(step);
    }
    el.textContent = fmt(0, dec);
    window.requestAnimationFrame(step);
  }
  if (reduce || !("IntersectionObserver" in window)) return;
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
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
export function buildHeaderScrollScript(design: ResolvedDesign): string {
  if (design.estiloHeader === "centralizado") return "";

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
