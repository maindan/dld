import { getPosts } from "@/lib/queries/blog";
import { BlogBoard } from "@/components/blog/blog-board";

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogBoard posts={posts} />;
}
