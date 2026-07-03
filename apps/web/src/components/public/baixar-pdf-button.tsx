"use client";

import { Download } from "lucide-react";

/** Print-to-PDF via the browser's native dialog: no PDF library, no server
 * rendering step — the document already has a print stylesheet that swaps
 * the dark UI chrome for a clean printable layout (see .dl-orc-doc rules). */
export function BaixarPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-1.5 rounded-[9px] border border-border px-3.5 py-2 text-[12.5px] font-medium text-muted-foreground hover:border-primary hover:text-foreground"
    >
      <Download size={14} /> Baixar PDF
    </button>
  );
}
