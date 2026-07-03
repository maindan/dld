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
    const href =
      n.screen === "freelas" && n.freelaId
        ? `/freelas/${n.freelaId}${n.tab ? `?tab=${n.tab}` : ""}`
        : "/tasks";
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
          <div className="absolute right-0 z-50 mt-2 flex max-h-[420px] w-[320px] flex-col overflow-y-auto rounded-[12px] border border-border bg-popover shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#1f2733] px-3 py-3">
              <Bell size={15} className="flex-none text-primary" />
              <span className="text-[13.5px] font-semibold">Notificações</span>
              <div className="flex-1" />
              <span className="rounded-[5px] bg-[#1b222c] px-[7px] py-[2px] font-mono text-[11px] text-muted-foreground">
                {notificacoes.length}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2">
              {notificacoes.length === 0 && (
                <div className="p-4 text-center text-[12.5px] text-muted-foreground">
                  Tudo em dia — nenhuma notificação.
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
                    <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                      <span
                        className="text-[10.5px] font-semibold uppercase"
                        style={{ color: n.cor, letterSpacing: "0.04em" }}
                      >
                        {n.tipo}
                      </span>
                      <span className="block text-[12.5px] leading-snug text-[#e6eaf0]">
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
          </div>
        </>
      )}
    </div>
  );
}
