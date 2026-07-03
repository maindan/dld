import { notFound } from "next/navigation";
import { getFreelaDetail } from "@/lib/queries/freelas";
import { FreelaDetail } from "@/components/freelas/freela-detail";

const TABS_VALIDAS = ["detalhes", "orcamentos", "cronograma", "reunioes", "contratos", "financeiro"] as const;
type TabId = (typeof TABS_VALIDAS)[number];

function parseTab(value: string | undefined): TabId | undefined {
  return TABS_VALIDAS.includes(value as TabId) ? (value as TabId) : undefined;
}

export default async function FreelaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const freela = await getFreelaDetail(id);
  if (!freela) notFound();

  return <FreelaDetail freela={freela} tabInicial={parseTab(tab)} />;
}
