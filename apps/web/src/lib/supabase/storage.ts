import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "uploads";

function extensionFrom(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop();
  return fromType ? fromType.toLowerCase() : "bin";
}

/**
 * Uploads a File (from FormData in a server action) to the public "uploads"
 * bucket and returns its public URL. Used for blog covers, portfolio images,
 * and attached contract PDFs.
 */
export async function uploadPublicFile(file: File, folder: string): Promise<string> {
  const admin = createAdminClient();
  const path = `${folder}/${crypto.randomUUID()}.${extensionFrom(file)}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(`Falha ao enviar arquivo: ${error.message}`);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deletePublicFile(publicUrl: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  const admin = createAdminClient();
  await admin.storage.from(BUCKET).remove([path]);
}
