import { describe, expect, it } from "vitest";
import AdmZip from "adm-zip";
import { generateLandingPageZip } from "./generate";

const baseInput = {
  modeloId: "base",
  marca: "Clínica Vitalle",
  corAcento: "#818cf8",
  secoes: [{ id: "hero", tipo: "hero" as const, campos: { titulo: "Bem-vindo" } }],
};

describe("generateLandingPageZip", () => {
  it("produces a zip with tokens replaced and .template suffix stripped", async () => {
    const { buffer, result } = await generateLandingPageZip(baseInput);

    expect(result.nomeArquivo).toBe("clinica-vitalle.zip");
    expect(result.tamanhoBytes).toBe(buffer.byteLength);

    const zip = new AdmZip(buffer);
    const entryNames = zip.getEntries().map((e) => e.entryName);
    expect(entryNames).toContain("package.json");
    expect(entryNames).toContain("app/page.tsx");
    expect(entryNames.some((name) => name.endsWith(".template"))).toBe(false);

    const pageContent = zip.getEntry("app/page.tsx")!.getData().toString("utf-8");
    expect(pageContent).toContain("Clínica Vitalle");
    expect(pageContent).toContain("#818cf8");
    expect(pageContent).not.toContain("{{MARCA}}");

    const pkg = JSON.parse(zip.getEntry("package.json")!.getData().toString("utf-8"));
    expect(pkg.name).toBe("clinica-vitalle");
  });

  it("rejects an unknown model id before touching the filesystem", async () => {
    await expect(
      generateLandingPageZip({ ...baseInput, modeloId: "nao-existe" }),
    ).rejects.toThrow();
  });

  it("rejects input that fails the shared contract schema", async () => {
    await expect(
      generateLandingPageZip({ ...baseInput, corAcento: "not-a-hex-color" }),
    ).rejects.toThrow();
  });
});
