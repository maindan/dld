"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createFreelaAction } from "@/lib/actions/freelas";

const CORES = ["#818cf8", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#f87171"];

export function CreateFreelaForm() {
  const [open, setOpen] = useState(false);
  const [cor, setCor] = useState(CORES[0]);
  const [, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 self-start rounded-[9px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground"
      >
        <Plus size={15} /> Novo freela
      </button>
    );
  }

  return (
    <form
      action={(fd) => startTransition(() => createFreelaAction(fd))}
      className="flex flex-col gap-2.5 rounded-[12px] border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#e6eaf0]">Novo freela</span>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-[#e6eaf0]">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input
          name="nome"
          required
          placeholder="Nome do freela / projeto"
          className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <input
          name="tipo"
          placeholder="Tipo (ex: site institucional)"
          className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <input
          name="clienteNome"
          required
          placeholder="Nome do cliente"
          className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <input
          name="clienteEmail"
          type="email"
          placeholder="Email do cliente"
          className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <input
          name="clienteWhatsapp"
          placeholder="WhatsApp do cliente"
          className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
        />
        <div className="flex items-center gap-2">
          {CORES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCor(c)}
              className="size-6 rounded-full"
              style={{ background: c, outline: cor === c ? `2px solid ${c}55` : "none", outlineOffset: 2 }}
            />
          ))}
          <input type="hidden" name="cor" value={cor} />
        </div>
      </div>
      <textarea
        name="resumo"
        placeholder="Resumo do projeto..."
        rows={2}
        className="rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="self-start rounded-[9px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground"
      >
        Criar freela
      </button>
    </form>
  );
}
