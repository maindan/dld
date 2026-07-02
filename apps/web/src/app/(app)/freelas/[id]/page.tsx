import { notFound } from "next/navigation";
import { getFreelaDetail } from "@/lib/queries/freelas";
import { FreelaDetail } from "@/components/freelas/freela-detail";

export default async function FreelaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const freela = await getFreelaDetail(id);
  if (!freela) notFound();

  return <FreelaDetail freela={freela} />;
}
