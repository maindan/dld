"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Clock, Check, X } from "lucide-react";
import { dismissNotificacaoAction } from "@/lib/actions/notificacoes";
import type { Notificacao } from "@/lib/queries/notificacoes";

const ICONS = { clock: Clock, check: Check } as const;

export function NotifBell({ notificacoes }: { notificacoes: Notificacao[] }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function abrir(n: Notificacao) {
    setOpen(false);
    const href = n.screen === "freelas" && n.freelaId ? `/freelas/${n.freelaId}` : "/tasks";
    router.push(href);
  }

  function fechar(e: React.MouseEvent, chave: string) {
    e.stopPropagation();
    startTransition(() => dismissNotificacaoAction(chave));
  }

  return (
    <div className="relative flex-none">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-[38px] items-center justify-center rounded-[9px] text-[#c9d1dc] hover:bg-[#1b222c]"
      >
        <Bell size={19} />
        {notificacoes.length > 0 && (
          <span className="absolute top-[5px] right-[5px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-destructive px-[3px] font-mono text-[10px] font-bold text-background">
            {notificacoes.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Fechar notificações"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 flex max-h-[420px] w-[320px] flex-col gap-1 overflow-y-auto rounded-[12px] border border-border bg-popover p-2 shadow-xl">
            <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Notificações
            </div>
            {notificacoes.length === 0 && (
              <div className="p-4 text-center text-[12.5px] text-muted-foreground">
                Nada por aqui.
              </div>
            )}
            {notificacoes.map((n) => {
              const Icon = ICONS[n.icon];
              return (
                <button
                  key={n.key}
                  onClick={() => abrir(n)}
                  className="flex items-start gap-2.5 rounded-[9px] p-2.5 text-left hover:bg-[#1b222c]"
                >
                  <span
                    className="mt-0.5 flex size-6 flex-none items-center justify-center rounded-full"
                    style={{ color: n.cor, background: n.bg }}
                  >
                    <Icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] leading-snug text-[#c9d1dc]">
                      {n.titulo}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">{n.sub}</span>
                  </span>
                  <span
                    onClick={(e) => fechar(e, n.key)}
                    className="flex-none cursor-pointer p-1 text-muted-foreground hover:text-[#e6eaf0]"
                  >
                    <X size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
