/**
 * Smoke real: gera um zip por tema (6 no total), cada um com os 15 blocos do
 * catálogo, variantes não-padrão e overrides de design, e valida a estrutura
 * (page.tsx/layout.tsx/globals.css presentes e não-vazios, decor do background
 * correto).
 *
 * Roda junto com `pnpm test`. Com LP_SMOKE_OUT setado, grava os zips no diretório indicado para inspeção manual.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import AdmZip from "adm-zip";
import {
  SECAO_BLOCKS,
  defaultFooterConfig,
  defaultHeaderConfig,
  defaultItem,
  novoNavItem,
  type GerarLandingPageInput,
  type Secao,
} from "@danlimadev/contracts";
import { describe, expect, it } from "vitest";
import { generateLandingPageZip } from "../src/generate";
import { LANDING_PAGE_MODELS } from "../src/models";

const OUT_DIR = process.env.LP_SMOKE_OUT ?? null;

/** Uma seção de cada um dos 15 tipos, com todos os campos preenchidos e uma variante não-padrão quando houver. */
function todasAsSecoes(): Secao[] {
  return Object.values(SECAO_BLOCKS).map((def, i) => {
    const campos: Record<string, string> = {};
    for (const c of def.campos) campos[c.key] = c.tipo === "booleano" ? "true" : `${c.label} de exemplo`;
    // hero/sobre com imagem real pra exercitar os caminhos de <img>
    if ("imagemUrl" in campos) campos.imagemUrl = "https://picsum.photos/seed/lp/960/640";

    let itens: Secao["itens"];
    if (def.itens) {
      itens = Array.from({ length: Math.min(3, def.itens.max) }, (_, j) => {
        const c = defaultItem(def.tipo);
        for (const cd of def.itens!.campos) {
          if (cd.tipo === "booleano") c[cd.key] = j === 0 ? "true" : "false";
          else if (cd.key === "valor") c[cd.key] = ["120", "4,8", "24/7"][j] ?? "10";
          else if (cd.key === "nivel") c[cd.key] = String(40 + j * 20);
          else if (cd.key === "horario") c[cd.key] = `0${9 + j}:00`;
          else if (cd.key === "imagemUrl") c[cd.key] = j === 0 ? "https://picsum.photos/seed/item/200/200" : "";
          else c[cd.key] = `${cd.label} ${j + 1}`;
        }
        return { id: `it-${def.tipo}-${j}`, campos: c };
      });
    }

    const variante = def.variantes && def.variantes.length > 1 ? def.variantes[1]!.id : def.variantes?.[0]?.id;
    return { id: `sec-${def.tipo}-${i}`, tipo: def.tipo, campos, itens, variante };
  });
}

function inputPara(temaId: string, corAcento: string): GerarLandingPageInput {
  const secoes = todasAsSecoes();
  return {
    modeloId: temaId,
    corAcento,
    // overrides deliberados pra provar que o design por página flui até o zip
    design: { radius: 10, estiloBotao: "pill" },
    header: {
      ...defaultHeaderConfig(`Smoke ${temaId}`),
      navItems: [novoNavItem("Início", "topo"), novoNavItem("Contato", "rodape")],
    },
    secoes,
    footer: { ...defaultFooterConfig(), email: "smoke@teste.com" },
    whatsapp: { ativo: true, numero: "(92) 99999-0000", mensagem: "Olá!" },
  };
}

describe("smoke: um zip real por tema, com os 15 blocos + overrides", () => {
  it.each(LANDING_PAGE_MODELS)("tema '$id' gera zip íntegro", async (tema) => {
    const { buffer, result } = await generateLandingPageZip(inputPara(tema.id, tema.cor));
    expect(result.tamanhoBytes).toBeGreaterThan(1000);

    const zip = new AdmZip(buffer);
    for (const nome of ["app/page.tsx", "app/layout.tsx", "app/globals.css", "package.json"]) {
      const entry = zip.getEntry(nome);
      expect(entry, `${nome} ausente no zip do tema ${tema.id}`).toBeTruthy();
      expect(entry!.getData().length).toBeGreaterThan(0);
    }

    const css = zip.getEntry("app/globals.css")!.getData().toString("utf-8");
    const page = zip.getEntry("app/page.tsx")!.getData().toString("utf-8");

    // o background do tema chega no CSS; os overrides chegam nas vars
    expect(css).toContain(`/* estiloBackground: ${tema.estiloBackground} */`);
    expect(css).toContain("--radius: 10px;");
    expect(css).toContain("--radius-btn: 999px;");
    // todos os 15 blocos presentes no page.tsx (via id da seção)
    for (const def of Object.values(SECAO_BLOCKS)) {
      expect(page, `bloco ${def.tipo} ausente no tema ${tema.id}`).toContain(`sec-${def.tipo}-`);
    }

    if (OUT_DIR) {
      await mkdir(OUT_DIR, { recursive: true });
      await writeFile(join(OUT_DIR, `${tema.id}.zip`), buffer);
    }
  });
});
