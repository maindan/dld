import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";
import { gerarLandingPageSchema, type GerarLandingPageInput, type GerarLandingPageResult } from "@danlimadev/contracts";
import { renderProject } from "./render/page";

// `dirname(fileURLToPath(...))` instead of `fileURLToPath(new URL(".", import.meta.url))`:
// the latter constructs an intermediate URL object that Turbopack's module wrapping of
// `import.meta.url` doesn't reliably round-trip (throws "Received an instance of URL" at
// runtime under `next dev`), even though plain Node ESM handles it fine.
const SKELETON_DIR = join(dirname(fileURLToPath(import.meta.url)), "skeleton");

export interface GenerateLandingPageOutput {
  buffer: Buffer;
  result: GerarLandingPageResult;
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

/** `skeleton/gitignore` -> `.gitignore` in the zip (a literal `.gitignore` file living inside
 * this repo's `src/skeleton/` would apply its own ignore rules to that subtree, which is
 * confusing for a file that's actually just zip payload — so it's kept dotless on disk and
 * renamed only at archive time). Every other skeleton file's on-disk name is its zip name. */
function skeletonEntryName(relativePath: string): string {
  return relativePath === "gitignore" ? ".gitignore" : relativePath;
}

/**
 * Renders a full, real Next.js project (App Router) from a `GerarLandingPageInput`
 * and packs it into a downloadable zip buffer.
 *
 * Two halves, cleanly separated:
 *  - `src/skeleton/` — files that never vary by theme or content (package.json,
 *    next.config.mjs, tsconfig.json, next-env.d.ts, .gitignore, README.md). Copied
 *    byte-for-byte except `package.json`, whose `name` field is set to the project's slug.
 *  - `src/render/` — the actual rendering engine. `renderProject` turns the chosen theme
 *    (`LANDING_PAGE_MODELS`) plus every dynamic section/header/footer/whatsapp config into
 *    `app/page.tsx`, `app/layout.tsx` and `app/globals.css`.
 */
export async function generateLandingPageZip(input: GerarLandingPageInput): Promise<GenerateLandingPageOutput> {
  const parsed = gerarLandingPageSchema.parse(input);

  // Throws with a clear message for an unknown modeloId before any archiving work happens.
  const { slug, pageTsx, layoutTsx, globalsCss } = renderProject(parsed);

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<void>((resolve, reject) => {
    archive.on("end", () => resolve());
    archive.on("error", reject);
  });

  for await (const filePath of walk(SKELETON_DIR)) {
    const relativePath = relative(SKELETON_DIR, filePath).split("\\").join("/");
    const entryName = skeletonEntryName(relativePath);

    if (relativePath === "package.json") {
      const pkg = JSON.parse(await readFile(filePath, "utf-8")) as Record<string, unknown>;
      pkg.name = slug;
      archive.append(JSON.stringify(pkg, null, 2) + "\n", { name: entryName });
      continue;
    }

    archive.append(await readFile(filePath), { name: entryName });
  }

  archive.append(pageTsx, { name: "app/page.tsx" });
  archive.append(layoutTsx, { name: "app/layout.tsx" });
  archive.append(globalsCss, { name: "app/globals.css" });

  await archive.finalize();
  await done;

  const buffer = Buffer.concat(chunks);
  const nomeArquivo = `${slug}.zip`;

  return {
    buffer,
    result: { nomeArquivo, tamanhoBytes: buffer.byteLength },
  };
}
