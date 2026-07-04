"use client";

import type { CSSProperties } from "react";
import type { EstiloBackground } from "@danlimadev/contracts";

/**
 * Decorative background layer for one of the 7 `EstiloBackground` values —
 * simplified but recognizable CSS versions of what the generator emits.
 * Consumes the `--lp-cor` / `--lp-cor-secundaria` / `--lp-texto` vars of the
 * nearest themed ancestor, so the same component powers the live preview
 * (behind the hero) AND the Design tab's mini-swatches. Parent must be
 * `position: relative` with `overflow: hidden`. Requires LP_PREVIEW_CSS
 * (theme-style.ts) somewhere on the page for the aurora keyframes.
 */
export function LpBackgroundDecor({ estilo, escuro }: { estilo: EstiloBackground; escuro: boolean }) {
  const layer: CSSProperties = { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" };

  switch (estilo) {
    case "minimal":
      return null;

    case "aurora":
      return (
        <div style={layer} aria-hidden>
          <div
            style={{
              position: "absolute",
              top: "-35%",
              left: "-12%",
              width: "72%",
              height: "95%",
              borderRadius: "50%",
              background: "radial-gradient(circle, color-mix(in srgb, var(--lp-cor) 55%, transparent), transparent 70%)",
              filter: "blur(46px)",
              opacity: escuro ? 0.75 : 0.45,
              animation: "lp-aurora 13s ease-in-out infinite alternate",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-25%",
              right: "-16%",
              width: "66%",
              height: "88%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--lp-cor-secundaria) 50%, transparent), transparent 70%)",
              filter: "blur(52px)",
              opacity: escuro ? 0.6 : 0.35,
              animation: "lp-aurora 17s ease-in-out infinite alternate-reverse",
            }}
          />
        </div>
      );

    case "mesh":
      return (
        <div
          style={{
            ...layer,
            backgroundImage: [
              "radial-gradient(ellipse 55% 55% at 12% 8%, color-mix(in srgb, var(--lp-cor) 20%, transparent), transparent)",
              "radial-gradient(ellipse 50% 60% at 90% 12%, color-mix(in srgb, var(--lp-cor-secundaria) 18%, transparent), transparent)",
              "radial-gradient(ellipse 60% 50% at 70% 95%, color-mix(in srgb, var(--lp-cor) 12%, transparent), transparent)",
            ].join(", "),
          }}
          aria-hidden
        />
      );

    case "grid-glow":
      return (
        <div style={layer} aria-hidden>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: [
                "linear-gradient(color-mix(in srgb, var(--lp-cor) 26%, transparent) 1px, transparent 1px)",
                "linear-gradient(90deg, color-mix(in srgb, var(--lp-cor) 26%, transparent) 1px, transparent 1px)",
              ].join(", "),
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(ellipse 90% 80% at 50% 0%, #000 30%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 0%, #000 30%, transparent 78%)",
              opacity: escuro ? 0.55 : 0.4,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-40%",
              left: "25%",
              width: "50%",
              height: "75%",
              borderRadius: "50%",
              background: "radial-gradient(circle, color-mix(in srgb, var(--lp-cor) 45%, transparent), transparent 70%)",
              filter: "blur(42px)",
              opacity: escuro ? 0.65 : 0.4,
            }}
          />
        </div>
      );

    case "dots":
      return (
        <div
          style={{
            ...layer,
            backgroundImage: "radial-gradient(color-mix(in srgb, var(--lp-texto) 30%, transparent) 1px, transparent 1.4px)",
            backgroundSize: "17px 17px",
            maskImage: "radial-gradient(ellipse 95% 90% at 50% 20%, #000 40%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 95% 90% at 50% 20%, #000 40%, transparent 90%)",
            opacity: 0.5,
          }}
          aria-hidden
        />
      );

    case "orbs":
      return (
        <div style={layer} aria-hidden>
          <div
            style={{
              position: "absolute",
              top: "-18%",
              left: "-8%",
              width: "42%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--lp-cor) 45%, transparent)",
              filter: "blur(46px)",
              opacity: escuro ? 0.5 : 0.35,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "18%",
              right: "-10%",
              width: "36%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--lp-cor-secundaria) 42%, transparent)",
              filter: "blur(42px)",
              opacity: escuro ? 0.45 : 0.32,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-22%",
              left: "32%",
              width: "30%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--lp-cor) 32%, transparent)",
              filter: "blur(40px)",
              opacity: escuro ? 0.4 : 0.28,
            }}
          />
        </div>
      );

    case "diagonal":
      return (
        <div
          style={{
            ...layer,
            background:
              "linear-gradient(115deg, color-mix(in srgb, var(--lp-cor) 14%, transparent) 0%, color-mix(in srgb, var(--lp-cor) 14%, transparent) 54%, transparent 54.3%)",
          }}
          aria-hidden
        />
      );

    default:
      return null;
  }
}
