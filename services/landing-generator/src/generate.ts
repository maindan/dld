import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";
import {
  gerarLandingPageSchema,
  slugify,
  type GerarLandingPageInput,
  type GerarLandingPageResult,
} from "@danlimadev/contracts";
import { LANDING_PAGE_MODELS } from "./models";

const TEMPLATES_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "templates");

function applyTokens(content: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    content,
  );
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

export interface GenerateLandingPageOutput {
  buffer: Buffer;
  result: GerarLandingPageResult;
}

/**
 * Renders the `templates/<modeloId>` directory into a downloadable Next.js
 * project zip. Only the "base" model exists today; adding a model is adding
 * a template directory, not touching this function.
 */
export async function generateLandingPageZip(
  input: GerarLandingPageInput,
): Promise<GenerateLandingPageOutput> {
  const parsed = gerarLandingPageSchema.parse(input);

  if (!LANDING_PAGE_MODELS.some((m) => m.id === parsed.modeloId)) {
    throw new Error(`Modelo de landing page desconhecido: "${parsed.modeloId}"`);
  }
  const templateDir = join(TEMPLATES_DIR, parsed.modeloId);

  const tokens = {
    MARCA: parsed.marca,
    COR_ACENTO: parsed.corAcento,
    SLUG: slugify(parsed.marca) || "landing-page",
  };

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<void>((resolve, reject) => {
    archive.on("end", () => resolve());
    archive.on("error", reject);
  });

  for await (const filePath of walk(templateDir)) {
    const raw = await readFile(filePath, "utf-8");
    const rendered = applyTokens(raw, tokens);
    const relativePath = relative(templateDir, filePath).replace(/\.template$/, "");
    archive.append(rendered, { name: relativePath });
  }

  await archive.finalize();
  await done;

  const buffer = Buffer.concat(chunks);
  const nomeArquivo = `${tokens.SLUG}.zip`;

  return {
    buffer,
    result: { nomeArquivo, tamanhoBytes: buffer.byteLength },
  };
}
