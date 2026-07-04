import { describe, expect, it } from "vitest";
import AdmZip from "adm-zip";
import {
  SECAO_BLOCKS,
  defaultCampos,
  defaultFooterConfig,
  defaultHeaderConfig,
  defaultItem,
  defaultWhatsappConfig,
  novoNavItem,
  type GerarLandingPageInput,
  type Secao,
} from "@danlimadev/contracts";
import { generateLandingPageZip } from "./generate";
import { LANDING_PAGE_MODELS } from "./models";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function secao(
  id: string,
  tipo: string,
  campos: Record<string, string>,
  itens?: Array<{ id: string; campos: Record<string, string> }>,
): Secao {
  return { id, tipo, campos, itens };
}

/**
 * Builds a full `GerarLandingPageInput` with 4 varied sections (one of them
 * — "servicos" — using `itens`), a header with a distinct nav, and a footer
 * with address/phone/email/social. Every piece of copy is tagged with
 * `modeloId` so each theme's test run has its own unmistakable markers.
 */
function buildInput(opts: {
  modeloId: string;
  corAcento: string;
  comLogo: boolean;
  whatsappAtivo: boolean;
}): GerarLandingPageInput {
  const { modeloId: m, corAcento, comLogo, whatsappAtivo } = opts;

  const heroId = "sec-hero";
  const servicosId = "sec-servicos";
  const depoimentosId = "sec-depoimentos";
  const faqId = "sec-faq";

  return {
    modeloId: m,
    corAcento,
    header: {
      mostrarLogo: true,
      logoUrl: comLogo ? "https://cdn.exemplo.com/logo.png" : null,
      mostrarTitulo: true,
      titulo: `Marca ${m}`,
      navItems: [
        novoNavItem("Início", "topo"),
        novoNavItem("Serviços", servicosId),
        novoNavItem("Contato", "rodape"),
      ],
    },
    secoes: [
      secao(heroId, "hero", {
        titulo: `Titulo Hero ${m}`,
        subtitulo: `Subtitulo Hero ${m}`,
        cta: `CTA Hero ${m}`,
      }),
      secao(servicosId, "servicos", { titulo: `Titulo Servicos ${m}` }, [
        { id: "s1", campos: { titulo: `Servico Um ${m}`, texto: `Descricao Servico Um ${m}` } },
        { id: "s2", campos: { titulo: `Servico Dois ${m}`, texto: `Descricao Servico Dois ${m}` } },
      ]),
      secao(depoimentosId, "depoimentos", { titulo: `Titulo Depoimentos ${m}` }, [
        {
          id: "d1",
          campos: { nome: `Cliente Um ${m}`, cargo: `Cargo Um ${m}`, texto: `Texto Depoimento Um ${m}` },
        },
      ]),
      secao(faqId, "faq", { titulo: `Titulo Faq ${m}` }, [
        { id: "f1", campos: { pergunta: `Pergunta Um ${m}`, resposta: `Resposta Um ${m}` } },
      ]),
    ],
    footer: {
      texto: `Direitos Reservados ${m}`,
      endereco: `Endereco ${m}`,
      telefone: `Telefone ${m}`,
      email: `contato-${m}@teste.com`,
      redesSociais: [{ id: "r1", rede: "Instagram", url: `https://instagram.com/${m}` }],
    },
    whatsapp: {
      ativo: whatsappAtivo,
      numero: "(11) 91234-5678",
      mensagem: `Olá, vim do site ${m}`,
    },
  };
}

function readEntry(zip: AdmZip, name: string): string {
  const entry = zip.getEntry(name);
  if (!entry) throw new Error(`zip entry not found: ${name}`);
  return entry.getData().toString("utf-8");
}

// ---------------------------------------------------------------------------
// Baseline behaviour: project shape, error handling
// ---------------------------------------------------------------------------

describe("generateLandingPageZip - estrutura do projeto gerado", () => {
  it("produz um zip com o esqueleto completo de um projeto Next.js", async () => {
    const input = buildInput({ modeloId: "base", corAcento: "#818cf8", comLogo: true, whatsappAtivo: true });
    const { buffer, result } = await generateLandingPageZip(input);

    expect(result.tamanhoBytes).toBe(buffer.byteLength);
    expect(result.nomeArquivo).toBe("marca-base.zip");

    const zip = new AdmZip(buffer);
    const entryNames = zip.getEntries().map((e) => e.entryName);

    expect(entryNames).toContain("package.json");
    expect(entryNames).toContain("next.config.mjs");
    expect(entryNames).toContain("tsconfig.json");
    expect(entryNames).toContain("next-env.d.ts");
    // augmentação que libera custom properties CSS (--i/--hd/--w) no style inline
    expect(entryNames).toContain("css-custom-properties.d.ts");
    expect(entryNames).toContain(".gitignore");
    expect(entryNames).toContain("README.md");
    expect(entryNames).toContain("app/page.tsx");
    expect(entryNames).toContain("app/layout.tsx");
    expect(entryNames).toContain("app/globals.css");
    // the on-disk skeleton file is named "gitignore" (dotless) to avoid a
    // real nested .gitignore inside this repo's src/skeleton/ — it must not
    // leak into the zip under its on-disk name.
    expect(entryNames).not.toContain("gitignore");
    expect(entryNames.some((name) => name.endsWith(".template"))).toBe(false);

    const pkg = JSON.parse(readEntry(zip, "package.json"));
    expect(pkg.name).toBe("marca-base");
    expect(pkg.dependencies.next).toBeDefined();
  });

  it("rejeita um modeloId desconhecido antes de gerar qualquer arquivo", async () => {
    const input = buildInput({ modeloId: "nao-existe", corAcento: "#818cf8", comLogo: true, whatsappAtivo: true });
    await expect(generateLandingPageZip(input)).rejects.toThrow(/Modelo de landing page desconhecido/);
  });

  it("rejeita entradas que falham no schema do contrato compartilhado", async () => {
    const input = buildInput({ modeloId: "base", corAcento: "not-a-hex-color", comLogo: true, whatsappAtivo: true });
    await expect(generateLandingPageZip(input)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Per-theme rendering: colors, literal copy, WhatsApp button
// ---------------------------------------------------------------------------

describe.each(LANDING_PAGE_MODELS)("generateLandingPageZip - tema '$id'", (theme) => {
  it("com logo e WhatsApp ativo: cores do tema, fontes, textos literais e link do wa.me corretos", async () => {
    const input = buildInput({ modeloId: theme.id, corAcento: theme.cor, comLogo: true, whatsappAtivo: true });
    const { buffer, result } = await generateLandingPageZip(input);
    expect(result.tamanhoBytes).toBe(buffer.byteLength);

    const zip = new AdmZip(buffer);
    const pageContent = readEntry(zip, "app/page.tsx");
    const cssContent = readEntry(zip, "app/globals.css");
    const layoutContent = readEntry(zip, "app/layout.tsx");

    // (a) cores do tema aparecem no CSS
    expect(cssContent).toContain(theme.cor);
    expect(cssContent).toContain(theme.corSecundaria);
    expect(cssContent).toContain(theme.corFundo);
    expect(cssContent).toContain(theme.corFundoAlt);
    expect(cssContent).toContain(theme.corTexto);
    expect(cssContent).toContain(theme.corTextoSuave);
    expect(cssContent).toContain(`${theme.radius}px`);

    // fontes do tema (Google Fonts href na layout)
    expect(layoutContent).toContain(theme.fonteTitulo.replace(/\s+/g, "+"));
    expect(layoutContent).toContain("fonts.googleapis.com/css2");

    // header: variante do tema aplicada, logo real (img) presente
    expect(pageContent).toContain(`site-header--${theme.estiloHeader}`);
    expect(pageContent).toContain("https://cdn.exemplo.com/logo.png");
    expect(pageContent).toContain("<img");
    expect(pageContent).toContain(`Marca ${theme.id}`);

    // (b) cada campo/item aparece literalmente no output. O título do hero é
    // a exceção intencional: o gerador o divide para aplicar o gradiente de
    // acento na última palavra (tituloComGradiente), então as duas metades
    // aparecem como literais separados.
    expect(pageContent).toContain(`Titulo Hero `);
    expect(pageContent).toContain(`<span className="hero-grad">{${JSON.stringify(theme.id)}}</span>`);
    expect(pageContent).toContain(`Subtitulo Hero ${theme.id}`);
    expect(pageContent).toContain(`CTA Hero ${theme.id}`);
    expect(pageContent).toContain(`Titulo Servicos ${theme.id}`);
    expect(pageContent).toContain(`Servico Um ${theme.id}`);
    expect(pageContent).toContain(`Descricao Servico Um ${theme.id}`);
    expect(pageContent).toContain(`Servico Dois ${theme.id}`);
    expect(pageContent).toContain(`Descricao Servico Dois ${theme.id}`);
    expect(pageContent).toContain(`Cliente Um ${theme.id}`);
    expect(pageContent).toContain(`Cargo Um ${theme.id}`);
    expect(pageContent).toContain(`Texto Depoimento Um ${theme.id}`);
    expect(pageContent).toContain(`Pergunta Um ${theme.id}`);
    expect(pageContent).toContain(`Resposta Um ${theme.id}`);
    expect(pageContent).toContain(`Direitos Reservados ${theme.id}`);
    expect(pageContent).toContain(`Endereco ${theme.id}`);
    expect(pageContent).toContain(`Telefone ${theme.id}`);
    expect(pageContent).toContain(`contato-${theme.id}@teste.com`);
    expect(pageContent).toContain(`https://instagram.com/${theme.id}`);

    // section ids são preservados para os anchors do header funcionarem
    expect(pageContent).toContain("sec-hero");
    expect(pageContent).toContain("sec-servicos");
    expect(pageContent).toContain('id="rodape"');

    // (c) botão de WhatsApp ativo, com link wa.me correto (número só com dígitos)
    expect(pageContent).toContain("whatsapp-float");
    expect(pageContent).toContain("https://wa.me/11912345678?text=");
    expect(pageContent).toContain(encodeURIComponent(`Olá, vim do site ${theme.id}`));
  });

  it("sem logo e WhatsApp inativo: fallback colorido no lugar do logo e nenhum botão de WhatsApp", async () => {
    const input = buildInput({ modeloId: theme.id, corAcento: theme.cor, comLogo: false, whatsappAtivo: false });
    const { buffer } = await generateLandingPageZip(input);

    const zip = new AdmZip(buffer);
    const pageContent = readEntry(zip, "app/page.tsx");

    expect(pageContent).toContain("site-header__logo-fallback");
    expect(pageContent).not.toContain("<img");
    expect(pageContent).not.toContain("wa.me");
    expect(pageContent).not.toContain("whatsapp-float");
  });
});

// ---------------------------------------------------------------------------
// Design system: theme defaults, per-page overrides, decor, animation scripts
// ---------------------------------------------------------------------------

describe("generateLandingPageZip - design resolvido (tema + overrides)", () => {
  it("sem overrides: usa os defaults do tema (background, card, radius, animação)", async () => {
    const input = buildInput({ modeloId: "produto", corAcento: "#818cf8", comLogo: true, whatsappAtivo: false });
    const { buffer } = await generateLandingPageZip(input);

    const zip = new AdmZip(buffer);
    const cssContent = readEntry(zip, "app/globals.css");
    const pageContent = readEntry(zip, "app/page.tsx");

    // tema "produto": aurora + glass + radius 16 + zoom-in
    expect(cssContent).toContain("/* estiloBackground: aurora */");
    expect(cssContent).toContain("/* estiloCard: glass */");
    expect(cssContent).toContain("--radius: 16px;");
    expect(cssContent).toContain("estiloAnimacao: zoom-in");
    // decor de aurora entra como primeiro filho do <main>, e as seções ganham data-reveal
    expect(pageContent).toContain("bg-decor--aurora");
    expect(pageContent).toContain("data-reveal");
    expect(pageContent).toContain("IntersectionObserver");
  });

  it("com overrides: fonte, background, botão, card, radius e animação do design vencem o tema", async () => {
    const input: GerarLandingPageInput = {
      ...buildInput({ modeloId: "base", corAcento: "#10b981", comLogo: false, whatsappAtivo: false }),
      design: {
        fonteTitulo: "Syne",
        estiloBotao: "pill",
        estiloAnimacao: "none",
        estiloBackground: "grid-glow",
        estiloCard: "outline",
        radius: 0,
      },
    };
    const { buffer } = await generateLandingPageZip(input);

    const zip = new AdmZip(buffer);
    const cssContent = readEntry(zip, "app/globals.css");
    const pageContent = readEntry(zip, "app/page.tsx");
    const layoutContent = readEntry(zip, "app/layout.tsx");

    expect(layoutContent).toContain("family=Syne");
    expect(cssContent).toContain("/* estiloBackground: grid-glow */");
    expect(cssContent).toContain("/* estiloCard: outline */");
    expect(cssContent).toContain("--radius: 0px;");
    expect(cssContent).toContain("--radius-btn: 999px;");
    expect(pageContent).toContain("bg-decor--grid-glow");
    // estiloAnimacao none: nenhuma seção ganha data-reveal e o script de reveal não embarca
    expect(pageContent).not.toContain("data-reveal");
    expect(pageContent).not.toContain("IntersectionObserver");
  });

  it("estiloBackground minimal: nenhum decor no markup nem CSS de camada decorativa", async () => {
    const input: GerarLandingPageInput = {
      ...buildInput({ modeloId: "base", corAcento: "#6366f1", comLogo: false, whatsappAtivo: false }),
      design: { estiloBackground: "minimal" },
    };
    const { buffer } = await generateLandingPageZip(input);

    const zip = new AdmZip(buffer);
    const pageContent = readEntry(zip, "app/page.tsx");
    const cssContent = readEntry(zip, "app/globals.css");

    expect(pageContent).not.toContain("bg-decor");
    expect(cssContent).toContain("/* estiloBackground: minimal */");
  });

  it("bloco estatisticas: contadores com data-target e o script de contagem embarcado", async () => {
    const base = buildInput({ modeloId: "base", corAcento: "#6366f1", comLogo: false, whatsappAtivo: false });
    const input: GerarLandingPageInput = {
      ...base,
      secoes: [
        ...base.secoes,
        secao("sec-stats", "estatisticas", { titulo: "Números" }, [
          { id: "e1", campos: { valor: "120", sufixo: "+", label: "projetos" } },
          { id: "e2", campos: { valor: "4,8", sufixo: "", label: "avaliação média" } },
          { id: "e3", campos: { valor: "24/7", sufixo: "", label: "suporte" } },
        ]),
      ],
    };
    const { buffer } = await generateLandingPageZip(input);
    const pageContent = readEntry(new AdmZip(buffer), "app/page.tsx");

    expect(pageContent).toContain(`data-counter data-target="120" data-decimals="0"`);
    // decimal com vírgula: target com ponto, display pt-BR
    expect(pageContent).toContain(`data-counter data-target="4.8" data-decimals="1"`);
    expect(pageContent).toContain(`{"4,8"}`);
    // "24/7" não é contável: renderiza literal, sem data-counter
    expect(pageContent).toContain(`<span>{"24/7"}</span>`);
    expect(pageContent).toContain("data-counter");
    expect(pageContent).toContain("requestAnimationFrame");
  });

  it("sem bloco estatisticas: o script de contadores não embarca", async () => {
    const input = buildInput({ modeloId: "base", corAcento: "#6366f1", comLogo: false, whatsappAtivo: false });
    const { buffer } = await generateLandingPageZip(input);
    const pageContent = readEntry(new AdmZip(buffer), "app/page.tsx");

    expect(pageContent).not.toContain("data-counter");
    expect(pageContent).not.toContain("requestAnimationFrame");
  });

  it("bloco marcas: marquee com grupo duplicado aria-hidden (loop contínuo)", async () => {
    const base = buildInput({ modeloId: "base", corAcento: "#6366f1", comLogo: false, whatsappAtivo: false });
    const input: GerarLandingPageInput = {
      ...base,
      secoes: [
        ...base.secoes,
        secao("sec-marcas", "marcas", { titulo: "Quem confia" }, [
          { id: "m1", campos: { nome: "Acme", imagemUrl: "" } },
          { id: "m2", campos: { nome: "Globex", imagemUrl: "https://cdn.exemplo.com/globex.svg" } },
          { id: "m3", campos: { nome: "Initech", imagemUrl: "" } },
        ]),
      ],
    };
    const { buffer } = await generateLandingPageZip(input);
    const pageContent = readEntry(new AdmZip(buffer), "app/page.tsx");

    expect(pageContent).toContain(`className="marquee"`);
    expect(pageContent).toContain(`<div className="marquee-group" aria-hidden="true">`);
    expect(pageContent).toContain(`{"Acme"}`);
    expect(pageContent).toContain("https://cdn.exemplo.com/globex.svg");
  });

  it("variantes de layout: hero split e depoimentos marquee saem com as classes certas", async () => {
    const base = buildInput({ modeloId: "base", corAcento: "#6366f1", comLogo: false, whatsappAtivo: false });
    const input: GerarLandingPageInput = {
      ...base,
      secoes: base.secoes.map((s) => {
        if (s.tipo === "hero") return { ...s, variante: "split" };
        if (s.tipo === "depoimentos") return { ...s, variante: "marquee" };
        return s;
      }),
    };
    const { buffer } = await generateLandingPageZip(input);
    const pageContent = readEntry(new AdmZip(buffer), "app/page.tsx");

    expect(pageContent).toContain("hero--split");
    // split sem imagemUrl: mockup CSS no lugar de <img> quebrada
    expect(pageContent).toContain("hero-mockup");
    expect(pageContent).toContain("testimonials-marquee");
  });

  it("variante desconhecida degrada para o layout padrão em vez de quebrar", async () => {
    const base = buildInput({ modeloId: "base", corAcento: "#6366f1", comLogo: false, whatsappAtivo: false });
    const input: GerarLandingPageInput = {
      ...base,
      secoes: base.secoes.map((s) => (s.tipo === "hero" ? { ...s, variante: "nao-existe" } : s)),
    };
    const { buffer } = await generateLandingPageZip(input);
    const pageContent = readEntry(new AdmZip(buffer), "app/page.tsx");

    expect(pageContent).toContain("hero--centrado");
  });
});

// ---------------------------------------------------------------------------
// All 15 catalog block types render standalone, without throwing
// ---------------------------------------------------------------------------

describe("generateLandingPageZip - todos os tipos de bloco do catálogo", () => {
  const tipos = Object.keys(SECAO_BLOCKS);

  it("cobre pelo menos os 15 tipos descritos no contrato, sem nenhum ficar de fora do dispatch de renderização", () => {
    expect(tipos.length).toBeGreaterThanOrEqual(15);
  });

  it.each(tipos)("renderiza o bloco '%s' isoladamente sem lançar erro", async (tipo) => {
    const def = SECAO_BLOCKS[tipo]!;

    const campos = defaultCampos(tipo);
    for (const c of def.campos) {
      campos[c.key] = c.tipo === "booleano" ? "false" : `Valor de ${c.key}`;
    }

    let itens: Array<{ id: string; campos: Record<string, string> }> | undefined;
    if (def.itens) {
      const itemCampos = defaultItem(tipo);
      for (const c of def.itens.campos) {
        itemCampos[c.key] = c.tipo === "booleano" ? "true" : `Valor de item ${c.key}`;
      }
      itens = [{ id: "item-unico", campos: itemCampos }];
    }

    const input: GerarLandingPageInput = {
      modeloId: "base",
      corAcento: "#818cf8",
      header: defaultHeaderConfig(`Teste ${tipo}`),
      secoes: [secao("sec-unica", tipo, campos, itens)],
      footer: defaultFooterConfig(),
      whatsapp: defaultWhatsappConfig(),
    };

    const { buffer } = await generateLandingPageZip(input);
    expect(buffer.byteLength).toBeGreaterThan(0);

    const zip = new AdmZip(buffer);
    const pageContent = readEntry(zip, "app/page.tsx");
    expect(pageContent).toContain("sec-unica");
    expect(pageContent.length).toBeGreaterThan(0);
  });
});
