"use client";

import { useState, useTransition } from "react";
import { CircleCheck } from "lucide-react";
import { aprovarOrcamentoAction } from "@/lib/actions/public";

export function AprovarOrcamentoButton({ chave }: { chave: string }) {
  const [, startTransition] = useTransition();
  const [aprovado, setAprovado] = useState(false);

  if (aprovado) {
    return (
      <div className="flex items-center gap-2 rounded-[9px] bg-success/10 px-4 py-3 text-[13.5px] font-semibold text-success">
        <CircleCheck size={18} /> Orçamento aprovado. Obrigado!
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const ok = await aprovarOrcamentoAction(chave);
          if (ok) setAprovado(true);
        })
      }
      className="flex items-center justify-center gap-2 rounded-[9px] bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground hover:opacity-90"
    >
      <CircleCheck size={18} /> Aprovar orçamento
    </button>
  );
}
