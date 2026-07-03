"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDraftPost,
  updatePostFields,
  publishPost,
  unpublishPost,
  deletePost,
  getPostCapaUrl,
  type PostFieldsInput,
} from "@/lib/queries/blog";
import { uploadPublicFile, deletePublicFile } from "@/lib/supabase/storage";

function readPostForm(formData: FormData): Omit<PostFieldsInput, "capaUrl"> {
  return {
    titulo: String(formData.get("titulo") ?? "").trim() || "Sem título",
    resumo: String(formData.get("resumo") ?? "").trim(),
    corpo: String(formData.get("corpo") ?? "").trim(),
  };
}

/** Uploads a new capa file if one was attached, swapping out (and deleting) the previous one. */
async function readNovaCapa(id: string, formData: FormData): Promise<string | undefined> {
  const arquivo = formData.get("capa");
  if (arquivo instanceof File && arquivo.size > 0) {
    const nova = await uploadPublicFile(arquivo, "blog");
    const anterior = await getPostCapaUrl(id);
    if (anterior) await deletePublicFile(anterior);
    return nova;
  }
  return undefined;
}

/** Creates an empty draft and navigates straight to its dedicated editor. */
export async function createDraftPostAction(): Promise<void> {
  const post = await createDraftPost();
  revalidatePath("/blog");
  redirect(`/blog/${post.id}`);
}

/** Saves title/resumo/corpo/capa without changing publish status. */
export async function saveDraftAction(id: string, formData: FormData): Promise<void> {
  const input = readPostForm(formData);
  const capaUrl = await readNovaCapa(id, formData);
  await updatePostFields(id, { ...input, ...(capaUrl !== undefined ? { capaUrl } : {}) });
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
}

/** Saves fields and marks the post as published. */
export async function publishPostAction(id: string, formData: FormData): Promise<void> {
  const input = readPostForm(formData);
  const capaUrl = await readNovaCapa(id, formData);
  await publishPost(id, { ...input, ...(capaUrl !== undefined ? { capaUrl } : {}) });
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
}

/** Reverts a published post back to draft. */
export async function unpublishPostAction(id: string): Promise<void> {
  await unpublishPost(id);
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
}

export async function deletePostAction(id: string): Promise<void> {
  const capa = await getPostCapaUrl(id);
  await deletePost(id);
  if (capa) await deletePublicFile(capa);
  revalidatePath("/blog");
}

/** Uploads an image or attachment dropped into the rich text editor's body and
 * returns its public URL. Independent of the draft/publish form submission. */
export async function uploadBlogAssetAction(formData: FormData): Promise<string> {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) throw new Error("Nenhum arquivo enviado");
  return uploadPublicFile(arquivo, "blog/conteudo");
}
