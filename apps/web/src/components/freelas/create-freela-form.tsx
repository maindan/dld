"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createFreelaAction } from "@/lib/actions/freelas";
import { createClienteAction } from "@/lib/actions/clientes";
import type { ClienteListItem } from "@/lib/queries/clientes";

/** Fixed rotation palette — the next freela always gets PALETTE[count % PALETTE.length]. */
const PALETTE = ["#818cf8", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#f87171"];

const inputClass =
  "min-w-0 rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary";

/** Sentinel <option> value that opens the inline "novo cliente" dialog instead of selecting a real cliente. */
const NOVO_CLIENTE_VALUE = "__novo_cliente__";

function NovoClienteDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (cliente: { id: string; nome: string }) => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const cliente = await createClienteAction(formData);
      if (cliente) {
        onCreated(cliente);
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
        </DialogHeader>
        <form id="novo-cliente-inline-form" action={handleSubmit} className="flex flex-col gap-2.5">
          <input name="nome" required placeholder="Nome do cliente *" className={inputClass} />
          <input name="empresa" placeholder="Empresa" className={inputClass} />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <input
              name="email"
              type="email"
              placeholder="E-mail"
              className={`${inputClass} font-mono text-[12px]`}
            />
            <input name="whatsapp" placeholder="WhatsApp" className={`${inputClass} font-mono text-[12px]`} />
          </div>
        </form>
        <DialogFooter>
          <DialogClose className="flex-1 rounded-[9px] bg-[#222b36] px-3 py-2.5 text-center text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441] sm:flex-none">
            Cancelar
          </DialogClose>
          <button
            type="submit"
            form="novo-cliente-inline-form"
            disabled={pending}
            className="flex-[2] rounded-[9px] bg-primary px-3 py-2.5 text-center text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            Criar cliente
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateFreelaForm({
  existingCount,
  clientes,
}: {
  existingCount: number;
  clientes: ClienteListItem[];
}) {
  const [, startTransition] = useTransition();
  const [clientesList, setClientesList] = useState(clientes);
  const [clienteId, setClienteId] = useState<string>("");
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const cor = PALETTE[existingCount % PALETTE.length];

  function handleClienteChange(value: string) {
    if (value === NOVO_CLIENTE_VALUE) {
      setNovoClienteOpen(true);
      return;
    }
    setClienteId(value);
  }

  function handleClienteCreated(cliente: { id: string; nome: string }) {
    setClientesList((prev) => [
      ...prev,
      { id: cliente.id, nome: cliente.nome, email: "", whatsapp: "", empresa: "", observacoes: "", freelasCount: 0 },
    ]);
    setClienteId(cliente.id);
  }

  return (
    <>
      <Dialog>
        <DialogTrigger className="flex flex-none items-center gap-1.5 self-start rounded-[9px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground">
          <Plus size={15} /> Novo freela
        </DialogTrigger>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Novo freela</DialogTitle>
          </DialogHeader>
          <form
            id="novo-freela-form"
            action={(fd) => startTransition(() => createFreelaAction(fd))}
            className="flex flex-col gap-2.5"
          >
            <input type="hidden" name="cor" value={cor} />
            <input type="hidden" name="clienteId" value={clienteId} />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input name="nome" required placeholder="Nome do projeto *" className={inputClass} />
              <input name="tipo" placeholder="Tipo (ex.: Landing page)" className={inputClass} />
            </div>
            <div className="mt-0.5 text-[11px] tracking-wide text-[#55606e] uppercase">Cliente</div>
            <select
              required
              value={clienteId}
              onChange={(e) => handleClienteChange(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Selecione um cliente
              </option>
              {clientesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                  {c.empresa ? ` (${c.empresa})` : ""}
                </option>
              ))}
              <option value={NOVO_CLIENTE_VALUE}>+ Novo cliente</option>
            </select>
            <textarea name="resumo" placeholder="Resumo do projeto..." rows={2} className={inputClass} />
          </form>
          <DialogFooter>
            <DialogClose className="flex-1 rounded-[9px] bg-[#222b36] px-3 py-2.5 text-center text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441] sm:flex-none">
              Cancelar
            </DialogClose>
            <button
              type="submit"
              form="novo-freela-form"
              className="flex-[2] rounded-[9px] bg-primary px-3 py-2.5 text-center text-[13px] font-semibold text-primary-foreground"
            >
              Criar freela
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NovoClienteDialog open={novoClienteOpen} onOpenChange={setNovoClienteOpen} onCreated={handleClienteCreated} />
    </>
  );
}
