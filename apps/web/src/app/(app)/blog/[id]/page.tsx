import { notFound } from "next/navigation";
import { getPostById } from "@/lib/queries/blog";
import { PostEditor } from "@/components/blog/post-editor";

export default async function PostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return <PostEditor post={post} />;
}
