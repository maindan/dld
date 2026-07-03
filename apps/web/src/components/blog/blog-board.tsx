"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ImageIcon } from "lucide-react";
import { createDraftPostAction } from "@/lib/actions/blog";
import { formatDateShort } from "@/lib/format";
import type { Post } from "@/lib/queries/blog";

function StatusBadge({ status }: { status: Post["status"] }) {
  const publicado = status === "publicado";
  return (
    <span
      className={
        publicado
          ? "flex-none rounded-[6px] bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success"
          : "flex-none rounded-[6px] bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning"
      }
    >
      {publicado ? "Publicado" : "Rascunho"}
    </span>
  );
}

function PostRow({ post }: { post: Post }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/blog/${post.id}`)}
      className="flex cursor-pointer items-center gap-3.5 rounded-[12px] border border-border bg-card p-3.5 hover:border-[#3a4553] hover:bg-[#171d26]"
    >
      <div className="flex h-[64px] w-[92px] flex-none items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-[#3a4553] bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.02)_6px,rgba(255,255,255,0.02)_12px)] text-[#55606e]">
        {post.capaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.capaUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={20} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="truncate text-[14.5px] font-semibold">{post.titulo}</div>
        <div className="truncate text-[12.5px] text-muted-foreground">
          {post.resumo || "Sem resumo ainda."}
        </div>
        <div className="font-mono text-[11px] text-[#55606e]">
          {formatDateShort(post.updatedAt.toISOString().slice(0, 10))}
        </div>
      </div>
      <StatusBadge status={post.status} />
    </div>
  );
}

export function BlogBoard({ posts }: { posts: Post[] }) {
  const [pending, startTransition] = useTransition();

  function novoPost() {
    startTransition(() => createDraftPostAction());
  }

  return (
    <div className="flex w-full flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <div className="flex-1 text-[12.5px] text-muted-foreground">
          Posts publicados ficam disponíveis no seu site público.
        </div>
        <button
          onClick={novoPost}
          disabled={pending}
          className="flex flex-none items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Plus size={15} /> Novo post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhum post ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {posts.map((p) => (
            <PostRow key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
