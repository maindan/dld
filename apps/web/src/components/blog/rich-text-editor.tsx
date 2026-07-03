"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  ImageIcon,
  Paperclip,
  Undo2,
  Redo2,
} from "lucide-react";
import { Attachment } from "./attachment-extension";
import { uploadBlogAssetAction } from "@/lib/actions/blog";

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex size-7 flex-none items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-[#1b222c] hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      style={active ? { background: "rgba(129,140,248,0.14)", color: "#e6eaf0" } : undefined}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadAndRun(file: File, run: (url: string) => void) {
    const fd = new FormData();
    fd.set("arquivo", file);
    const url = await uploadBlogAssetAction(fd);
    run(url);
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void uploadAndRun(file, (url) => editor.chain().focus().setImage({ src: url }).run());
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void uploadAndRun(file, (url) => editor.chain().focus().setAttachment({ href: url, filename: file.name }).run());
  }

  function toggleLink() {
    const atual = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link", atual ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5">
      <ToolbarButton title="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton title="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Riscado"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </ToolbarButton>
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        title="Título"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Subtítulo"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={15} />
      </ToolbarButton>
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        title="Lista"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Citação"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Código"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code size={15} />
      </ToolbarButton>
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={toggleLink}>
        <Link2 size={15} />
      </ToolbarButton>
      <ToolbarButton title="Inserir imagem" onClick={() => imageInputRef.current?.click()}>
        <ImageIcon size={15} />
      </ToolbarButton>
      <ToolbarButton title="Anexar arquivo" onClick={() => fileInputRef.current?.click()}>
        <Paperclip size={15} />
      </ToolbarButton>
      <div className="flex-1" />
      <ToolbarButton title="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton title="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={15} />
      </ToolbarButton>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={onPickFile} />
    </div>
  );
}

export function RichTextEditor({
  name,
  defaultValue,
  onChangeHtml,
}: {
  name: string;
  defaultValue: string;
  onChangeHtml?: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension.configure({ HTMLAttributes: { class: "dl-post-image" } }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      Attachment,
      Placeholder.configure({ placeholder: "Escreva o conteúdo do post…" }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => onChangeHtml?.(editor.getHTML()),
  });

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const syncHidden = useCallback((html: string) => {
    if (hiddenInputRef.current) hiddenInputRef.current.value = html;
  }, []);

  useEffect(() => {
    if (!editor) return;
    syncHidden(editor.getHTML());
    const handler = () => syncHidden(editor.getHTML());
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, syncHidden]);

  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-background">
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={defaultValue} />
      {editor && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="dl-editor min-h-[260px] flex-1 overflow-y-auto px-3.5 py-3 text-[13.5px] leading-[1.7] [&_.ProseMirror]:min-h-[240px] [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}
