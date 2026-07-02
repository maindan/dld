"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import {
  createPostAction,
  updatePostAction,
  setPostStatusAction,
  deletePostAction,
} from "@/lib/actions/blog";
import { formatDateShort } from "@/lib/format";
import type { Post } from "@/lib/queries/blog";

function PostForm({
  post,
  onSubmit,
  onCancel,
}: {
  post?: Post;
  onSubmit: (fd: FormData) => void;
  onCancel?: () => void;
}) {
  return (
    <form action={onSubmit} className="flex flex-col gap-2.5 rounded-[9px] border border-border bg-[#0e1116] p-3">
      <div className="flex items-center gap-2">
        <input
          name="titulo"
          required
          defaultValue={post?.titulo}
          placeholder="Título do post"
          className="flex-1 rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[13px] outline-none focus:border-primary"
        />
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-[#e6eaf0]">
            <X size={16} />
          </button>
        )}
      </div>
      <input
        name="resumo"
        defaultValue={post?.resumo}
        placeholder="Resumo"
        className="rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
      />
      <textarea
        name="corpo"
        defaultValue={post?.corpo}
        placeholder="Corpo do post (markdown)"
        rows={6}
        className="rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 font-mono text-[12.5px] outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="self-start rounded-[8px] bg-primary px-3.5 py-1.5 text-[12.5px] font-semibold text-primary-foreground"
      >
        {post ? "Salvar" : "Criar post"}
      </button>
    </form>
  );
}

function PostRow({ post }: { post: Post }) {
  const [, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);
  const publicado = post.status === "publicado";

  if (editando) {
    return (
      <PostForm
        post={post}
        onCancel={() => setEditando(false)}
        onSubmit={(fd) => {
          startTransition(() => updatePostAction(post.id, fd));
          setEditando(false);
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-[9px] bg-[#1b222c] px-3 py-2.5">
      <span
        className="flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{
          color: publicado ? "#34d399" : "#8b96a5",
          background: publicado ? "#34d39920" : "#8b96a520",
        }}
      >
        {publicado ? "Publicado" : "Rascunho"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-[#c9d1dc]">{post.titulo}</span>
        <span className="block truncate text-[11px] text-muted-foreground">
          /blog/{post.slug} · {formatDateShort(post.updatedAt.toISOString().slice(0, 10))}
        </span>
      </span>
      <button
        onClick={() => startTransition(() => setPostStatusAction(post.id, !publicado))}
        className="flex-none rounded-[8px] border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-[#e6eaf0]"
      >
        {publicado ? "Despublicar" : "Publicar"}
      </button>
      <button onClick={() => setEditando(true)} className="flex-none p-1.5 text-muted-foreground hover:text-[#e6eaf0]">
        <Pencil size={14} />
      </button>
      <button
        onClick={() => startTransition(() => deletePostAction(post.id))}
        className="flex-none p-1.5 text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function BlogBoard({ posts }: { posts: Post[] }) {
  const [, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <PostForm
          onCancel={() => setShowForm(false)}
          onSubmit={(fd) => {
            startTransition(() => createPostAction(fd));
            setShowForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 self-start rounded-[9px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          <Plus size={15} /> Novo post
        </button>
      )}

      {posts.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhum post ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-[12px] border border-border bg-card p-3">
          {posts.map((p) => (
            <PostRow key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
