import { db, posts } from "@danlimadev/db";
import { desc, eq } from "drizzle-orm";
import { slugify } from "@/lib/format";

export interface Post {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  corpo: string;
  status: "rascunho" | "publicado";
  publicadoEm: Date | null;
  updatedAt: Date;
}

export async function getPosts(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.updatedAt));
}

async function slugUnico(titulo: string, ignorarId?: string): Promise<string> {
  const base = slugify(titulo) || "post";
  let slug = base;
  let i = 1;
  while (true) {
    const existentes = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug));
    const conflita = existentes.some((p) => p.id !== ignorarId);
    if (!conflita) return slug;
    slug = `${base}-${++i}`;
  }
}

export async function createPost(input: { titulo: string; resumo: string; corpo: string }) {
  const slug = await slugUnico(input.titulo);
  const [post] = await db.insert(posts).values({ ...input, slug }).returning();
  return post;
}

export async function updatePost(id: string, input: { titulo: string; resumo: string; corpo: string }) {
  const slug = await slugUnico(input.titulo, id);
  await db.update(posts).set({ ...input, slug, updatedAt: new Date() }).where(eq(posts.id, id));
}

export async function setPostStatus(id: string, publicado: boolean) {
  await db
    .update(posts)
    .set({
      status: publicado ? "publicado" : "rascunho",
      publicadoEm: publicado ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
}

export async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id));
}
