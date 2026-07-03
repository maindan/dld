"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { createClienteAction, updateClienteAction, deleteClienteAction } from "@/lib/actions/clientes";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClienteListItem } from "@/lib/queries/clientes";

const inputClass =
  "min-w-0 rounded-[9px] border border-border bg-[#0e1116] px-3 py-2 text-[13px] outline-none focus:border-primary";

type DialogState = "closed" | "new" | ClienteListItem;

function ClienteDialog({
  state,
  onOpenChange,
}: {
  state: DialogState;
  onOpenChange: (open: boolean) => void;
}) {
  const cliente = state === "closed" || state === "new" ? undefined : state;
  const open = state !== "closed";
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (cliente) {
        await updateClienteAction(cliente.id, formData);
      } else {
        await createClienteAction(formData);
      }
      onOpenChange(false);
    });
  }

  const dialogKey = typeof state === "string" ? state : state.id;

  return (
    <Dialog key={dialogKey} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <form id="cliente-form" action={handleSubmit} className="flex flex-col gap-2.5">
          <input
            name="nome"
            required
            defaultValue={cliente?.nome}
            placeholder="Nome do cliente *"
            className={inputClass}
          />
          <input name="empresa" defaultValue={cliente?.empresa} placeholder="Empresa" className={inputClass} />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <input
              name="email"
              type="email"
              defaultValue={cliente?.email}
              placeholder="E-mail"
              className={`${inputClass} font-mono text-[12px]`}
            />
            <input
              name="whatsapp"
              defaultValue={cliente?.whatsapp}
              placeholder="WhatsApp"
              className={`${inputClass} font-mono text-[12px]`}
            />
          </div>
          <textarea
            name="observacoes"
            defaultValue={cliente?.observacoes}
            placeholder="Observações..."
            rows={2}
            className={inputClass}
          />
        </form>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-[9px] bg-[#222b36] px-3 py-2.5 text-center text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441] sm:flex-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="cliente-form"
            disabled={pending}
            className="flex-[2] rounded-[9px] bg-primary px-3 py-2.5 text-center text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            {cliente ? "Salvar" : "Criar cliente"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClienteRow({ cliente, onEdit }: { cliente: ClienteListItem; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Excluir o cliente "${cliente.nome}"? Essa ação não pode ser desfeita.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteClienteAction(cliente.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível excluir o cliente.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1 border-b border-[#1f2733] px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-[#e6eaf0]">{cliente.nome}</div>
        <div className="truncate text-[11.5px] text-muted-foreground">
          {cliente.empresa || "Sem empresa"}
        </div>
      </div>
      <div className="min-w-0 flex-1 font-mono text-[12px] text-muted-foreground sm:flex-none sm:w-[180px]">
        {cliente.email || "—"}
      </div>
      <div className="min-w-0 flex-1 font-mono text-[12px] text-muted-foreground sm:flex-none sm:w-[140px]">
        {cliente.whatsapp || "—"}
      </div>
      <div className="flex flex-none items-center gap-1.5 text-[11.5px] text-muted-foreground sm:w-[110px]">
        <Users size={12} />
        {cliente.freelasCount} freela{cliente.freelasCount === 1 ? "" : "s"}
      </div>
      <div className="flex flex-none items-center gap-1">
        <button onClick={onEdit} className="p-1.5 text-muted-foreground hover:text-primary">
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {error && <div className="w-full text-[11.5px] text-destructive sm:order-last">{error}</div>}
    </div>
  );
}

export function ClientesBoard({ clientes }: { clientes: ClienteListItem[] }) {
  const [dialogState, setDialogState] = useState<DialogState>("closed");

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <div className="flex-1 text-[12.5px] text-muted-foreground">
          Clientes vinculados aos seus projetos de freela.
        </div>
        <button
          onClick={() => setDialogState("new")}
          className="flex flex-none items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground"
        >
          <Plus size={15} /> Novo cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="rounded-[14px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="rounded-[14px] border border-border bg-card">
          {clientes.map((c) => (
            <ClienteRow key={c.id} cliente={c} onEdit={() => setDialogState(c)} />
          ))}
        </div>
      )}

      <ClienteDialog
        state={dialogState}
        onOpenChange={(open) => {
          if (!open) setDialogState("closed");
        }}
      />
    </div>
  );
}
