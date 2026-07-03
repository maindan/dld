"use client";

import { useEffect } from "react";

const injected = new Set<string>();

/**
 * Injects a Google Fonts <link> for each family (once per family, cached across all
 * preview instances on the page) so the live preview and the model-picker thumbnails
 * actually render in the theme's real typeface instead of a generic fallback.
 */
export function useGoogleFonts(families: string[]) {
  useEffect(() => {
    for (const family of families) {
      if (!family || injected.has(family)) continue;
      injected.add(family);
      const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap`;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [families.join("|")]);
}
