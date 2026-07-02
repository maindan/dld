import Link from "next/link";
import { getFreelasList } from "@/lib/queries/freelas";
import { CreateFreelaForm } from "@/components/freelas/create-freela-form";
import { formatBRL } from "@/lib/format";

export default async function FreelasPage() {
  const freelasList = await getFreelasList();

  return (
    <div className="flex flex-col gap-5">
      <CreateFreelaForm />

      {freelasList.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-card py-12 text-center text-[13px] text-muted-foreground">
          Nenhum freela cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freelasList.map((f) => (
            <Link
              key={f.id}
              href={`/freelas/${f.id}`}
              className="flex flex-col gap-2.5 rounded-[12px] border border-border bg-card p-4 hover:border-primary"
            >
              <div className="flex items-center gap-2.5">
                <span className="size-2.5 flex-none rounded-full" style={{ background: f.cor }} />
                <span className="truncate text-[14.5px] font-semibold text-[#e6eaf0]">{f.nome}</span>
              </div>
              <div className="truncate text-[12.5px] text-muted-foreground">
                {f.clienteNome}
                {f.tipo && ` · ${f.tipo}`}
              </div>
              <div className="mt-1 flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">{f.orcamentosAbertos} orçamento(s) aberto(s)</span>
                <span className="font-mono font-semibold text-success">{formatBRL(f.aReceber)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
