import { db, portfolioItens } from "@danlimadev/db";
import { asc, eq } from "drizzle-orm";

export interface PortfolioItem {
  id: string;
  titulo: string;
  desc: string;
  imagem: string | null;
  stack: string[];
  github: string;
  link: string;
  ordem: number;
}

export async function getPortfolioItens(): Promise<PortfolioItem[]> {
  return db.select().from(portfolioItens).orderBy(asc(portfolioItens.ordem));
}

export async function getPortfolioItemImagem(id: string): Promise<string | null> {
  const [row] = await db
    .select({ imagem: portfolioItens.imagem })
    .from(portfolioItens)
    .where(eq(portfolioItens.id, id));
  return row?.imagem ?? null;
}

export async function createPortfolioItem(input: {
  titulo: string;
  desc: string;
  stack: string[];
  github: string;
  link: string;
  imagem?: string | null;
}) {
  const itens = await db.select({ ordem: portfolioItens.ordem }).from(portfolioItens);
  const proximaOrdem = itens.reduce((max, i) => Math.max(max, i.ordem), -1) + 1;
  await db.insert(portfolioItens).values({ ...input, ordem: proximaOrdem });
}

export async function updatePortfolioItem(
  id: string,
  input: { titulo: string; desc: string; stack: string[]; github: string; link: string; imagem?: string },
) {
  await db.update(portfolioItens).set(input).where(eq(portfolioItens.id, id));
}

export async function deletePortfolioItem(id: string) {
  await db.delete(portfolioItens).where(eq(portfolioItens.id, id));
}

export async function moverPortfolioItem(id: string, direcao: "up" | "down") {
  const itens = await db.select().from(portfolioItens).orderBy(asc(portfolioItens.ordem));
  const idx = itens.findIndex((i) => i.id === id);
  const alvoIdx = direcao === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || alvoIdx < 0 || alvoIdx >= itens.length) return;

  const atual = itens[idx];
  const alvo = itens[alvoIdx];
  await db.update(portfolioItens).set({ ordem: alvo.ordem }).where(eq(portfolioItens.id, atual.id));
  await db.update(portfolioItens).set({ ordem: atual.ordem }).where(eq(portfolioItens.id, alvo.id));
}
