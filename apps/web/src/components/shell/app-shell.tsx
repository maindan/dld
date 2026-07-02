"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, Menu, LogOut, Download } from "lucide-react";
import { NAV_ITEMS, SCREEN_TITLES } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";
import { TimerPill } from "./timer-pill";
import { NotifBell } from "./notif-bell";
import { useInstallPrompt } from "@/lib/use-install-prompt";
import type { ExpedienteAtivo } from "@/lib/queries/expediente";
import type { Notificacao } from "@/lib/queries/notificacoes";

function activeSection(pathname: string): string {
  return pathname.split("/")[1] || "inicio";
}

function NavList({
  active,
  onNavigate,
  mobileOnly,
}: {
  active: string;
  onNavigate?: () => void;
  mobileOnly?: boolean;
}) {
  const items = mobileOnly ? NAV_ITEMS.filter((i) => i.mobileVisible) : NAV_ITEMS;
  return (
    <>
      {items.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-[11px] rounded-[9px] border-l-2 px-[11px] py-[9px] hover:bg-[#1b222c]"
            style={{
              background: isActive ? "rgba(129,140,248,0.1)" : "transparent",
              borderColor: isActive ? item.accent : "transparent",
              color: isActive ? "#e6eaf0" : "#8b96a5",
            }}
          >
            <Icon size={18} className="flex-none" />
            <span className="text-[13.5px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function AppShell({
  profile,
  expediente,
  notificacoes,
  children,
}: {
  profile: { nome: string; iniciais: string };
  expediente: ExpedienteAtivo | null;
  notificacoes: Notificacao[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { canInstall, promptInstall } = useInstallPrompt();

  const active = activeSection(pathname);
  const screen = SCREEN_TITLES[active] ?? { title: "danlimadev", crumb: "" };

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="relative flex h-full flex-1 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden w-[216px] flex-none flex-col gap-[3px] border-r border-[#1f2733] bg-[#10141b] p-3 md:flex">
        <div className="flex items-center gap-[9px] px-2 pt-1 pb-4">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
            <Terminal size={16} />
          </div>
          <div className="font-mono text-[14.5px] font-semibold">
            <span className="text-primary">~/</span>danlimadev
          </div>
        </div>
        <NavList active={active} />
        <div className="flex-1" />
        {canInstall && (
          <button
            onClick={promptInstall}
            className="mb-1.5 flex items-center gap-2.5 rounded-[9px] border border-dashed border-[#303a47] px-[11px] py-2.5 text-muted-foreground hover:border-primary hover:text-[#c9d1dc]"
          >
            <Download size={17} className="flex-none" />
            <span className="flex flex-col items-start">
              <span className="text-[12.5px] font-semibold">Instalar app</span>
              <span className="text-[10.5px] text-[#55606e]">PWA · offline</span>
            </span>
          </button>
        )}
        <div className="px-[11px] font-mono text-[10px] text-[#3a4553]">v0.3</div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <button
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col gap-[3px] bg-[#10141b] p-3 md:hidden">
            <div className="flex items-center gap-[9px] px-2 pt-1 pb-4">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
                <Terminal size={16} />
              </div>
              <div className="font-mono text-[14.5px] font-semibold">
                <span className="text-primary">~/</span>danlimadev
              </div>
            </div>
            <NavList active={active} mobileOnly onNavigate={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[58px] flex-none items-center gap-2.5 border-b border-[#1f2733] bg-gradient-to-b from-[#12171f] to-[#10141b] px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex size-[38px] flex-none items-center justify-center rounded-[9px] text-[#c9d1dc] hover:bg-[#1b222c] md:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="flex min-w-0 flex-col gap-px">
            <div className="truncate text-[15.5px] font-semibold">{screen.title}</div>
            <div className="truncate font-mono text-[10.5px] text-[#55606e]">{screen.crumb}</div>
          </div>
          <div className="flex-1" />
          <TimerPill expediente={expediente} />
          <NotifBell notificacoes={notificacoes} />
          <button
            onClick={logout}
            title="Sair"
            className="flex flex-none items-center gap-2 rounded-[9px] border border-border bg-[#171d26] py-1.5 pr-2 pl-2.5 hover:border-destructive hover:bg-destructive/10"
          >
            <span className="flex size-[26px] items-center justify-center rounded-full bg-gradient-to-br from-[#818cf8] to-[#6366f1] font-mono text-[11px] font-semibold text-background">
              {profile.iniciais}
            </span>
            <LogOut size={15} className="text-muted-foreground" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
