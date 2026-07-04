"use server";

import { revalidatePath } from "next/cache";
import {
  createLandingPage,
  deleteLandingPage,
  updateLandingPage,
  type LandingPagePatch,
} from "@/lib/queries/landing-pages";
import { uploadPublicFile, deletePublicFile } from "@/lib/supabase/storage";

export async function createLandingPageAction(modeloId: string, freelaId: string | null = null) {
  const row = await createLandingPage(modeloId, freelaId);
  revalidatePath("/workstation");
  return row;
}

export async function deleteLandingPageAction(id: string) {
  await deleteLandingPage(id);
  revalidatePath("/workstation");
}

/** Autosave endpoint for the editor: accepts a partial patch of whatever field(s) changed
 * (corAcento / header / secoes / footer / whatsapp) and persists it. Called on debounce
 * from the client — section/item add/remove/reorder is all resolved client-side first
 * (crypto.randomUUID()), then flushed through here. */
export async function updateLandingPageAction(id: string, patch: LandingPagePatch): Promise<void> {
  await updateLandingPage(id, patch);
  revalidatePath(`/workstation/landing-pages/${id}/editor`);
}

/** Shared upload-and-swap: sends the new file to Supabase Storage, deletes the previous
 * one (if it was a bucket URL — deletePublicFile no-ops on anything else) and returns
 * the new public URL. */
async function swapPublicFile(id: string, folder: string, file: File, previousUrl: string | null): Promise<string> {
  const url = await uploadPublicFile(file, folder);
  if (previousUrl) await deletePublicFile(previousUrl);
  revalidatePath(`/workstation/landing-pages/${id}/editor`);
  return url;
}

/** Uploads a logo to Supabase Storage and deletes the previous one, if any. The caller
 * (editor) is responsible for writing the returned URL into header.logoUrl and letting
 * the generic autosave persist it — logo storage is a side effect, not editor state. */
export async function uploadLandingPageLogoAction(id: string, file: File, previousUrl: string | null): Promise<string> {
  return swapPublicFile(id, "landing-pages/logos", file, previousUrl);
}

/** Uploads a content image (hero/sobre/galeria/equipe/depoimentos/marcas "imagem"
 * fields) and deletes the replaced one. The caller writes the returned URL into the
 * section's campos and lets the generic autosave persist it. */
export async function uploadLandingPageImagemAction(id: string, file: File, previousUrl: string | null): Promise<string> {
  return swapPublicFile(id, "landing-pages/conteudo", file, previousUrl);
}

/** Removes a previously uploaded content image from storage (no-op for external URLs).
 * Called when the user clears an "imagem" field; the field itself is emptied client-side
 * and persisted by the generic autosave. */
export async function removerLandingPageImagemAction(publicUrl: string): Promise<void> {
  await deletePublicFile(publicUrl);
}
