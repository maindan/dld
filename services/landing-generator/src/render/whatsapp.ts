import type { GerarLandingPageInput } from "@danlimadev/contracts";
import { apenasDigitos, jsExpr } from "./utils";

type WhatsappConfig = GerarLandingPageInput["whatsapp"];

/** Official-looking WhatsApp glyph, inline SVG — no icon library needed. */
const WHATSAPP_ICON = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.9 1.9 7L3 29l6.5-2.1c2 1.1 4.2 1.7 6.5 1.7 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3Z" fill="#fff"/><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.9 1.9 7L3 29l6.5-2.1c2 1.1 4.2 1.7 6.5 1.7 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3Z" stroke="#25D366" strokeWidth="0"/><path fillRule="evenodd" clipRule="evenodd" d="M16 3.6C9.4 3.6 4 9 4 15.6c0 2.4.7 4.7 2 6.7l-1.3 5 5.2-1.4a12 12 0 0 0 6.1 1.7c6.6 0 12-5.4 12-12S22.6 3.6 16 3.6Z" fill="#25D366"/><path d="M22.4 19c-.3-.2-1.9-1-2.2-1s-.5-.1-.7.1-.8 1-1 1.2-.3.2-.6.1a8.6 8.6 0 0 1-2.6-1.6 9.6 9.6 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.6l.4-.5.3-.4c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3 1.9 3 4.7 4.2c2.5 1.1 2.5.7 3 .7.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.6-.3Z" fill="#fff"/></svg>`;

/**
 * Full-page, always-on-top floating WhatsApp button (`.whatsapp-float` is
 * `position: fixed`, `z-index: 999` — see theme-css.ts). Only rendered when
 * `whatsapp.ativo`. The phone number is stripped to digits so a user typing
 * "(11) 91234-5678" still produces a valid `wa.me` link.
 */
export function renderWhatsappButton(whatsapp: WhatsappConfig): string {
  if (!whatsapp.ativo) return "";
  const numero = apenasDigitos(whatsapp.numero);
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(whatsapp.mensagem)}`;
  return `<a
        href={${jsExpr(url)}}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Conversar no WhatsApp"
      >
        ${WHATSAPP_ICON}
      </a>`;
}
