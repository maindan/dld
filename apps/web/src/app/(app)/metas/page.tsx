import { getMetasOverview } from "@/lib/queries/metas";
import { MetasBoard } from "@/components/metas/metas-board";

export default async function MetasPage() {
  const overview = await getMetasOverview();
  return <MetasBoard overview={overview} />;
}
