import type {
  EstiloHeader,
  EstiloBotao,
  EstiloAnimacao,
  EstiloBackground,
  EstiloCard,
} from "@danlimadev/contracts";

export type { EstiloHeader, EstiloBotao, EstiloAnimacao, EstiloBackground, EstiloCard };

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
  /** Google Fonts family names (loaded via <link> in the generated project). */
  fonteTitulo: string;
  fonteCorpo: string;
  estiloHeader: EstiloHeader;
  estiloBotao: EstiloBotao;
  estiloAnimacao: EstiloAnimacao;
  /** Decorative page/hero background treatment (aurora, mesh, grid-glow...). */
  estiloBackground: EstiloBackground;
  /** Card surface treatment for grids (services, testimonials, pricing...). */
  estiloCard: EstiloCard;
  /** Section corner radius in px — 0 for the sharper themes. */
  radius: number;
  /** True for themes whose base page background is dark. */
  escuro: boolean;
}

/**
 * Six deliberately distinct visual directions, each anchored in a real current
 * landing-page archetype (see the design survey in packages/contracts):
 * clean-minimal, warm-service, dark-SaaS-aurora, neon-event, editorial-portfolio,
 * corporate-institutional.
 */
export const LANDING_PAGE_MODELS: LandingPageTheme[] = [
  {
    id: "base",
    nome: "Base",
    desc: "Minimalista e claro, pontilhado sutil — ponto de partida para qualquer negócio",
    cor: "#6366f1",
    corSecundaria: "#818cf8",
    corFundo: "#ffffff",
    corFundoAlt: "#f7f8fb",
    corTexto: "#0f1115",
    corTextoSuave: "#5b6472",
    fonteTitulo: "Inter",
    fonteCorpo: "Inter",
    estiloHeader: "solido-fixo",
    estiloBotao: "arredondado",
    estiloAnimacao: "fade-up",
    estiloBackground: "dots",
    estiloCard: "elevated",
    radius: 14,
    escuro: false,
  },
  {
    id: "servicos",
    nome: "Serviços",
    desc: "Clínicas e consultorias — acolhedor, bolhas de luz suaves, botões em pílula",
    cor: "#10b981",
    corSecundaria: "#34d399",
    corFundo: "#fbfdfc",
    corFundoAlt: "#edf9f3",
    corTexto: "#0f1a15",
    corTextoSuave: "#4b6357",
    fonteTitulo: "Fraunces",
    fonteCorpo: "Manrope",
    estiloHeader: "centralizado",
    estiloBotao: "pill",
    estiloAnimacao: "fade-up",
    estiloBackground: "orbs",
    estiloCard: "elevated",
    radius: 22,
    escuro: false,
  },
  {
    id: "produto",
    nome: "Produto / SaaS",
    desc: "Escuro com aurora animada, cards de vidro fosco, acento elétrico — produtos digitais",
    cor: "#818cf8",
    corSecundaria: "#c084fc",
    corFundo: "#08090f",
    corFundoAlt: "#0e1019",
    corTexto: "#f1f2f8",
    corTextoSuave: "#9ba0b4",
    fonteTitulo: "Space Grotesk",
    fonteCorpo: "Inter",
    estiloHeader: "transparente-sobre-hero",
    estiloBotao: "arredondado",
    estiloAnimacao: "zoom-in",
    estiloBackground: "aurora",
    estiloCard: "glass",
    radius: 16,
    escuro: true,
  },
  {
    id: "evento",
    nome: "Evento",
    desc: "Dark neon com grade brilhante, tipografia de impacto, urgência",
    cor: "#f472b6",
    corSecundaria: "#fb7185",
    corFundo: "#0c060c",
    corFundoAlt: "#160b15",
    corTexto: "#fdf2f8",
    corTextoSuave: "#d8b4d0",
    fonteTitulo: "Archivo Black",
    fonteCorpo: "Inter",
    estiloHeader: "pill-flutuante",
    estiloBotao: "reto",
    estiloAnimacao: "slide-in",
    estiloBackground: "grid-glow",
    estiloCard: "outline",
    radius: 4,
    escuro: true,
  },
  {
    id: "portfolio-pessoal",
    nome: "Portfólio Pessoal",
    desc: "Editorial tipográfico, papel quente, acento âmbar afiado, zero arredondamento",
    cor: "#d97706",
    corSecundaria: "#f59e0b",
    corFundo: "#fdfbf7",
    corFundoAlt: "#f6f1e7",
    corTexto: "#191510",
    corTextoSuave: "#6b6250",
    fonteTitulo: "Playfair Display",
    fonteCorpo: "Inter",
    estiloHeader: "centralizado",
    estiloBotao: "reto",
    estiloAnimacao: "fade-up",
    estiloBackground: "minimal",
    estiloCard: "outline",
    radius: 0,
    escuro: false,
  },
  {
    id: "institucional",
    nome: "Institucional",
    desc: "Azul corporativo com mesh suave, serifada de confiança, grade simétrica",
    cor: "#2563eb",
    corSecundaria: "#60a5fa",
    corFundo: "#ffffff",
    corFundoAlt: "#eff4fc",
    corTexto: "#0e1726",
    corTextoSuave: "#48566b",
    fonteTitulo: "Source Serif 4",
    fonteCorpo: "Inter",
    estiloHeader: "solido-fixo",
    estiloBotao: "reto",
    estiloAnimacao: "fade-up",
    estiloBackground: "mesh",
    estiloCard: "elevated",
    radius: 8,
    escuro: false,
  },
];
