import { AppShell } from "@/components/shell/app-shell";
import { getCurrentProfile } from "@/lib/queries/profile";
import { getExpedienteAtivo } from "@/lib/queries/expediente";
import { getNotificacoes } from "@/lib/queries/notificacoes";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, expediente, notificacoes] = await Promise.all([
    getCurrentProfile(),
    getExpedienteAtivo(),
    getNotificacoes(),
  ]);

  return (
    <AppShell
      profile={profile ?? { nome: "danlimadev", iniciais: "dl" }}
      expediente={expediente}
      notificacoes={notificacoes}
    >
      {children}
    </AppShell>
  );
}
