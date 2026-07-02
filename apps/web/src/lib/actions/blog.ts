"use server";

import { revalidatePath } from "next/cache";
import { createPost, updatePost, setPostStatus, deletePost } from "@/lib/queries/blog";

function readPostForm(formData: FormData) {
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    resumo: String(formData.get("resumo") ?? "").trim(),
    corpo: String(formData.get("corpo") ?? "").trim(),
  };
}

export async function createPostAction(formData: FormData) {
  const input = readPostForm(formData);
  if (!input.titulo) return;
  await createPost(input);
  revalidatePath("/blog");
}

export async function updatePostAction(id: string, formData: FormData) {
  const input = readPostForm(formData);
  if (!input.titulo) return;
  await updatePost(id, input);
  revalidatePath("/blog");
}

export async function setPostStatusAction(id: string, publicado: boolean) {
  await setPostStatus(id, publicado);
  revalidatePath("/blog");
}

export async function deletePostAction(id: string) {
  await deletePost(id);
  revalidatePath("/blog");
}
