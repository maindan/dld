import { getPortfolioItens } from "@/lib/queries/portfolio";
import { PortfolioBoard } from "@/components/portfolio/portfolio-board";

export default async function PortfolioPage() {
  const itens = await getPortfolioItens();
  return <PortfolioBoard itens={itens} />;
}
