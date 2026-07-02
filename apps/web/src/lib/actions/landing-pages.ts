"use server";

import { revalidatePath } from "next/cache";
import { createLandingPageDraft, deleteLandingPageDraft } from "@/lib/queries/landing-pages";

export async function createLandingPageDraftAction(formData: FormData) {
  const marca = String(formData.get("marca") ?? "").trim();
  if (!marca) return;
  await createLandingPageDraft({
    marca,
    corAcento: String(formData.get("corAcento") ?? "#818cf8"),
    headerLinks: String(formData.get("headerLinks") ?? "Início, Serviços, Sobre, Contato"),
    footerTexto: String(formData.get("footerTexto") ?? "").trim(),
    footerContato: String(formData.get("footerContato") ?? "").trim(),
    freelaId: String(formData.get("freelaId") ?? "").trim() || null,
  });
  revalidatePath("/workstation");
}

export async function deleteLandingPageDraftAction(id: string) {
  await deleteLandingPageDraft(id);
  revalidatePath("/workstation");
}
