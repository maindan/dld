"use server";

import { revalidatePath } from "next/cache";
import {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  moverPortfolioItem,
  getPortfolioItemImagem,
} from "@/lib/queries/portfolio";
import { uploadPublicFile, deletePublicFile } from "@/lib/supabase/storage";

function readPortfolioForm(formData: FormData) {
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    desc: String(formData.get("desc") ?? "").trim(),
    stack: String(formData.get("stack") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    github: String(formData.get("github") ?? "").trim(),
    link: String(formData.get("link") ?? "").trim(),
  };
}

async function readNovaImagem(formData: FormData): Promise<string | undefined> {
  const arquivo = formData.get("imagem");
  if (arquivo instanceof File && arquivo.size > 0) {
    return uploadPublicFile(arquivo, "portfolio");
  }
  return undefined;
}

export async function createPortfolioItemAction(formData: FormData) {
  const input = readPortfolioForm(formData);
  if (!input.titulo) return;
  const imagem = await readNovaImagem(formData);
  await createPortfolioItem({ ...input, imagem: imagem ?? null });
  revalidatePath("/portfolio");
}

export async function updatePortfolioItemAction(id: string, formData: FormData) {
  const input = readPortfolioForm(formData);
  if (!input.titulo) return;

  const novaImagem = await readNovaImagem(formData);
  if (novaImagem) {
    const imagemAnterior = await getPortfolioItemImagem(id);
    await updatePortfolioItem(id, { ...input, imagem: novaImagem });
    if (imagemAnterior) await deletePublicFile(imagemAnterior);
  } else {
    await updatePortfolioItem(id, input);
  }
  revalidatePath("/portfolio");
}

export async function deletePortfolioItemAction(id: string) {
  const imagem = await getPortfolioItemImagem(id);
  await deletePortfolioItem(id);
  if (imagem) await deletePublicFile(imagem);
  revalidatePath("/portfolio");
}

export async function moverPortfolioItemAction(id: string, direcao: "up" | "down") {
  await moverPortfolioItem(id, direcao);
  revalidatePath("/portfolio");
}
