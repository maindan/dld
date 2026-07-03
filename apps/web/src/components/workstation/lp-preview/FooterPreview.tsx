"use client";

import type { FooterConfig } from "@danlimadev/contracts";
import { Selectable } from "./Selectable";

export function FooterPreview({
  footer,
  corAcento,
  interactive,
  selected,
  onSelect,
}: {
  footer: FooterConfig;
  corAcento: string;
  interactive: boolean;
  selected: boolean;
  onSelect?: () => void;
}) {
  const contatos = [footer.telefone, footer.email, footer.endereco].filter(Boolean);

  return (
    <Selectable
      as="footer"
      interactive={interactive}
      selected={selected}
      onSelect={onSelect}
      corAcento={corAcento}
      className="flex flex-col items-center gap-3 px-8 py-10 text-center"
      style={{ background: "color-mix(in srgb, var(--lp-texto) 92%, var(--lp-fundo))", color: "var(--lp-fundo)" }}
    >
      <div style={{ fontSize: 13, opacity: 0.85 }}>{footer.texto || "Todos os direitos reservados."}</div>
      {contatos.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3" style={{ fontSize: 12, opacity: 0.7 }}>
          {contatos.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      )}
      {footer.redesSociais.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {footer.redesSociais.map((r) => (
            <span
              key={r.id}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 999,
                background: "color-mix(in srgb, var(--lp-fundo) 15%, transparent)",
              }}
            >
              {r.rede || "rede"}
            </span>
          ))}
        </div>
      )}
    </Selectable>
  );
}
