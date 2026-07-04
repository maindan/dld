import { AppShell } from "@/components/shell/app-shell";
import { getCurrentProfile } from "@/lib/queries/profile";
import { getExpedienteAtivo } from "@/lib/queries/expediente";
import { getNotificacoes } from "@/lib/queries/notificacoes";

// Every page under this layout is per-user authenticated data — never
// statically cacheable — and every one of them already builds as ƒ (Dynamic).
// Without this, Next's build still does a trial render of each page (and this
// layout, which itself queries the DB 3x) to detect that dynamism, so the
// build's success depends on DB reachability/latency from wherever it runs.
// force-dynamic skips that trial render entirely and applies to the whole
// subtree, so no child page needs its own copy of this export.
export const dynamic = "force-dynamic";

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
