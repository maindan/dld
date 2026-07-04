"use client";

import type { CSSProperties, ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import { defaultVariante, type Secao, type SecaoItemData } from "@danlimadev/contracts";
import { botaoRadius, cardSurface, lpRadius, type ResolvedDesign } from "./theme-style";
import { LpBackgroundDecor } from "./LpBackgroundDecor";
import { Selectable } from "./Selectable";

/**
 * Visual approximation of every SECAO_BLOCKS tipo (15 total) with their layout
 * variants, themed via the `--lp-*` CSS vars set by an ancestor (see
 * theme-style.ts / LandingPagePreview) and styled by the ResolvedDesign
 * (theme defaults <- per-page overrides). Not pixel-identical to the generated
 * site — recognizably the same palette, typography, background treatment, card
 * surface, button shape and layout variant, which is what both the live editor
 * preview and the model-picker thumbnails need.
 */
export function SecaoPreview({
  design,
  secao,
  corAcento,
  alt,
  decorada,
  interactive,
  selected,
  onSelect,
}: {
  design: ResolvedDesign;
  secao: Secao;
  corAcento: string;
  alt: boolean;
  /** True for the first section of the page: renders the theme/override background treatment behind it. */
  decorada: boolean;
  interactive: boolean;
  selected: boolean;
  onSelect?: () => void;
}) {
  const isCta = secao.tipo === "cta";
  const fundo = isCta ? "var(--lp-cor)" : alt ? "var(--lp-fundo-alt)" : "var(--lp-fundo)";
  const cor = isCta ? "#ffffff" : "var(--lp-texto)";

  return (
    <Selectable
      interactive={interactive}
      selected={selected}
      onSelect={onSelect}
      corAcento={corAcento}
      className="relative overflow-hidden px-8 py-14"
      style={{ background: fundo, color: cor }}
    >
      {decorada && !isCta && <LpBackgroundDecor estilo={design.estiloBackground} escuro={design.escuro} />}
      <div className="relative mx-auto flex max-w-3xl flex-col gap-7">{renderBody(design, secao, isCta)}</div>
    </Selectable>
  );
}

function renderBody(design: ResolvedDesign, secao: Secao, onAccentBand: boolean): ReactNode {
  const campo = (key: string, fallback = "") => secao.campos[key] || fallback;
  const itens = secao.itens ?? [];
  const variante = secao.variante ?? defaultVariante(secao.tipo) ?? "";
  const suave = onAccentBand ? "rgba(255,255,255,0.82)" : "var(--lp-texto-suave)";

  switch (secao.tipo) {
    case "hero":
      return renderHero(design, secao, variante, suave);

    case "sobre": {
      const texto = (
        <div className="flex flex-col gap-4">
          <Titulo size={27}>
            {campo("titulo", "Sobre")}
          </Titulo>
          <Texto color={suave}>{campo("texto", "Texto livre sobre a proposta do negócio.")}</Texto>
        </div>
      );
      if (variante === "com-imagem") {
        return (
          <div className="grid items-center gap-8" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
            {texto}
            <Midia design={design} src={campo("imagemUrl")} height={180} />
          </div>
        );
      }
      return texto;
    }

    case "servicos":
    case "diferenciais": {
      const header = (
        <SectionHeader
          titulo={campo("titulo", secao.tipo === "servicos" ? "Serviços" : "Diferenciais")}
          subtitulo={campo("subtitulo")}
          suave={suave}
        />
      );

      if (variante === "lista") {
        return (
          <>
            {header}
            <div className="flex flex-col">
              {itens.map((it, i) => (
                <div
                  key={it.id}
                  className="flex items-start gap-5 py-4"
                  style={{
                    borderBottom:
                      i < itens.length - 1 ? "1px solid color-mix(in srgb, var(--lp-texto) 10%, transparent)" : undefined,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--lp-fonte-titulo)",
                      fontWeight: 800,
                      fontSize: 14,
                      color: "var(--lp-cor)",
                      minWidth: 28,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 15, minWidth: 150 }}>{it.campos.titulo || "Título"}</div>
                  <Texto color={suave}>{it.campos.texto || "Descrição breve."}</Texto>
                </div>
              ))}
            </div>
          </>
        );
      }

      const bento = variante === "bento";
      return (
        <>
          {header}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: bento ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(200px, 1fr))" }}
          >
            {itens.map((it, i) => {
              const grande = bento && i === 0;
              return (
                <Card key={it.id} design={design} style={grande ? { gridColumn: "1 / -1", padding: 26 } : undefined}>
                  <span
                    style={{
                      width: grande ? 34 : 26,
                      height: grande ? 34 : 26,
                      borderRadius: Math.max(4, lpRadius(design, 0.4)),
                      background: "color-mix(in srgb, var(--lp-cor) 18%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--lp-cor) 40%, transparent)",
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: grande ? 18 : 15 }}>{it.campos.titulo || "Título"}</div>
                  <Texto color={suave}>{it.campos.texto || "Descrição breve."}</Texto>
                </Card>
              );
            })}
          </div>
        </>
      );
    }

    case "estatisticas":
      return (
        <>
          {campo("titulo") && (
            <Titulo size={24} align="center">
              {campo("titulo")}
            </Titulo>
          )}
          <div className="flex flex-wrap items-start justify-center gap-x-14 gap-y-8 py-2">
            {itens.map((it) => (
              <div key={it.id} className="flex flex-col items-center gap-1.5 text-center">
                <div
                  style={{
                    fontFamily: "var(--lp-fonte-titulo)",
                    fontWeight: 800,
                    fontSize: 38,
                    lineHeight: 1,
                    color: "var(--lp-cor)",
                  }}
                >
                  {it.campos.valor || "0"}
                  {it.campos.sufixo && <span style={{ fontSize: 22 }}>{it.campos.sufixo}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: suave }}>{it.campos.label || "legenda"}</div>
              </div>
            ))}
          </div>
        </>
      );

    case "marcas": {
      const faixa = [...itens, ...itens];
      return (
        <div className="flex flex-col gap-6">
          {campo("titulo") && (
            <div
              style={{
                textAlign: "center",
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: suave,
              }}
            >
              {campo("titulo")}
            </div>
          )}
          <div
            className="lp-marquee"
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
            }}
          >
            <div className="lp-marquee-track items-center" style={{ gap: 48, paddingRight: 48, "--lp-marquee-dur": "20s" } as CSSProperties}>
              {faixa.map((it, i) =>
                it.campos.imagemUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${it.id}-${i}`}
                    src={it.campos.imagemUrl}
                    alt={it.campos.nome || "Marca"}
                    style={{ height: 26, width: "auto", objectFit: "contain", opacity: 0.75 }}
                  />
                ) : (
                  <span
                    key={`${it.id}-${i}`}
                    style={{
                      fontFamily: "var(--lp-fonte-titulo)",
                      fontWeight: 700,
                      fontSize: 16,
                      opacity: 0.55,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {it.campos.nome || "Marca"}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      );
    }

    case "depoimentos":
      return renderDepoimentos(design, secao, variante, suave);

    case "precos":
      return (
        <>
          <SectionHeader titulo={campo("titulo", "Preços")} subtitulo={campo("subtitulo")} suave={suave} />
          <ItemGrid>
            {itens.map((it) => {
              const destaque = it.campos.destaque === "true";
              return (
                <Card key={it.id} design={design} destacado={destaque}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{it.campos.nome || "Plano"}</div>
                  <div style={{ fontWeight: 800, fontSize: 24, color: "var(--lp-cor)" }}>{it.campos.preco || "R$ 0"}</div>
                  <ul className="flex flex-col gap-1.5" style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: suave }}>
                    {(it.campos.recursos || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                  </ul>
                  {destaque && <Botao design={design}>Escolher plano</Botao>}
                </Card>
              );
            })}
          </ItemGrid>
        </>
      );

    case "faq":
      return (
        <>
          <Titulo size={27}>
            {campo("titulo", "Perguntas frequentes")}
          </Titulo>
          <div className="flex flex-col gap-4">
            {itens.map((it) => (
              <div
                key={it.id}
                style={{ borderBottom: "1px solid color-mix(in srgb, var(--lp-texto) 12%, transparent)", paddingBottom: 12 }}
              >
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{it.campos.pergunta || "Pergunta"}</div>
                <Texto color={suave}>{it.campos.resposta || "Resposta."}</Texto>
              </div>
            ))}
          </div>
        </>
      );

    case "equipe":
      return (
        <>
          <Titulo size={27}>
            {campo("titulo", "Equipe")}
          </Titulo>
          <ItemGrid>
            {itens.map((it) => (
              <Card key={it.id} design={design} centered>
                <Avatar src={it.campos.imagemUrl} size={52} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>{it.campos.nome || "Nome"}</div>
                <div style={{ fontSize: 12, color: suave }}>{it.campos.cargo}</div>
              </Card>
            ))}
          </ItemGrid>
        </>
      );

    case "agenda":
      return (
        <>
          <Titulo size={27}>
            {campo("titulo", "Agenda")}
          </Titulo>
          <div className="flex flex-col gap-4">
            {itens.map((it) => (
              <div key={it.id} className="flex items-start gap-4">
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--lp-cor)", minWidth: 56 }}>{it.campos.horario}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{it.campos.titulo || "Item da agenda"}</div>
                  <Texto color={suave}>{it.campos.descricao}</Texto>
                </div>
              </div>
            ))}
          </div>
        </>
      );

    case "galeria": {
      const cartao = (it: SecaoItemData, altura: number) => (
        <Card key={it.id} design={design} noPad>
          <Midia design={design} src={it.campos.imagemUrl} height={altura} radius={0} />
          <div className="flex flex-col gap-1.5 p-4">
            <div style={{ fontWeight: 700, fontSize: 14 }}>{it.campos.titulo || "Título"}</div>
            <Texto color={suave}>{it.campos.descricao}</Texto>
          </div>
        </Card>
      );

      if (variante === "masonry") {
        return (
          <>
            <Titulo size={27}>
              {campo("titulo", "Galeria / Trabalhos")}
            </Titulo>
            <div style={{ columns: 2, columnGap: 16 }}>
              {itens.map((it, i) => (
                <div key={it.id} style={{ breakInside: "avoid", marginBottom: 16 }}>
                  {cartao(it, 90 + (i % 3) * 46)}
                </div>
              ))}
            </div>
          </>
        );
      }
      return (
        <>
          <Titulo size={27}>
            {campo("titulo", "Galeria / Trabalhos")}
          </Titulo>
          <ItemGrid>{itens.map((it) => cartao(it, 96))}</ItemGrid>
        </>
      );
    }

    case "habilidades":
      return (
        <>
          <Titulo size={27}>
            {campo("titulo", "Habilidades")}
          </Titulo>
          <div className="flex flex-col gap-4">
            {itens.map((it) => {
              const nivel = Math.max(0, Math.min(100, Number(it.campos.nivel) || 0));
              return (
                <div key={it.id}>
                  <div className="flex items-center justify-between" style={{ fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{it.campos.nome || "Habilidade"}</span>
                    <span style={{ color: suave }}>{nivel}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "color-mix(in srgb, var(--lp-texto) 10%, transparent)" }}>
                    <div style={{ height: "100%", width: `${nivel}%`, borderRadius: 999, background: "var(--lp-cor)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      );

    case "formulario":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <Titulo size={27}>
            {campo("titulo", "Fale com a gente")}
          </Titulo>
          <Texto color={suave}>{campo("subtitulo", "Preencha os dados e retornaremos em breve.")}</Texto>
          <div className="flex w-full max-w-sm flex-col gap-2.5">
            <MockInput design={design}>Nome</MockInput>
            <MockInput design={design}>E-mail</MockInput>
            <MockInput design={design} tall>
              Mensagem
            </MockInput>
            <Botao design={design}>Enviar</Botao>
          </div>
        </div>
      );

    case "contato":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <Titulo size={27}>
            {campo("titulo", "Vamos conversar?")}
          </Titulo>
          <Texto color={suave}>{campo("texto", "Entre em contato conosco.")}</Texto>
        </div>
      );

    case "cta":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <Titulo size={30}>
            {campo("titulo", "Chamada final")}
          </Titulo>
          <Texto color={suave}>{campo("subtitulo", "Reforce o próximo passo que o visitante deve dar.")}</Texto>
          <Botao design={design} invertido>
            {campo("cta", "Call to action")}
          </Botao>
        </div>
      );

    default:
      return <div style={{ fontSize: 13, color: suave }}>Bloco &ldquo;{secao.tipo}&rdquo; sem preview dedicado.</div>;
  }
}

// ---------------------------------------------------------------------------
// Hero variants (centrado / split / editorial)
// ---------------------------------------------------------------------------

function renderHero(design: ResolvedDesign, secao: Secao, variante: string, suave: string): ReactNode {
  const campo = (key: string, fallback = "") => secao.campos[key] || fallback;
  const badge = campo("badge");
  const img = campo("imagemUrl");

  if (variante === "split") {
    return (
      <div className="grid items-center gap-8 py-6" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
        <div className="flex flex-col items-start gap-4 text-left">
          {badge && <HeroBadge design={design}>{badge}</HeroBadge>}
          <Titulo size={34}>
            {campo("titulo", "Título de impacto")}
          </Titulo>
          <Texto color={suave}>{campo("subtitulo", "Subtítulo explicando sua proposta de valor.")}</Texto>
          <Botao design={design}>{campo("cta", "Call to action")}</Botao>
        </div>
        <Midia design={design} src={img} height={230} />
      </div>
    );
  }

  if (variante === "editorial") {
    return (
      <div className="flex flex-col items-start gap-5 py-8 text-left">
        {badge && (
          <div className="flex items-center gap-2.5">
            <span style={{ width: 34, height: 2, background: "var(--lp-cor)" }} />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--lp-cor)",
              }}
            >
              {badge}
            </span>
          </div>
        )}
        <Titulo size={54} tight>
          {campo("titulo", "Título de impacto")}
        </Titulo>
        <Texto color={suave} size={15.5} maxWidth={520}>
          {campo("subtitulo", "Subtítulo explicando sua proposta de valor.")}
        </Texto>
        <Botao design={design}>{campo("cta", "Call to action")}</Botao>
        {img && <Midia design={design} src={img} height={240} />}
      </div>
    );
  }

  // centrado (default)
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      {badge && <HeroBadge design={design}>{badge}</HeroBadge>}
      <Titulo size={40}>
        {campo("titulo", "Título de impacto")}
      </Titulo>
      <Texto color={suave}>{campo("subtitulo", "Subtítulo explicando sua proposta de valor.")}</Texto>
      <Botao design={design}>{campo("cta", "Call to action")}</Botao>
      {img && <Midia design={design} src={img} height={220} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Depoimentos variants (grid / marquee / destaque)
// ---------------------------------------------------------------------------

function renderDepoimentos(design: ResolvedDesign, secao: Secao, variante: string, suave: string): ReactNode {
  const campo = (key: string, fallback = "") => secao.campos[key] || fallback;
  const itens = secao.itens ?? [];

  const cartao = (it: SecaoItemData, style?: CSSProperties) => (
    <Card key={it.id} design={design} style={style}>
      <Texto color={suave}>&ldquo;{it.campos.texto || "Depoimento do cliente."}&rdquo;</Texto>
      <div className="flex items-center gap-2.5">
        <Avatar src={it.campos.imagemUrl} size={30} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{it.campos.nome || "Nome"}</div>
          <div style={{ fontSize: 12, color: suave }}>{it.campos.cargo}</div>
        </div>
      </div>
    </Card>
  );

  if (variante === "marquee") {
    const faixa = [...itens, ...itens];
    return (
      <>
        <Titulo size={27} align="center">
          {campo("titulo", "Depoimentos")}
        </Titulo>
        <div
          className="lp-marquee"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <div className="lp-marquee-track items-stretch" style={{ gap: 16, paddingRight: 16, "--lp-marquee-dur": "30s" } as CSSProperties}>
            {faixa.map((it, i) => (
              <div key={`${it.id}-${i}`} style={{ width: 250, flex: "none", display: "flex" }}>
                {cartao(it, { flex: 1 })}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (variante === "destaque") {
    const [primeiro, ...resto] = itens;
    return (
      <>
        <Titulo size={27} align="center">
          {campo("titulo", "Depoimentos")}
        </Titulo>
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            style={{
              fontFamily: "var(--lp-fonte-titulo)",
              fontWeight: 600,
              fontSize: 22,
              lineHeight: 1.45,
              maxWidth: 560,
            }}
          >
            &ldquo;{primeiro?.campos.texto || "Depoimento em destaque do seu melhor cliente."}&rdquo;
          </div>
          <div className="flex items-center gap-3">
            <Avatar src={primeiro?.campos.imagemUrl} size={40} />
            <div className="text-left">
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{primeiro?.campos.nome || "Nome"}</div>
              <div style={{ fontSize: 12, color: suave }}>{primeiro?.campos.cargo}</div>
            </div>
          </div>
        </div>
        {resto.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {resto.map((it) => cartao(it))}
          </div>
        )}
      </>
    );
  }

  // grid (default)
  return (
    <>
      <Titulo size={27}>
        {campo("titulo", "Depoimentos")}
      </Titulo>
      <ItemGrid>{itens.map((it) => cartao(it))}</ItemGrid>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

function SectionHeader({
  titulo,
  subtitulo,
  suave,
}: {
  titulo: string;
  subtitulo: string;
  suave: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Titulo size={27}>
        {titulo}
      </Titulo>
      {subtitulo && <Texto color={suave}>{subtitulo}</Texto>}
    </div>
  );
}

function Titulo({
  design,
  size,
  align,
  tight,
  children,
}: {
  /** Unused today (the font comes from the `--lp-fonte-titulo` var) — optional so callers may omit it. */
  design?: ResolvedDesign;
  size: number;
  align?: "center";
  tight?: boolean;
  children: ReactNode;
}) {
  void design;
  return (
    <h2
      style={{
        fontFamily: "var(--lp-fonte-titulo)",
        fontWeight: 800,
        fontSize: size,
        lineHeight: tight ? 1.02 : 1.15,
        letterSpacing: tight ? "-0.02em" : undefined,
        textAlign: align,
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

function Texto({
  children,
  color,
  size = 14.5,
  maxWidth,
}: {
  children: ReactNode;
  color: string;
  size?: number;
  maxWidth?: number;
}) {
  return (
    <p style={{ fontSize: size, lineHeight: 1.6, color, margin: 0, whiteSpace: "pre-line", maxWidth }}>{children}</p>
  );
}

function HeroBadge({ design, children }: { design: ResolvedDesign; children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 14px",
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: "0.02em",
        borderRadius: design.estiloBotao === "reto" ? Math.max(0, lpRadius(design, 0.4)) : 999,
        background: "color-mix(in srgb, var(--lp-cor) 13%, transparent)",
        border: "1px solid color-mix(in srgb, var(--lp-cor) 38%, transparent)",
        color: "var(--lp-cor)",
      }}
    >
      {children}
    </span>
  );
}

function ItemGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {children}
    </div>
  );
}

function Card({
  design,
  children,
  destacado,
  centered,
  noPad,
  style,
}: {
  design: ResolvedDesign;
  children: ReactNode;
  destacado?: boolean;
  centered?: boolean;
  noPad?: boolean;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    ...cardSurface(design),
    borderRadius: `${lpRadius(design)}px`,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "hidden",
    ...style,
  };
  if (!noPad && base.padding === undefined) base.padding = 18;
  if (noPad) base.padding = 0;
  if (centered) {
    base.alignItems = "center";
    base.textAlign = "center";
  }
  if (destacado) {
    base.outline = "2px solid var(--lp-cor)";
    base.outlineOffset = -2;
  }
  return <div style={base}>{children}</div>;
}

function Botao({ design, children, invertido }: { design: ResolvedDesign; children: ReactNode; invertido?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "10px 24px",
        fontSize: 13.5,
        fontWeight: 600,
        borderRadius: `${botaoRadius(design)}px`,
        background: invertido ? "#ffffff" : "var(--lp-cor)",
        color: invertido ? "var(--lp-cor)" : "#ffffff",
      }}
    >
      {children}
    </span>
  );
}

/** imagemUrl set -> real <img>; empty -> theme-gradient placeholder with a soft glyph. */
function Midia({ design, src, height, radius }: { design: ResolvedDesign; src: string; height: number; radius?: number }) {
  const r = radius ?? lpRadius(design, 0.8);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" style={{ width: "100%", height, objectFit: "cover", borderRadius: r, display: "block" }} />
    );
  }
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: "100%",
        height,
        borderRadius: r,
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--lp-cor) 85%, #000000), var(--lp-cor) 45%, var(--lp-cor-secundaria))",
      }}
    >
      <ImageIcon size={Math.min(30, height / 3)} color="rgba(255,255,255,0.5)" />
    </div>
  );
}

function Avatar({ src, size }: { src?: string; size: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" style={{ height: size, width: size, borderRadius: "50%", objectFit: "cover", flex: "none" }} />
    );
  }
  return (
    <div
      style={{
        height: size,
        width: size,
        borderRadius: "50%",
        flex: "none",
        background: "linear-gradient(135deg, var(--lp-cor), var(--lp-cor-secundaria))",
      }}
    />
  );
}

function MockInput({ design, children, tall }: { design: ResolvedDesign; children: ReactNode; tall?: boolean }) {
  return (
    <div
      style={{
        background: "color-mix(in srgb, var(--lp-texto) 6%, transparent)",
        border: "1px solid color-mix(in srgb, var(--lp-texto) 12%, transparent)",
        borderRadius: `${Math.max(6, lpRadius(design, 0.5))}px`,
        padding: "10px 14px",
        fontSize: 12,
        color: "var(--lp-texto-suave)",
        textAlign: "left",
        height: tall ? 64 : undefined,
      }}
    >
      {children}
    </div>
  );
}
