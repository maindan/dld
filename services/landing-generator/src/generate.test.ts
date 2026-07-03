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

    // (b) cada campo/item aparece literalmente no output
    expect(pageContent).toContain(`Titulo Hero ${theme.id}`);
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
// All 13 catalog block types render standalone, without throwing
// ---------------------------------------------------------------------------

describe("generateLandingPageZip - todos os tipos de bloco do catálogo", () => {
  const tipos = Object.keys(SECAO_BLOCKS);

  it("cobre pelo menos os 13 tipos descritos no contrato, sem nenhum ficar de fora do dispatch de renderização", () => {
    expect(tipos.length).toBeGreaterThanOrEqual(13);
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
