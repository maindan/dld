import {
  getExpedienteAtivo,
  getProjetosParaExpediente,
  getExpedienteResumo,
  getRelatorioHoras,
} from "@/lib/queries/expediente";
import { getLandingPageDrafts } from "@/lib/queries/landing-pages";
import { ExpedienteControls } from "@/components/workstation/expediente-controls";
import { RelatorioHorasCard } from "@/components/workstation/relatorio-horas";
import { LandingPagesSection } from "@/components/workstation/landing-pages-section";

export default async function WorkstationPage() {
  const [expediente, projetos, resumo, relatorioSemana, relatorioMes, relatorioProjeto, drafts] = await Promise.all([
    getExpedienteAtivo(),
    getProjetosParaExpediente(),
    getExpedienteResumo(),
    getRelatorioHoras("semana"),
    getRelatorioHoras("mes", 0),
    getRelatorioHoras("projeto"),
    getLandingPageDrafts(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-stretch gap-3.5 lg:grid-cols-[340px_1fr]">
        <ExpedienteControls expediente={expediente} projetos={projetos} resumo={resumo} />
        <RelatorioHorasCard semana={relatorioSemana} mesInicial={relatorioMes} projeto={relatorioProjeto} />
      </div>

      <LandingPagesSection drafts={drafts} />
    </div>
  );
}
