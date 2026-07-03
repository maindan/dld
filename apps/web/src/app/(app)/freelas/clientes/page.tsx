import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getClientesList } from "@/lib/queries/clientes";
import { ClientesBoard } from "@/components/freelas/clientes-board";

export default async function ClientesPage() {
  const clientes = await getClientesList();

  return (
    <div className="flex flex-col gap-3.5">
      <Link
        href="/freelas"
        className="flex w-fit items-center gap-1.5 rounded-[8px] border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-muted-foreground hover:border-[#3a4553] hover:text-[#e6eaf0]"
      >
        <ChevronLeft size={14} /> Freelas
      </Link>

      <ClientesBoard clientes={clientes} />
    </div>
  );
}
