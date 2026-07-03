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

/** Uploads a logo to Supabase Storage and deletes the previous one, if any. The caller
 * (editor) is responsible for writing the returned URL into header.logoUrl and letting
 * the generic autosave persist it — logo storage is a side effect, not editor state. */
export async function uploadLandingPageLogoAction(id: string, file: File, previousUrl: string | null): Promise<string> {
  const url = await uploadPublicFile(file, "landing-pages/logos");
  if (previousUrl) await deletePublicFile(previousUrl);
  revalidatePath(`/workstation/landing-pages/${id}/editor`);
  return url;
}
