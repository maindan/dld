"use client";

import { MessageCircle } from "lucide-react";
import type { WhatsappConfig } from "@danlimadev/contracts";

/** Floating WhatsApp button, shown in the live preview (and the editor's WhatsApp tab
 * mini-preview) whenever `whatsapp.ativo` is true. */
export function WhatsappButtonPreview({ whatsapp, absolute = true }: { whatsapp: WhatsappConfig; absolute?: boolean }) {
  if (!whatsapp.ativo) return null;

  return (
    <div
      className="flex items-center justify-center"
      style={{
        position: absolute ? "absolute" : "static",
        bottom: absolute ? 20 : undefined,
        right: absolute ? 20 : undefined,
        zIndex: 20,
        height: 52,
        width: 52,
        borderRadius: 999,
        background: "#25D366",
        boxShadow: "0 8px 20px -6px rgba(0,0,0,0.4)",
      }}
      title={whatsapp.numero || "WhatsApp"}
    >
      <MessageCircle size={26} color="#fff" fill="#fff" />
    </div>
  );
}
