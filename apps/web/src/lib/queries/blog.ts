import { db, posts } from "@danlimadev/db";
import { desc, eq } from "drizzle-orm";
import { slugify } from "@/lib/format";

export interface Post {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  corpo: string;
  capaUrl: string | null;
  status: "rascunho" | "publicado";
  publicadoEm: Date | null;
  updatedAt: Date;
}

export async function getPosts(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.updatedAt));
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  return post;
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

/** Creates an empty draft so the board can navigate straight to the dedicated editor. */
export async function createDraftPost(): Promise<Post> {
  const slug = await slugUnico("sem-titulo");
  const [post] = await db
    .insert(posts)
    .values({ titulo: "Sem título", slug, resumo: "", corpo: "" })
    .returning();
  return post;
}

export interface PostFieldsInput {
  titulo: string;
  resumo: string;
  corpo: string;
  capaUrl?: string;
}

/** Updates title/resumo/corpo/capa without touching status — used by "Salvar rascunho". */
export async function updatePostFields(id: string, input: PostFieldsInput): Promise<void> {
  const slug = await slugUnico(input.titulo, id);
  await db
    .update(posts)
    .set({
      titulo: input.titulo,
      resumo: input.resumo,
      corpo: input.corpo,
      ...(input.capaUrl !== undefined ? { capaUrl: input.capaUrl } : {}),
      slug,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
}

/** Persists fields and marks the post as published, stamping publicadoEm. */
export async function publishPost(id: string, input: PostFieldsInput): Promise<void> {
  const slug = await slugUnico(input.titulo, id);
  await db
    .update(posts)
    .set({
      titulo: input.titulo,
      resumo: input.resumo,
      corpo: input.corpo,
      ...(input.capaUrl !== undefined ? { capaUrl: input.capaUrl } : {}),
      slug,
      status: "publicado",
      publicadoEm: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
}

/** Reverts a published post back to draft, clearing publicadoEm. */
export async function unpublishPost(id: string): Promise<void> {
  await db
    .update(posts)
    .set({ status: "rascunho", publicadoEm: null, updatedAt: new Date() })
    .where(eq(posts.id, id));
}

export async function getPostCapaUrl(id: string): Promise<string | null> {
  const [post] = await db.select({ capaUrl: posts.capaUrl }).from(posts).where(eq(posts.id, id));
  return post?.capaUrl ?? null;
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}
