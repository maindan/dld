import { db, landingPages, freelas } from "@danlimadev/db";
import { eq, desc } from "drizzle-orm";
import type { GerarLandingPageInput } from "@danlimadev/contracts";

export interface LandingPageDraft {
  id: string;
  modeloId: string;
  marca: string;
  corAcento: string;
  headerLinks: string;
  footerTexto: string;
  footerContato: string;
  freelaId: string | null;
  freelaNome: string | null;
  geradoEm: Date | null;
  arquivoNome: string | null;
}

export async function getLandingPageDrafts(): Promise<LandingPageDraft[]> {
  const rows = await db
    .select({
      id: landingPages.id,
      modeloId: landingPages.modeloId,
      marca: landingPages.marca,
      corAcento: landingPages.corAcento,
      headerLinks: landingPages.headerLinks,
      footerTexto: landingPages.footerTexto,
      footerContato: landingPages.footerContato,
      freelaId: landingPages.freelaId,
      freelaNome: freelas.nome,
      geradoEm: landingPages.geradoEm,
      arquivoNome: landingPages.arquivoNome,
    })
    .from(landingPages)
    .leftJoin(freelas, eq(landingPages.freelaId, freelas.id))
    .orderBy(desc(landingPages.createdAt));
  return rows;
}

function buildSecoes(input: { marca: string; headerLinks: string; footerTexto: string; footerContato: string }) {
  return [
    { id: "header", tipo: "header" as const, campos: { links: input.headerLinks } },
    { id: "hero", tipo: "hero" as const, campos: { titulo: input.marca } },
    { id: "contato", tipo: "contato" as const, campos: { texto: input.footerContato } },
    { id: "footer", tipo: "footer" as const, campos: { texto: input.footerTexto } },
  ];
}

export async function createLandingPageDraft(input: {
  marca: string;
  corAcento: string;
  headerLinks: string;
  footerTexto: string;
  footerContato: string;
  freelaId: string | null;
}) {
  const [draft] = await db
    .insert(landingPages)
    .values({
      modeloId: "base",
      marca: input.marca,
      corAcento: input.corAcento,
      headerLinks: input.headerLinks,
      footerTexto: input.footerTexto,
      footerContato: input.footerContato,
      freelaId: input.freelaId,
      secoes: buildSecoes(input),
    })
    .returning();
  return draft;
}

export async function deleteLandingPageDraft(id: string) {
  await db.delete(landingPages).where(eq(landingPages.id, id));
}

export async function getLandingPageGerarInput(id: string): Promise<GerarLandingPageInput | null> {
  const [draft] = await db.select().from(landingPages).where(eq(landingPages.id, id));
  if (!draft) return null;
  return {
    modeloId: draft.modeloId,
    marca: draft.marca,
    corAcento: draft.corAcento,
    secoes: draft.secoes as GerarLandingPageInput["secoes"],
  };
}

export async function marcarLandingPageGerada(id: string, arquivoNome: string) {
  await db
    .update(landingPages)
    .set({ geradoEm: new Date(), arquivoNome, updatedAt: new Date() })
    .where(eq(landingPages.id, id));
}
