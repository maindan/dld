"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, Menu, LogOut, Download, PanelLeftClose, PanelLeftOpen, Share, X } from "lucide-react";
import { NAV_ITEMS, SCREEN_TITLES } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { TimerPill } from "./timer-pill";
import { NotifBell } from "./notif-bell";
import { useInstallPrompt } from "@/lib/use-install-prompt";
import type { ExpedienteAtivo } from "@/lib/queries/expediente";
import type { Notificacao } from "@/lib/queries/notificacoes";

const SIDEBAR_COLLAPSE_KEY = "danlimadev:sidebar-collapsed";

function activeSection(pathname: string): string {
  return pathname.split("/")[1] || "inicio";
}

function NavList({
  active,
  onNavigate,
  mobileOnly,
  collapsed,
}: {
  active: string;
  onNavigate?: () => void;
  mobileOnly?: boolean;
  collapsed?: boolean;
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
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-[11px] rounded-[9px] border-l-2 px-[11px] py-[9px] transition-colors duration-150 hover:bg-[#1b222c]",
              collapsed && "justify-center px-0",
            )}
            style={{
              background: isActive ? "rgba(129,140,248,0.1)" : "transparent",
              borderColor: isActive ? item.accent : "transparent",
              color: isActive ? "#e6eaf0" : "#8b96a5",
            }}
          >
            <Icon size={18} className="flex-none" />
            <span
              className={cn(
                "overflow-hidden text-[13.5px] font-medium whitespace-nowrap transition-all duration-200",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </>
  );
}

function InstallButton({
  collapsed,
  variant = "sidebar",
}: {
  collapsed?: boolean;
  variant?: "sidebar" | "drawer";
}) {
  const { canInstall, promptInstall, isIos, isStandalone } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  if (isStandalone) return null;
  if (!canInstall && !isIos) return null;

  if (collapsed) {
    return (
      <button
        onClick={canInstall ? promptInstall : () => setShowIosHint(true)}
        title="Instalar app"
        className="mb-1.5 flex items-center justify-center rounded-[9px] border border-dashed border-[#303a47] py-2.5 text-muted-foreground hover:border-primary hover:text-[#c9d1dc]"
      >
        <Download size={17} className="flex-none" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={canInstall ? promptInstall : () => setShowIosHint(true)}
        className="mb-1.5 flex items-center gap-2.5 rounded-[9px] border border-dashed border-[#303a47] px-[11px] py-2.5 text-left text-muted-foreground hover:border-primary hover:text-[#c9d1dc]"
      >
        <Download size={17} className="flex-none" />
        <span className="flex flex-col items-start">
          <span className="text-[12.5px] font-semibold">Instalar app</span>
          <span className="text-[10.5px] text-[#55606e]">PWA · offline</span>
        </span>
      </button>

      {showIosHint && (
        <div className={cn("fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center", variant === "drawer" && "z-[95]")}>
          <button
            aria-label="Fechar"
            onClick={() => setShowIosHint(false)}
            className="fixed inset-0 bg-black/60"
          />
          <div className="relative flex w-full max-w-[360px] flex-col gap-3.5 rounded-[16px] border border-[#303a47] bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-semibold">Instalar no iOS</div>
              <button onClick={() => setShowIosHint(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
              <Share size={16} className="mt-0.5 flex-none text-primary" />
              Toque em <strong className="text-foreground">Compartilhar</strong>, depois em{" "}
              <strong className="text-foreground">Adicionar à Tela de Início</strong>.
            </div>
          </div>
        </div>
      )}
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

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
      <div
        className={cn(
          "hidden flex-none flex-col gap-[3px] border-r border-[#1f2733] bg-[#10141b] p-3 transition-[width] duration-200 ease-in-out md:flex",
          collapsed ? "w-[68px]" : "w-[216px]",
        )}
      >
        <div className={cn("flex items-center gap-[9px] px-2 pt-1 pb-4", collapsed && "justify-center px-0")}>
          <div className="flex size-7 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
            <Terminal size={16} />
          </div>
          <div
            className={cn(
              "overflow-hidden font-mono text-[14.5px] font-semibold whitespace-nowrap transition-all duration-200",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <span className="text-primary">~/</span>danlimadev
          </div>
        </div>

        <NavList active={active} collapsed={collapsed} />
        <div className="flex-1" />

        <InstallButton collapsed={collapsed} />

        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expandir menu" : "Comprimir menu"}
          className={cn(
            "mb-1 flex items-center gap-2.5 rounded-[9px] px-[11px] py-2 text-muted-foreground transition-colors hover:bg-[#1b222c] hover:text-[#c9d1dc]",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? <PanelLeftOpen size={17} className="flex-none" /> : <PanelLeftClose size={17} className="flex-none" />}
          <span
            className={cn(
              "overflow-hidden text-[12.5px] font-medium whitespace-nowrap transition-all duration-200",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            Comprimir menu
          </span>
        </button>

        <div
          className={cn(
            "overflow-hidden px-[11px] font-mono text-[10px] whitespace-nowrap text-[#3a4553] transition-all duration-200",
            collapsed ? "h-0 opacity-0" : "h-auto opacity-100",
          )}
        >
          v0.3
        </div>
      </div>

      {/* Mobile drawer */}
      <button
        aria-label="Fechar menu"
        aria-hidden={!drawerOpen}
        tabIndex={drawerOpen ? 0 : -1}
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden",
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        aria-hidden={!drawerOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col gap-[3px] bg-[#10141b] p-3 transition-transform duration-200 ease-out md:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-[9px] px-2 pt-1 pb-4">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
            <Terminal size={16} />
          </div>
          <div className="font-mono text-[14.5px] font-semibold">
            <span className="text-primary">~/</span>danlimadev
          </div>
        </div>
        <NavList active={active} mobileOnly onNavigate={() => setDrawerOpen(false)} />
        <div className="flex-1" />
        <InstallButton variant="drawer" />
        <div className="mt-1.5 border-t border-[#1f2733] px-[11px] pt-2.5 pb-1 text-[10.5px] leading-relaxed text-[#55606e]">
          Workstation e Portfolio na versão desktop.
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[58px] flex-none items-center gap-2.5 border-b border-[#1f2733] bg-gradient-to-b from-[#12171f] to-[#10141b] px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex size-[38px] flex-none items-center justify-center rounded-[9px] text-[#c9d1dc] transition-colors hover:bg-[#1b222c] md:hidden"
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
            className="flex flex-none items-center gap-2 rounded-[9px] border border-border bg-[#171d26] py-1.5 pr-2 pl-2.5 transition-colors hover:border-destructive hover:bg-destructive/10"
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
