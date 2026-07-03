"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ImageIcon } from "lucide-react";
import { saveDraftAction, publishPostAction, unpublishPostAction } from "@/lib/actions/blog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
import type { Post } from "@/lib/queries/blog";

export function PostEditor({ post }: { post: Post }) {
  const [pending, startTransition] = useTransition();
  const [capaPreview, setCapaPreview] = useState<string | null>(post.capaUrl);
  const [pendingAction, setPendingAction] = useState<"salvar" | "publicar" | "despublicar" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const publicado = post.status === "publicado";

  function trocarCapa(file: File) {
    const url = URL.createObjectURL(file);
    setCapaPreview(url);
  }

  function salvarRascunho() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setPendingAction("salvar");
    startTransition(() => saveDraftAction(post.id, fd));
  }

  function publicar() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setPendingAction("publicar");
    startTransition(() => publishPostAction(post.id, fd));
  }

  function despublicar() {
    setPendingAction("despublicar");
    startTransition(() => unpublishPostAction(post.id));
  }

  return (
    <div className="flex w-full flex-col gap-3.5">
      <div className="flex items-center gap-2.5">
        <Link
          href="/blog"
          className="flex items-center gap-1.5 rounded-[8px] border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-muted-foreground hover:border-[#3a4553] hover:text-foreground"
        >
          <ChevronLeft size={14} /> Blog
        </Link>
        <div className="flex-1" />
        {publicado && (
          <button
            type="button"
            onClick={despublicar}
            disabled={pending}
            className="rounded-[8px] border border-border px-3 py-2 text-[12.5px] font-medium text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-60"
          >
            {pending && pendingAction === "despublicar" ? "Despublicando…" : "Despublicar"}
          </button>
        )}
        <button
          type="button"
          onClick={salvarRascunho}
          disabled={pending}
          className="rounded-[8px] bg-[#222b36] px-3.5 py-2 text-[12.5px] font-medium text-[#c9d1dc] hover:bg-[#2a3441] disabled:opacity-60"
        >
          {pending && pendingAction === "salvar" ? "Salvando…" : "Salvar rascunho"}
        </button>
        <button
          type="button"
          onClick={publicar}
          disabled={pending}
          className="rounded-[8px] bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending && pendingAction === "publicar" ? "Publicando…" : publicado ? "Salvar e republicar" : "Publicar"}
        </button>
      </div>

      <form ref={formRef} className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5">
        <input
          name="titulo"
          defaultValue={post.titulo}
          placeholder="Título do post"
          className="border-0 border-b border-border bg-transparent pt-1.5 pb-3 font-sans text-[22px] font-semibold outline-none focus:border-primary"
        />

        <div className="flex items-stretch gap-3.5">
          <label className="flex h-[128px] w-[200px] flex-none cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[10px] border border-dashed border-[#3a4553] bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.02)_6px,rgba(255,255,255,0.02)_12px)] text-[#55606e] hover:border-primary hover:text-muted-foreground">
            {capaPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capaPreview} alt="Capa do post" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImageIcon size={20} />
                <span className="text-[11px]">imagem de capa</span>
              </>
            )}
            <input
              type="file"
              name="capa"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) trocarCapa(file);
              }}
            />
          </label>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label className="text-[12px] font-normal text-muted-foreground">Resumo curto</Label>
            <Textarea
              name="resumo"
              defaultValue={post.resumo}
              placeholder="Aparece na listagem do site público…"
              className="h-[128px] flex-1 resize-none rounded-[10px] border-border bg-background px-3 py-2.5 text-[13px] leading-[1.55] focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[12px] font-normal text-muted-foreground">Conteúdo</Label>
          <RichTextEditor name="corpo" defaultValue={post.corpo} />
        </div>
      </form>
    </div>
  );
}
