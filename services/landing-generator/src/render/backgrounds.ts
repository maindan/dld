import type { ResolvedDesign } from "./resolve-design";

/**
 * Decorative page-top background layer (`ESTILOS_BACKGROUND` in the shared
 * contract). The decor is a single absolutely-positioned, pointer-events-none
 * element rendered as the first child of `<main>` — behind the (transparent)
 * hero and faded out with a bottom mask so it never fights the sections
 * below, whatever their height. `renderBackgroundDecor` emits the markup for
 * the resolved style only; `buildBackgroundCss` emits that style's CSS only,
 * prefixed with an "estiloBackground: X" marker comment.
 *
 * All movement (aurora drift, orb float) lives inside
 * `@media (prefers-reduced-motion: no-preference)`.
 */

/** JSX markup for the decor layer; empty string for `minimal` (no decoration by design). */
export function renderBackgroundDecor(design: ResolvedDesign): string {
  switch (design.estiloBackground) {
    case "aurora":
      return `<div className="bg-decor bg-decor--aurora" aria-hidden="true">
        <div className="bg-aurora-layer bg-aurora-layer--1" />
        <div className="bg-aurora-layer bg-aurora-layer--2" />
        <div className="bg-aurora-layer bg-aurora-layer--3" />
        <div className="bg-grain" />
      </div>`;
    case "mesh":
      return `<div className="bg-decor bg-decor--mesh" aria-hidden="true" />`;
    case "grid-glow":
      return `<div className="bg-decor bg-decor--grid-glow" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-glow" />
      </div>`;
    case "dots":
      return `<div className="bg-decor bg-decor--dots" aria-hidden="true" />`;
    case "orbs":
      return `<div className="bg-decor bg-decor--orbs" aria-hidden="true">
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
      </div>`;
    case "diagonal":
      return `<div className="bg-decor bg-decor--diagonal" aria-hidden="true" />`;
    case "minimal":
      return "";
  }
}

/** Shared shell for every non-minimal decor: full-bleed top layer, masked out at the bottom. */
const DECOR_BASE = `.bg-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: max(880px, 100vh);
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}`;

export function buildBackgroundCss(design: ResolvedDesign): string {
  const marker = `/* estiloBackground: ${design.estiloBackground} */`;

  switch (design.estiloBackground) {
    case "aurora": {
      // Layered radial gradients in the theme's accent colors drifting slowly
      // over the dark base + an inline-SVG grain pass on top: the current
      // dark-SaaS aurora look.
      const grainOpacity = design.escuro ? "0.07" : "0.045";
      const blend = design.escuro ? "overlay" : "multiply";
      return `${marker}
${DECOR_BASE}

.bg-aurora-layer {
  position: absolute;
  inset: -22%;
  filter: blur(64px);
  will-change: transform;
}

.bg-aurora-layer--1 {
  background: radial-gradient(38% 42% at 22% 18%, color-mix(in srgb, var(--color-accent) 34%, transparent), transparent 70%);
}

.bg-aurora-layer--2 {
  background: radial-gradient(44% 38% at 78% 12%, color-mix(in srgb, var(--color-accent-strong) 28%, transparent), transparent 70%);
}

.bg-aurora-layer--3 {
  background: radial-gradient(52% 46% at 50% 66%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 72%);
}

.bg-grain {
  position: absolute;
  inset: 0;
  background-image: var(--grain);
  background-size: 180px 180px;
  opacity: ${grainOpacity};
  mix-blend-mode: ${blend};
}

@media (prefers-reduced-motion: no-preference) {
  .bg-aurora-layer--1 {
    animation: aurora-drift 24s ease-in-out infinite alternate;
  }
  .bg-aurora-layer--2 {
    animation: aurora-drift 30s ease-in-out infinite alternate-reverse;
  }
  .bg-aurora-layer--3 {
    animation: aurora-drift 19s ease-in-out infinite alternate;
    animation-delay: -8s;
  }
  @keyframes aurora-drift {
    from {
      transform: translate3d(-4%, -2%, 0) scale(1);
    }
    to {
      transform: translate3d(4%, 3%, 0) scale(1.14);
    }
  }
}`;
    }

    case "mesh":
      // Same layered-radial idea as aurora, but static and softer — a quiet
      // mesh gradient for light themes.
      return `${marker}
${DECOR_BASE}

.bg-decor--mesh {
  background:
    radial-gradient(46% 40% at 16% 8%, color-mix(in srgb, var(--color-accent) 13%, transparent), transparent 70%),
    radial-gradient(40% 36% at 84% 4%, color-mix(in srgb, var(--color-accent-strong) 11%, transparent), transparent 70%),
    radial-gradient(60% 48% at 55% 48%, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 75%);
}`;

    case "grid-glow":
      // Fine line grid on both axes (text color at ~6-7% opacity) + one big
      // accent glow behind the hero; a radial mask melts the grid at the edges.
      return `${marker}
${DECOR_BASE}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(0deg, color-mix(in srgb, var(--color-text) 7%, transparent) 0 1px, transparent 1px 56px),
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-text) 7%, transparent) 0 1px, transparent 1px 56px);
  -webkit-mask-image: radial-gradient(120% 85% at 50% 0%, black 28%, transparent 78%);
  mask-image: radial-gradient(120% 85% at 50% 0%, black 28%, transparent 78%);
}

.bg-glow {
  position: absolute;
  left: 50%;
  top: -16%;
  width: min(920px, 120vw);
  height: 680px;
  transform: translateX(-50%);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 30%, transparent), transparent 72%);
  filter: blur(52px);
}`;

    case "dots":
      // Subtle dot lattice, denser behind the hero thanks to the radial mask.
      return `${marker}
${DECOR_BASE}

.bg-decor--dots {
  background-image: radial-gradient(color-mix(in srgb, var(--color-text) 17%, transparent) 1px, transparent 1.6px);
  background-size: 24px 24px;
  -webkit-mask-image: radial-gradient(110% 75% at 50% 0%, black 22%, transparent 80%);
  mask-image: radial-gradient(110% 75% at 50% 0%, black 22%, transparent 80%);
}`;

    case "orbs":
      // Huge blurred color orbs placed asymmetrically; the first one floats.
      return `${marker}
${DECOR_BASE}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(92px);
  will-change: transform;
}

.bg-orb--1 {
  width: 520px;
  height: 520px;
  left: -140px;
  top: -120px;
  background: color-mix(in srgb, var(--color-accent) 26%, transparent);
}

.bg-orb--2 {
  width: 430px;
  height: 430px;
  right: -110px;
  top: 10%;
  background: color-mix(in srgb, var(--color-accent-strong) 22%, transparent);
}

.bg-orb--3 {
  width: 300px;
  height: 300px;
  left: 44%;
  top: 48%;
  background: color-mix(in srgb, var(--color-accent) 13%, transparent);
}

@media (prefers-reduced-motion: no-preference) {
  .bg-orb--1 {
    animation: orb-float 26s ease-in-out infinite alternate;
  }
  .bg-orb--3 {
    animation: orb-float 21s ease-in-out infinite alternate-reverse;
  }
  @keyframes orb-float {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(4%, 7%, 0) scale(1.08);
    }
  }
}`;

    case "diagonal":
      // A hard diagonal band of the alt background crossing the hero, plus a
      // thinner accent-tinted stripe along its top edge — structured, not soft.
      return `${marker}
${DECOR_BASE}

.bg-decor--diagonal::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--color-bg-alt);
  clip-path: polygon(0 36%, 100% 8%, 100% 66%, 0 94%);
}

.bg-decor--diagonal::after {
  content: "";
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-accent) 9%, transparent);
  clip-path: polygon(0 32%, 100% 4%, 100% 10%, 0 38%);
}`;

    case "minimal":
      // Editorial themes live on typography and whitespace — no decor layer
      // at all (the hero's own hairline is part of the hero variant CSS).
      return marker;
  }
}
