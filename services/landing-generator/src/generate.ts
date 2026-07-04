import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import archiver from "archiver";
import { gerarLandingPageSchema, type GerarLandingPageInput, type GerarLandingPageResult } from "@danlimadev/contracts";
import { renderProject } from "./render/page";

// Deliberately NOT import.meta.url / import.meta.dirname: Turbopack's bundling of
// the consuming Next.js Route Handler for production (Vercel) doesn't reliably
// preserve either — observed both "Invalid URL" (ERR_INVALID_URL, mangled
// import.meta.url passed to fileURLToPath) and import.meta.dirname coming out
// `undefined` at module evaluation. process.cwd() is a live Node call the
// bundler can't rewrite or inline away. Pairs with `outputFileTracingRoot` +
// `outputFileTracingIncludes` in apps/web/next.config.ts, which point Next's
// file tracer at this directory and guarantee the monorepo-root-relative path
// resolves the same way in dev, in `next build`, and in the deployed function
// (all three run with cwd = apps/web, the directory containing next.config.ts).
const SKELETON_DIR = join(process.cwd(), "../../services/landing-generator/src/skeleton");

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

/**
 * On-disk skeleton filename -> zip entry name, for the 2 cases where they must differ:
 *
 *  - `gitignore` -> `.gitignore`: a literal `.gitignore` living inside this repo's
 *    `src/skeleton/` would apply its own ignore rules to that subtree, confusing for a
 *    file that's actually just zip payload — so it's kept dotless on disk.
 *  - `*.d.ts.template` -> `*.d.ts`: Next.js's serverless file tracer (collect-build-traces.js)
 *    unconditionally ignores every `**​/*.d.ts` when bundling the Vercel function for the
 *    `/api/landing-pages/[id]/gerar` route (see next.config.ts's outputFileTracingIncludes) —
 *    it assumes .d.ts files are never needed at runtime, which is true for real TypeScript
 *    but not here, where they're just static template bytes read via readFile(). Renamed on
 *    disk to dodge that filter, renamed back only at archive time.
 *
 * Every other skeleton file's on-disk name is its zip name.
 */
function skeletonEntryName(relativePath: string): string {
  if (relativePath === "gitignore") return ".gitignore";
  if (relativePath.endsWith(".d.ts.template")) return relativePath.slice(0, -".template".length);
  return relativePath;
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
