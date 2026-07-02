"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Code2, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  createPortfolioItemAction,
  updatePortfolioItemAction,
  deletePortfolioItemAction,
  moverPortfolioItemAction,
} from "@/lib/actions/portfolio";
import type { PortfolioItem } from "@/lib/queries/portfolio";

function ItemForm({
  item,
  onSubmit,
  onCancel,
}: {
  item?: PortfolioItem;
  onSubmit: (fd: FormData) => void;
  onCancel?: () => void;
}) {
  return (
    <form action={onSubmit} className="flex flex-col gap-2.5 rounded-[9px] border border-border bg-[#0e1116] p-3">
      <div className="flex items-center gap-2">
        <input
          name="titulo"
          required
          defaultValue={item?.titulo}
          placeholder="Título do projeto"
          className="flex-1 rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[13px] outline-none focus:border-primary"
        />
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-[#e6eaf0]">
            <X size={16} />
          </button>
        )}
      </div>
      <textarea
        name="desc"
        defaultValue={item?.desc}
        placeholder="Descrição"
        rows={2}
        className="rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        <input
          name="stack"
          defaultValue={item?.stack.join(", ")}
          placeholder="Stack, separada por vírgula"
          className="min-w-[160px] flex-1 rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
        />
        <input
          name="github"
          defaultValue={item?.github}
          placeholder="Link do GitHub"
          className="min-w-[160px] flex-1 rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
        />
        <input
          name="link"
          defaultValue={item?.link}
          placeholder="Link ao vivo"
          className="min-w-[160px] flex-1 rounded-[8px] border border-border bg-[#151a21] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        className="self-start rounded-[8px] bg-primary px-3.5 py-1.5 text-[12.5px] font-semibold text-primary-foreground"
      >
        {item ? "Salvar" : "Adicionar"}
      </button>
    </form>
  );
}

function ItemRow({ item, isFirst, isLast }: { item: PortfolioItem; isFirst: boolean; isLast: boolean }) {
  const [, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <ItemForm
        item={item}
        onCancel={() => setEditando(false)}
        onSubmit={(fd) => {
          startTransition(() => updatePortfolioItemAction(item.id, fd));
          setEditando(false);
        }}
      />
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-[9px] bg-[#1b222c] px-3 py-2.5">
      <div className="flex flex-none flex-col gap-0.5 pt-0.5">
        <button
          disabled={isFirst}
          onClick={() => startTransition(() => moverPortfolioItemAction(item.id, "up"))}
          className="text-muted-foreground hover:text-[#e6eaf0] disabled:opacity-30"
        >
          <ArrowUp size={13} />
        </button>
        <button
          disabled={isLast}
          onClick={() => startTransition(() => moverPortfolioItemAction(item.id, "down"))}
          className="text-muted-foreground hover:text-[#e6eaf0] disabled:opacity-30"
        >
          <ArrowDown size={13} />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-[#e6eaf0]">{item.titulo}</div>
        {item.desc && <div className="mt-0.5 text-[12px] text-muted-foreground">{item.desc}</div>}
        {item.stack.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.stack.map((s) => (
              <span key={s} className="rounded-full bg-[#262e39] px-2 py-0.5 text-[10.5px] text-[#c9d1dc]">
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-3">
          {item.github && (
            <a
              href={item.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-[#e6eaf0]"
            >
              <Code2 size={12} /> código
            </a>
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-[#e6eaf0]"
            >
              <ExternalLink size={12} /> ao vivo
            </a>
          )}
        </div>
      </div>
      <button onClick={() => setEditando(true)} className="flex-none p-1.5 text-muted-foreground hover:text-[#e6eaf0]">
        <Pencil size={14} />
      </button>
      <button
        onClick={() => startTransition(() => deletePortfolioItemAction(item.id))}
        className="flex-none p-1.5 text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function PortfolioBoard({ itens }: { itens: PortfolioItem[] }) {
  const [, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <ItemForm
          onCancel={() => setShowForm(false)}
          onSubmit={(fd) => {
            startTransition(() => createPortfolioItemAction(fd));
            setShowForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 self-start rounded-[9px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          <Plus size={15} /> Novo projeto
        </button>
      )}

      {itens.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhum projeto no portfolio ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-[12px] border border-border bg-card p-3">
          {itens.map((item, i) => (
            <ItemRow key={item.id} item={item} isFirst={i === 0} isLast={i === itens.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
