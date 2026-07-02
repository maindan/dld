import { z } from "zod";

/**
 * Boundary contract between apps/web (editor UI) and services/landing-generator
 * (Next.js project scaffolder). Neither side should reach past this shape.
 */
export const landingPageSectionSchema = z.object({
  id: z.string(),
  tipo: z.enum(["header", "hero", "sobre", "servicos", "contato", "footer"]),
  campos: z.record(z.string(), z.string()),
});

export const gerarLandingPageSchema = z.object({
  modeloId: z.string(),
  marca: z.string().min(1),
  corAcento: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secoes: z.array(landingPageSectionSchema).min(1),
});
export type GerarLandingPageInput = z.infer<typeof gerarLandingPageSchema>;

export const gerarLandingPageResultSchema = z.object({
  nomeArquivo: z.string(),
  tamanhoBytes: z.number().int().nonnegative(),
});
export type GerarLandingPageResult = z.infer<typeof gerarLandingPageResultSchema>;
