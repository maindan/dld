export type EstiloHeader = "solido-fixo" | "transparente-sobre-hero" | "centralizado" | "pill-flutuante";
export type EstiloBotao = "arredondado" | "pill" | "reto";
export type EstiloAnimacao = "fade-up" | "zoom-in" | "slide-in" | "none";

export interface LandingPageTheme {
  id: string;
  nome: string;
  desc: string;
  /** Accent color for the model's thumbnail card in the picker grid, and the default corAcento. */
  cor: string;
  corSecundaria: string;
  corFundo: string;
  corFundoAlt: string;
  corTexto: string;
  corTextoSuave: string;
  /** Google Fonts family names (loaded via next/font in the generated project). */
  fonteTitulo: string;
  fonteCorpo: string;
  estiloHeader: EstiloHeader;
  estiloBotao: EstiloBotao;
  estiloAnimacao: EstiloAnimacao;
  /** Section corner radius in px — 0 for the sharper themes. */
  radius: number;
  /** True for themes whose base page background is dark. */
  escuro: boolean;
}

export const LANDING_PAGE_MODELS: LandingPageTheme[] = [
  {
    id: "base",
    nome: "Base",
    desc: "Minimalista, neutro, ponto de partida para qualquer negócio",
    cor: "#818cf8",
    corSecundaria: "#6366f1",
    corFundo: "#ffffff",
    corFundoAlt: "#f8f9fb",
    corTexto: "#0f1115",
    corTextoSuave: "#5b6472",
    fonteTitulo: "Inter",
    fonteCorpo: "Inter",
    estiloHeader: "solido-fixo",
    estiloBotao: "arredondado",
    estiloAnimacao: "fade-up",
    radius: 12,
    escuro: false,
  },
  {
    id: "servicos",
    nome: "Serviços",
    desc: "Clínicas e consultorias — acolhedor, botões em pílula, tom suave",
    cor: "#34d399",
    corSecundaria: "#10b981",
    corFundo: "#fbfdfc",
    corFundoAlt: "#eefaf4",
    corTexto: "#0f1a15",
    corTextoSuave: "#4b6357",
    fonteTitulo: "Fraunces",
    fonteCorpo: "Inter",
    estiloHeader: "centralizado",
    estiloBotao: "pill",
    estiloAnimacao: "fade-up",
    radius: 20,
    escuro: false,
  },
  {
    id: "produto",
    nome: "Produto / SaaS",
    desc: "Escuro, gradiente vibrante, cards com vidro fosco, para produtos digitais",
    cor: "#818cf8",
    corSecundaria: "#c084fc",
    corFundo: "#0b0e17",
    corFundoAlt: "#12162447",
    corTexto: "#f1f2f8",
    corTextoSuave: "#9ba0b4",
    fonteTitulo: "Space Grotesk",
    fonteCorpo: "Inter",
    estiloHeader: "transparente-sobre-hero",
    estiloBotao: "arredondado",
    estiloAnimacao: "zoom-in",
    radius: 16,
    escuro: true,
  },
  {
    id: "evento",
    nome: "Evento",
    desc: "Escuro e ousado, urgência, tipografia condensada",
    cor: "#f472b6",
    corSecundaria: "#fb7185",
    corFundo: "#120a12",
    corFundoAlt: "#1d0f1c",
    corTexto: "#fdf2f8",
    corTextoSuave: "#d8b4d0",
    fonteTitulo: "Archivo Black",
    fonteCorpo: "Inter",
    estiloHeader: "pill-flutuante",
    estiloBotao: "reto",
    estiloAnimacao: "slide-in",
    radius: 4,
    escuro: true,
  },
  {
    id: "portfolio-pessoal",
    nome: "Portfólio Pessoal",
    desc: "Editorial, âmbar quente, muito espaço em branco",
    cor: "#fbbf24",
    corSecundaria: "#f59e0b",
    corFundo: "#fffdf8",
    corFundoAlt: "#fdf6e8",
    corTexto: "#1c1710",
    corTextoSuave: "#6b6250",
    fonteTitulo: "Fraunces",
    fonteCorpo: "Inter",
    estiloHeader: "centralizado",
    estiloBotao: "reto",
    estiloAnimacao: "fade-up",
    radius: 0,
    escuro: false,
  },
  {
    id: "institucional",
    nome: "Institucional",
    desc: "Azul corporativo, confiável, grade simétrica e estruturada",
    cor: "#60a5fa",
    corSecundaria: "#3b82f6",
    corFundo: "#ffffff",
    corFundoAlt: "#f1f5fb",
    corTexto: "#0e1726",
    corTextoSuave: "#48566b",
    fonteTitulo: "Source Serif 4",
    fonteCorpo: "Inter",
    estiloHeader: "solido-fixo",
    estiloBotao: "reto",
    estiloAnimacao: "fade-up",
    radius: 6,
    escuro: false,
  },
];
