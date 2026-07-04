import { db, landingPages, freelas } from "@danlimadev/db";
import { eq, desc } from "drizzle-orm";
import type {
  DesignConfig,
  GerarLandingPageInput,
  Secao,
  HeaderConfig,
  FooterConfig,
  WhatsappConfig,
} from "@danlimadev/contracts";
import { LANDING_PAGE_MODELS } from "@danlimadev/landing-generator/models";
import { buildInitialLandingPageState } from "@/lib/landing-pages/initial-secoes";

export type { Secao } from "@danlimadev/contracts";

export interface LandingPageListItem {
  id: string;
  modeloId: string;
  modeloNome: string;
  titulo: string;
  corAcento: string;
  freelaId: string | null;
  freelaNome: string | null;
  geradoEm: Date | null;
  arquivoNome: string | null;
  createdAt: Date;
}

export interface LandingPageDetail {
  id: string;
  modeloId: string;
  modeloNome: string;
  freelaId: string | null;
  corAcento: string;
  /** Per-page design overrides (Design tab); null = pure theme defaults. */
  design: DesignConfig | null;
  header: HeaderConfig;
  secoes: Secao[];
  footer: FooterConfig;
  whatsapp: WhatsappConfig;
  geradoEm: Date | null;
  arquivoNome: string | null;
}

export interface LandingPagePatch {
  corAcento?: string;
  /** null clears every override back to the theme defaults. */
  design?: DesignConfig | null;
  header?: HeaderConfig;
  secoes?: Secao[];
  footer?: FooterConfig;
  whatsapp?: WhatsappConfig;
}

function modeloNomeFor(modeloId: string): string {
  return LANDING_PAGE_MODELS.find((m) => m.id === modeloId)?.nome ?? modeloId;
}

/**
 * Named `Drafts` (not `List`) to keep matching the existing call site in
 * app/(app)/workstation/page.tsx.
 */
export async function getLandingPageDrafts(): Promise<LandingPageListItem[]> {
  const rows = await db
    .select({
      id: landingPages.id,
      modeloId: landingPages.modeloId,
      corAcento: landingPages.corAcento,
      header: landingPages.header,
      freelaId: landingPages.freelaId,
      freelaNome: freelas.nome,
      geradoEm: landingPages.geradoEm,
      arquivoNome: landingPages.arquivoNome,
      createdAt: landingPages.createdAt,
    })
    .from(landingPages)
    .leftJoin(freelas, eq(landingPages.freelaId, freelas.id))
    .orderBy(desc(landingPages.createdAt));

  return rows.map((row) => ({
    id: row.id,
    modeloId: row.modeloId,
    modeloNome: modeloNomeFor(row.modeloId),
    titulo: (row.header as HeaderConfig | null)?.titulo ?? "",
    corAcento: row.corAcento,
    freelaId: row.freelaId,
    freelaNome: row.freelaNome,
    geradoEm: row.geradoEm,
    arquivoNome: row.arquivoNome,
    createdAt: row.createdAt,
  }));
}

/** Seeds a brand-new draft with a theme-appropriate starter section set (see
 * lib/landing-pages/initial-secoes.ts) so the preview looks like a real page immediately. */
export async function createLandingPage(modeloId: string, freelaId: string | null = null) {
  const tema = LANDING_PAGE_MODELS.find((m) => m.id === modeloId) ?? LANDING_PAGE_MODELS[0];
  const initial = buildInitialLandingPageState(modeloId, tema.cor);

  const [row] = await db
    .insert(landingPages)
    .values({
      modeloId,
      corAcento: initial.corAcento,
      header: initial.header,
      footer: initial.footer,
      whatsapp: initial.whatsapp,
      secoes: initial.secoes,
      freelaId,
    })
    .returning({ id: landingPages.id });
  return row;
}

export async function getLandingPageDetail(id: string): Promise<LandingPageDetail | null> {
  const [row] = await db.select().from(landingPages).where(eq(landingPages.id, id));
  if (!row) return null;
  return {
    id: row.id,
    modeloId: row.modeloId,
    modeloNome: modeloNomeFor(row.modeloId),
    freelaId: row.freelaId,
    corAcento: row.corAcento,
    design: (row.design as DesignConfig | null) ?? null,
    header: row.header as HeaderConfig,
    secoes: (row.secoes as Secao[] | null) ?? [],
    footer: row.footer as FooterConfig,
    whatsapp: row.whatsapp as WhatsappConfig,
    geradoEm: row.geradoEm,
    arquivoNome: row.arquivoNome,
  };
}

/** Generic autosave endpoint: patch of whatever field(s) changed (corAcento / header /
 * secoes / footer / whatsapp), called on debounce from the editor. */
export async function updateLandingPage(id: string, patch: LandingPagePatch): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  await db
    .update(landingPages)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(landingPages.id, id));
}

export async function deleteLandingPage(id: string): Promise<void> {
  await db.delete(landingPages).where(eq(landingPages.id, id));
}

/** Direct 1:1 mapping to the services/landing-generator boundary contract — header/footer/
 * whatsapp are now real columns, no more synthesizing fake header/footer sections. */
export async function getLandingPageGerarInput(id: string): Promise<GerarLandingPageInput | null> {
  const draft = await getLandingPageDetail(id);
  if (!draft) return null;

  return {
    modeloId: draft.modeloId,
    corAcento: draft.corAcento,
    // Only forward `design` when there is at least one real override — the
    // generator treats "absent" as "theme defaults".
    ...(draft.design && Object.keys(draft.design).length > 0 ? { design: draft.design } : {}),
    header: draft.header,
    secoes: draft.secoes,
    footer: draft.footer,
    whatsapp: draft.whatsapp,
  };
}

export async function marcarLandingPageGerada(id: string, arquivoNome: string) {
  await db
    .update(landingPages)
    .set({ geradoEm: new Date(), arquivoNome, updatedAt: new Date() })
    .where(eq(landingPages.id, id));
}
