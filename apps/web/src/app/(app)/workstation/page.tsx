import {
  getExpedienteAtivo,
  getProjetosParaExpediente,
  getExpedientesHistorico,
} from "@/lib/queries/expediente";
import { getLandingPageDrafts } from "@/lib/queries/landing-pages";
import { ExpedienteControls } from "@/components/workstation/expediente-controls";
import { LandingPagesSection } from "@/components/workstation/landing-pages-section";

export default async function WorkstationPage() {
  const [expediente, projetos, historico, drafts] = await Promise.all([
    getExpedienteAtivo(),
    getProjetosParaExpediente(),
    getExpedientesHistorico(),
    getLandingPageDrafts(),
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ExpedienteControls expediente={expediente} projetos={projetos} historico={historico} />
      <LandingPagesSection drafts={drafts} freelas={projetos} />
    </div>
  );
}
