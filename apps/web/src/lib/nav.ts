import { Home, Briefcase, Users, Check, Target, FileText, LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  mobileVisible: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "inicio", href: "/inicio", label: "Início", icon: Home, accent: "#818cf8", mobileVisible: true },
  { id: "workstation", href: "/workstation", label: "Workstation", icon: Briefcase, accent: "#2dd4bf", mobileVisible: false },
  { id: "freelas", href: "/freelas", label: "Freelas", icon: Users, accent: "#f472b6", mobileVisible: true },
  { id: "tasks", href: "/tasks", label: "Tasks", icon: Check, accent: "#fbbf24", mobileVisible: true },
  { id: "metas", href: "/metas", label: "Metas", icon: Target, accent: "#34d399", mobileVisible: true },
  { id: "blog", href: "/blog", label: "Blog", icon: FileText, accent: "#60a5fa", mobileVisible: true },
  { id: "portfolio", href: "/portfolio", label: "Portfolio", icon: LayoutGrid, accent: "#a78bfa", mobileVisible: false },
];

export const SCREEN_TITLES: Record<string, { title: string; crumb: string }> = {
  inicio: { title: "Início", crumb: "visão geral" },
  workstation: { title: "Workstation", crumb: "expediente & landing pages" },
  freelas: { title: "Freelas", crumb: "orçamentos, cronograma & financeiro" },
  tasks: { title: "Tasks", crumb: "prioridades e projetos" },
  metas: { title: "Metas", crumb: "objetivos financeiros" },
  blog: { title: "Blog", crumb: "posts do site público" },
  portfolio: { title: "Portfolio", crumb: "projetos publicados" },
};
