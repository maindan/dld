"use client";

import type { HeaderConfig } from "@danlimadev/contracts";
import type { LandingPageTheme } from "@danlimadev/landing-generator/models";
import { Selectable } from "./Selectable";

/**
 * Renders the header with a visual cue for whichever `estiloHeader` the active theme
 * uses (solid bar / centered stack / transparent-over-hero / floating pill) so the
 * live preview and the model-picker thumbnails both read as "recognizably this theme".
 */
export function HeaderPreview({
  tema,
  header,
  corAcento,
  interactive,
  selected,
  onSelect,
}: {
  tema: LandingPageTheme;
  header: HeaderConfig;
  corAcento: string;
  interactive: boolean;
  selected: boolean;
  onSelect?: () => void;
}) {
  const overlay = tema.estiloHeader === "transparente-sobre-hero";
  const textColor = overlay ? "#ffffff" : "var(--lp-texto)";

  const marca = (
    <div className="flex items-center gap-2.5">
      {header.mostrarLogo &&
        (header.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={header.logoUrl} alt="" style={{ height: 30, width: 30, objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <div style={{ height: 30, width: 30, borderRadius: 8, background: corAcento, flex: "none" }} />
        ))}
      {header.mostrarTitulo && (
        <span style={{ fontFamily: "var(--lp-fonte-titulo)", fontWeight: 700, fontSize: 17, color: textColor }}>
          {header.titulo || "Sua marca"}
        </span>
      )}
    </div>
  );

  const nav = (
    <nav className="flex flex-wrap items-center gap-5">
      {header.navItems.length === 0 && (
        <span style={{ fontSize: 12, color: overlay ? "rgba(255,255,255,0.6)" : "var(--lp-texto-suave)" }}>
          (sem links de menu)
        </span>
      )}
      {header.navItems.map((item) => (
        <span key={item.id} style={{ fontSize: 13, fontWeight: 500, color: textColor }}>
          {item.label}
        </span>
      ))}
    </nav>
  );

  if (overlay) {
    return (
      <Selectable
        as="header"
        interactive={interactive}
        selected={selected}
        onSelect={onSelect}
        corAcento={corAcento}
        className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between gap-4 px-8 py-5"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)" }}
      >
        {marca}
        {nav}
      </Selectable>
    );
  }

  if (tema.estiloHeader === "centralizado") {
    return (
      <Selectable
        as="header"
        interactive={interactive}
        selected={selected}
        onSelect={onSelect}
        corAcento={corAcento}
        className="flex flex-col items-center gap-3 px-8 py-5"
        style={{ background: "var(--lp-fundo)", borderBottom: "1px solid color-mix(in srgb, var(--lp-texto) 10%, transparent)" }}
      >
        {marca}
        {nav}
      </Selectable>
    );
  }

  if (tema.estiloHeader === "pill-flutuante") {
    return (
      <Selectable
        interactive={interactive}
        selected={selected}
        onSelect={onSelect}
        corAcento={corAcento}
        className="px-8 pt-5"
        style={{ background: "var(--lp-fundo)" }}
      >
        <div
          className="flex items-center justify-between gap-4 px-5 py-3"
          style={{
            background: "var(--lp-fundo-alt)",
            borderRadius: 999,
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.25)",
          }}
        >
          {marca}
          {nav}
        </div>
      </Selectable>
    );
  }

  // solido-fixo (default)
  return (
    <Selectable
      as="header"
      interactive={interactive}
      selected={selected}
      onSelect={onSelect}
      corAcento={corAcento}
      className="flex items-center justify-between gap-4 px-8 py-4"
      style={{ background: "var(--lp-fundo)", borderBottom: "1px solid color-mix(in srgb, var(--lp-texto) 10%, transparent)" }}
    >
      {marca}
      {nav}
    </Selectable>
  );
}
