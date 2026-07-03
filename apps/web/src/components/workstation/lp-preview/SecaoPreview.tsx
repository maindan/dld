"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "@danlimadev/landing-generator/models";
import { botaoRadius, lpRadius } from "./theme-style";
import { Selectable } from "./Selectable";

/**
 * Visual approximation of every SECAO_BLOCKS tipo (13 total), themed via the
 * `--lp-*` CSS vars set by an ancestor (see theme-style.ts / LandingPagePreview).
 * Not pixel-identical to the generated site — recognizably the same palette,
 * typography and tone, which is what both the live editor preview and the
 * model-picker thumbnails need.
 */
export function SecaoPreview({
  tema,
  secao,
  corAcento,
  alt,
  interactive,
  selected,
  onSelect,
}: {
  tema: LandingPageTheme;
  secao: Secao;
  corAcento: string;
  alt: boolean;
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
      className="px-8 py-14"
      style={{ background: fundo, color: cor }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-7">{renderBody(tema, secao, isCta)}</div>
    </Selectable>
  );
}

function renderBody(tema: LandingPageTheme, secao: Secao, onAccentBand: boolean): ReactNode {
  const campo = (key: string, fallback = "") => secao.campos[key] || fallback;
  const itens = secao.itens ?? [];
  const suave = onAccentBand ? "rgba(255,255,255,0.82)" : "var(--lp-texto-suave)";

  switch (secao.tipo) {
    case "hero":
      return (
        <div className="flex flex-col items-center gap-5 py-8 text-center">
          <Titulo tema={tema} size={40}>
            {campo("titulo", "Título de impacto")}
          </Titulo>
          <Texto color={suave}>{campo("subtitulo", "Subtítulo explicando sua proposta de valor.")}</Texto>
          <Botao tema={tema}>{campo("cta", "Call to action")}</Botao>
        </div>
      );

    case "sobre":
      return (
        <div className="flex flex-col gap-4">
          <Titulo tema={tema} size={27}>
            {campo("titulo", "Sobre")}
          </Titulo>
          <Texto color={suave}>{campo("texto", "Texto livre sobre a proposta do negócio.")}</Texto>
        </div>
      );

    case "servicos":
    case "diferenciais":
      return (
        <>
          <Titulo tema={tema} size={27}>
            {campo("titulo", secao.tipo === "servicos" ? "Serviços" : "Diferenciais")}
          </Titulo>
          <ItemGrid>
            {itens.map((it) => (
              <Card key={it.id} tema={tema}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{it.campos.titulo || "Título"}</div>
                <Texto color={suave}>{it.campos.texto || "Descrição breve."}</Texto>
              </Card>
            ))}
          </ItemGrid>
        </>
      );

    case "depoimentos":
      return (
        <>
          <Titulo tema={tema} size={27}>
            {campo("titulo", "Depoimentos")}
          </Titulo>
          <ItemGrid>
            {itens.map((it) => (
              <Card key={it.id} tema={tema}>
                <Texto color={suave}>&ldquo;{it.campos.texto || "Depoimento do cliente."}&rdquo;</Texto>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{it.campos.nome || "Nome"}</div>
                <div style={{ fontSize: 12, color: suave }}>{it.campos.cargo}</div>
              </Card>
            ))}
          </ItemGrid>
        </>
      );

    case "precos":
      return (
        <>
          <Titulo tema={tema} size={27}>
            {campo("titulo", "Preços")}
          </Titulo>
          <ItemGrid>
            {itens.map((it) => {
              const destaque = it.campos.destaque === "true";
              return (
                <Card key={it.id} tema={tema} destacado={destaque}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{it.campos.nome || "Plano"}</div>
                  <div style={{ fontWeight: 800, fontSize: 24, color: "var(--lp-cor)" }}>{it.campos.preco || "R$ 0"}</div>
                  <ul className="flex flex-col gap-1.5" style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: suave }}>
                    {(it.campos.recursos || "").split("\n").filter(Boolean).map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  {destaque && <Botao tema={tema}>Escolher plano</Botao>}
                </Card>
              );
            })}
          </ItemGrid>
        </>
      );

    case "faq":
      return (
        <>
          <Titulo tema={tema} size={27}>
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
          <Titulo tema={tema} size={27}>
            {campo("titulo", "Equipe")}
          </Titulo>
          <ItemGrid>
            {itens.map((it) => (
              <Card key={it.id} tema={tema} centered>
                <div style={{ height: 52, width: 52, borderRadius: "50%", background: "var(--lp-cor)" }} />
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
          <Titulo tema={tema} size={27}>
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

    case "galeria":
      return (
        <>
          <Titulo tema={tema} size={27}>
            {campo("titulo", "Galeria / Trabalhos")}
          </Titulo>
          <ItemGrid>
            {itens.map((it) => (
              <Card key={it.id} tema={tema} noPad>
                <div
                  style={{
                    height: 96,
                    borderRadius: `${lpRadius(tema, 0.6)}px ${lpRadius(tema, 0.6)}px 0 0`,
                    background: "linear-gradient(135deg, var(--lp-cor), var(--lp-cor-secundaria))",
                  }}
                />
                <div className="flex flex-col gap-1.5 p-4">
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{it.campos.titulo || "Título"}</div>
                  <Texto color={suave}>{it.campos.descricao}</Texto>
                </div>
              </Card>
            ))}
          </ItemGrid>
        </>
      );

    case "habilidades":
      return (
        <>
          <Titulo tema={tema} size={27}>
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
                  <div style={{ height: 8, borderRadius: 999, background: "var(--lp-fundo-alt)" }}>
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
          <Titulo tema={tema} size={27}>
            {campo("titulo", "Fale com a gente")}
          </Titulo>
          <Texto color={suave}>{campo("subtitulo", "Preencha os dados e retornaremos em breve.")}</Texto>
          <div className="flex w-full max-w-sm flex-col gap-2.5">
            <MockInput tema={tema}>Nome</MockInput>
            <MockInput tema={tema}>E-mail</MockInput>
            <MockInput tema={tema} tall>
              Mensagem
            </MockInput>
            <Botao tema={tema}>Enviar</Botao>
          </div>
        </div>
      );

    case "contato":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <Titulo tema={tema} size={27}>
            {campo("titulo", "Vamos conversar?")}
          </Titulo>
          <Texto color={suave}>{campo("texto", "Entre em contato conosco.")}</Texto>
        </div>
      );

    case "cta":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <Titulo tema={tema} size={30}>
            {campo("titulo", "Chamada final")}
          </Titulo>
          <Texto color={suave}>{campo("subtitulo", "Reforce o próximo passo que o visitante deve dar.")}</Texto>
          <Botao tema={tema} invertido>
            {campo("cta", "Call to action")}
          </Botao>
        </div>
      );

    default:
      return (
        <div style={{ fontSize: 13, color: suave }}>Bloco &ldquo;{secao.tipo}&rdquo; sem preview dedicado.</div>
      );
  }
}

function Titulo({ tema, size, children }: { tema: LandingPageTheme; size: number; children: ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--lp-fonte-titulo)", fontWeight: 800, fontSize: size, lineHeight: 1.15, margin: 0 }}>
      {children}
    </h2>
  );
}

function Texto({ children, color }: { children: ReactNode; color: string }) {
  return (
    <p style={{ fontSize: 14.5, lineHeight: 1.6, color, margin: 0, whiteSpace: "pre-line" }}>{children}</p>
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
  tema,
  children,
  destacado,
  centered,
  noPad,
}: {
  tema: LandingPageTheme;
  children: ReactNode;
  destacado?: boolean;
  centered?: boolean;
  noPad?: boolean;
}) {
  const style: CSSProperties = {
    background: "var(--lp-fundo-alt)",
    borderRadius: `${lpRadius(tema)}px`,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "hidden",
  };
  if (!noPad) style.padding = 18;
  if (centered) {
    style.alignItems = "center";
    style.textAlign = "center";
  }
  if (destacado) {
    style.outline = "2px solid var(--lp-cor)";
    style.outlineOffset = -2;
  }
  return <div style={style}>{children}</div>;
}

function Botao({ tema, children, invertido }: { tema: LandingPageTheme; children: ReactNode; invertido?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "10px 24px",
        fontSize: 13.5,
        fontWeight: 600,
        borderRadius: `${botaoRadius(tema)}px`,
        background: invertido ? "#ffffff" : "var(--lp-cor)",
        color: invertido ? "var(--lp-cor)" : "#ffffff",
      }}
    >
      {children}
    </span>
  );
}

function MockInput({ tema, children, tall }: { tema: LandingPageTheme; children: ReactNode; tall?: boolean }) {
  return (
    <div
      style={{
        background: "var(--lp-fundo-alt)",
        borderRadius: `${Math.max(6, lpRadius(tema, 0.5))}px`,
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
