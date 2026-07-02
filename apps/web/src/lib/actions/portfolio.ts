"use server";

import { revalidatePath } from "next/cache";
import {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  moverPortfolioItem,
} from "@/lib/queries/portfolio";

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

export async function createPortfolioItemAction(formData: FormData) {
  const input = readPortfolioForm(formData);
  if (!input.titulo) return;
  await createPortfolioItem(input);
  revalidatePath("/portfolio");
}

export async function updatePortfolioItemAction(id: string, formData: FormData) {
  const input = readPortfolioForm(formData);
  if (!input.titulo) return;
  await updatePortfolioItem(id, input);
  revalidatePath("/portfolio");
}

export async function deletePortfolioItemAction(id: string) {
  await deletePortfolioItem(id);
  revalidatePath("/portfolio");
}

export async function moverPortfolioItemAction(id: string, direcao: "up" | "down") {
  await moverPortfolioItem(id, direcao);
  revalidatePath("/portfolio");
}
