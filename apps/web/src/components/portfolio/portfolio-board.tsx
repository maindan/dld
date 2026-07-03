"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Code2,
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createPortfolioItemAction,
  updatePortfolioItemAction,
  deletePortfolioItemAction,
  moverPortfolioItemAction,
} from "@/lib/actions/portfolio";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PortfolioItem } from "@/lib/queries/portfolio";

const STRIPE_PATTERN =
  "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.02) 8px, rgba(255,255,255,0.02) 16px)";

function truncateUrl(url: string, max = 26) {
  const semProtocolo = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return semProtocolo.length > max ? `${semProtocolo.slice(0, max - 1)}…` : semProtocolo;
}

type DialogState = "closed" | "new" | PortfolioItem;

function PortfolioItemDialog({
  state,
  onOpenChange,
}: {
  state: DialogState;
  onOpenChange: (open: boolean) => void;
}) {
  const item = state === "closed" || state === "new" ? undefined : state;
  const open = state !== "closed";
  const [, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(item?.imagem ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(fd: FormData) {
    if (item) {
      startTransition(() => updatePortfolioItemAction(item.id, fd));
    } else {
      startTransition(() => createPortfolioItemAction(fd));
    }
    onOpenChange(false);
  }

  const dialogKey = typeof state === "string" ? state : state.id;

  return (
    <Dialog
      key={dialogKey}
      open={open}
      onOpenChange={(next) => {
        if (!next) setPreview(item?.imagem ?? null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-[480px] border-[#303a47] bg-[#151a21] p-5">
        <form action={handleSubmit} className="flex flex-col gap-3.5">
          <DialogHeader>
            <DialogTitle>{item ? "Editar item" : "Novo item de portfolio"}</DialogTitle>
          </DialogHeader>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[74px] w-[110px] flex-none items-center justify-center overflow-hidden rounded-[9px] border border-dashed border-[#3a4553] text-[#55606e] hover:border-primary"
              style={{ backgroundImage: STRIPE_PATTERN }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              name="imagem"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-1 flex-col gap-2.5">
              <input
                name="titulo"
                required
                defaultValue={item?.titulo}
                placeholder="Título do projeto *"
                className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] text-[#e6eaf0] outline-none focus:border-primary"
              />
              <input
                name="stack"
                defaultValue={item?.stack.join(", ")}
                placeholder="Stack (separada por vírgula)"
                className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] text-[#e6eaf0] outline-none focus:border-primary"
              />
            </div>
          </div>

          <textarea
            name="desc"
            defaultValue={item?.desc}
            rows={2}
            placeholder="Descrição curta"
            className="resize-none rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] leading-relaxed text-[#e6eaf0] outline-none focus:border-primary"
          />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <input
              name="github"
              defaultValue={item?.github}
              placeholder="github.com/…"
              className="min-w-0 rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 font-mono text-[12px] text-[#c9d1dc] outline-none focus:border-primary"
            />
            <input
              name="link"
              defaultValue={item?.link}
              placeholder="Link do projeto"
              className="min-w-0 rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 font-mono text-[12px] text-[#c9d1dc] outline-none focus:border-primary"
            />
          </div>

          <DialogFooter className="mx-0 mb-0 gap-2 border-none bg-transparent p-0 sm:justify-stretch">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-[9px] bg-[#222b36] py-2.5 text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] rounded-[9px] bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground hover:bg-[#96a0fa]"
            >
              {item ? "Salvar" : "Adicionar"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PortfolioCard({
  item,
  isFirst,
  isLast,
  onEdit,
}: {
  item: PortfolioItem;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
}) {
  const [, startTransition] = useTransition();

  return (
    <div className="group flex flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-colors hover:border-[#3a4553]">
      <div
        className="relative h-[132px] flex-none border-b border-[#1f2733]"
        style={item.imagem ? undefined : { backgroundImage: STRIPE_PATTERN }}
      >
        {item.imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imagem} alt={item.titulo} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#55606e]">
            <ImageIcon size={22} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start gap-2">
          <div className="flex-1 text-[14.5px] font-semibold text-[#e6eaf0]">{item.titulo}</div>
          <div className="flex flex-none items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              disabled={isFirst}
              onClick={() => startTransition(() => moverPortfolioItemAction(item.id, "up"))}
              className="p-1 text-muted-foreground hover:text-[#a78bfa] disabled:opacity-30"
            >
              <ArrowUp size={13} />
            </button>
            <button
              disabled={isLast}
              onClick={() => startTransition(() => moverPortfolioItemAction(item.id, "down"))}
              className="p-1 text-muted-foreground hover:text-[#a78bfa] disabled:opacity-30"
            >
              <ArrowDown size={13} />
            </button>
            <button onClick={onEdit} className="p-1 text-muted-foreground hover:text-[#a78bfa]">
              <Pencil size={13} />
            </button>
            <button
              onClick={() => startTransition(() => deletePortfolioItemAction(item.id))}
              className="p-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="flex-1 text-[12.5px] leading-relaxed text-muted-foreground">{item.desc}</div>

        {item.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.stack.map((s) => (
              <span
                key={s}
                className="rounded-[5px] bg-primary/10 px-2 py-[3px] font-mono text-[10.5px] text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3.5 border-t border-[#1f2733] pt-2.5 font-mono text-[11px]">
          {item.github && (
            <a
              href={item.github}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-muted-foreground hover:text-[#e6eaf0]"
            >
              <Code2 size={12} className="flex-none" />
              <span className="truncate whitespace-nowrap">{truncateUrl(item.github)}</span>
            </a>
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="flex flex-none items-center gap-1.5 text-muted-foreground hover:text-[#e6eaf0]"
            >
              <ExternalLink size={12} className="flex-none" />
              <span className="truncate whitespace-nowrap">{truncateUrl(item.link)}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function PortfolioBoard({ itens }: { itens: PortfolioItem[] }) {
  const [dialogState, setDialogState] = useState<DialogState>("closed");

  return (
    <>
      <div className="flex flex-col gap-3.5 max-md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1 text-[12.5px] text-muted-foreground">
            Itens exibidos na seção de portfolio do seu site público.
          </div>
          <button
            onClick={() => setDialogState("new")}
            className="flex flex-none items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground hover:bg-[#96a0fa]"
          >
            <Plus size={15} /> Novo item
          </button>
        </div>

        {itens.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
            Nenhum projeto no portfolio ainda.
          </div>
        ) : (
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {itens.map((item, i) => (
              <PortfolioCard
                key={item.id}
                item={item}
                isFirst={i === 0}
                isLast={i === itens.length - 1}
                onEdit={() => setDialogState(item)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="py-16 text-center text-[13px] text-muted-foreground md:hidden">
        Portfolio disponível na versão desktop.
      </div>

      <PortfolioItemDialog
        state={dialogState}
        onOpenChange={(open) => {
          if (!open) setDialogState("closed");
        }}
      />
    </>
  );
}
