import { z } from "zod";

/**
 * Boundary contract between apps/web (editor UI) and services/landing-generator
 * (Next.js project scaffolder). Neither side should reach past this shape.
 * Zero heavy deps here on purpose — this file is imported by a "use client"
 * component (the editor), so anything added must stay bundler-safe for the browser.
 */

// ---------------------------------------------------------------------------
// Design vocabulary — the shared option sets for theme defaults AND per-page
// overrides. The canonical lists live here (not in the generator) because both
// sides render them: the generator into real CSS, the editor into pickers and
// a live preview. Derived from a survey of current landing page design:
// aurora/mesh gradient backgrounds with grain, dark-dominant palettes with a
// single saturated accent, surgical scroll reveals, marquee social proof,
// animated stat counters.
// ---------------------------------------------------------------------------

export const ESTILOS_HEADER = ["solido-fixo", "transparente-sobre-hero", "centralizado", "pill-flutuante"] as const;
export type EstiloHeader = (typeof ESTILOS_HEADER)[number];

export const ESTILOS_BOTAO = ["arredondado", "pill", "reto"] as const;
export type EstiloBotao = (typeof ESTILOS_BOTAO)[number];

export const ESTILOS_ANIMACAO = ["fade-up", "zoom-in", "slide-in", "none"] as const;
export type EstiloAnimacao = (typeof ESTILOS_ANIMACAO)[number];

/** Decorative page/hero background treatment. Every value must be implemented
 * by BOTH the generator's CSS and the editor preview. */
export const ESTILOS_BACKGROUND = ["aurora", "mesh", "grid-glow", "dots", "orbs", "diagonal", "minimal"] as const;
export type EstiloBackground = (typeof ESTILOS_BACKGROUND)[number];

export const ESTILOS_CARD = ["flat", "glass", "elevated", "outline"] as const;
export type EstiloCard = (typeof ESTILOS_CARD)[number];

export const ESTILO_BACKGROUND_LABELS: Record<EstiloBackground, string> = {
  aurora: "Aurora (gradiente animado)",
  mesh: "Mesh gradient suave",
  "grid-glow": "Grade com brilho",
  dots: "Pontilhado sutil",
  orbs: "Bolhas de luz",
  diagonal: "Corte diagonal",
  minimal: "Liso (sem decoração)",
};

export const ESTILO_CARD_LABELS: Record<EstiloCard, string> = {
  flat: "Plano",
  glass: "Vidro fosco",
  elevated: "Elevado (sombra)",
  outline: "Contorno",
};

export const ESTILO_BOTAO_LABELS: Record<EstiloBotao, string> = {
  arredondado: "Arredondado",
  pill: "Pílula",
  reto: "Reto",
};

export const ESTILO_ANIMACAO_LABELS: Record<EstiloAnimacao, string> = {
  "fade-up": "Surgir de baixo",
  "zoom-in": "Aproximar",
  "slide-in": "Deslizar",
  none: "Sem animação",
};

/** Curated Google Fonts pairings the editor offers. `titulo`/`corpo` are the
 * literal family names the generator feeds to fonts.googleapis.com. */
export interface FontePairing {
  id: string;
  nome: string;
  titulo: string;
  corpo: string;
}

export const FONTE_PAIRINGS: FontePairing[] = [
  { id: "inter", nome: "Inter — neutra e técnica", titulo: "Inter", corpo: "Inter" },
  { id: "space-grotesk", nome: "Space Grotesk — tech/produto", titulo: "Space Grotesk", corpo: "Inter" },
  { id: "fraunces", nome: "Fraunces — serifada expressiva", titulo: "Fraunces", corpo: "Inter" },
  { id: "playfair", nome: "Playfair Display — editorial clássica", titulo: "Playfair Display", corpo: "Inter" },
  { id: "archivo-black", nome: "Archivo Black — impacto máximo", titulo: "Archivo Black", corpo: "Inter" },
  { id: "source-serif", nome: "Source Serif 4 — institucional", titulo: "Source Serif 4", corpo: "Inter" },
  { id: "sora", nome: "Sora — geométrica moderna", titulo: "Sora", corpo: "Inter" },
  { id: "syne", nome: "Syne — display criativa", titulo: "Syne", corpo: "Inter" },
  { id: "manrope", nome: "Manrope — suave e amigável", titulo: "Manrope", corpo: "Manrope" },
  { id: "bricolage", nome: "Bricolage Grotesque — personalidade", titulo: "Bricolage Grotesque", corpo: "Inter" },
];

/**
 * Per-page design overrides, all optional — anything unset falls back to the
 * chosen theme's default. This is what the editor's "Design" tab edits.
 */
export const designConfigSchema = z.object({
  fonteTitulo: z.string().optional(),
  fonteCorpo: z.string().optional(),
  estiloBotao: z.enum(ESTILOS_BOTAO).optional(),
  estiloAnimacao: z.enum(ESTILOS_ANIMACAO).optional(),
  estiloBackground: z.enum(ESTILOS_BACKGROUND).optional(),
  estiloCard: z.enum(ESTILOS_CARD).optional(),
  radius: z.number().int().min(0).max(28).optional(),
});
export type DesignConfig = z.infer<typeof designConfigSchema>;

// ---------------------------------------------------------------------------
// Section block registry — the "Elementor-like" catalog of section types. The
// editor renders its generic add/edit UI purely from this data (field labels,
// input kind, whether the block supports a repeatable list of items, which
// layout variants exist) instead of hardcoding a form per section type.
// ---------------------------------------------------------------------------

export const CAMPO_TIPOS = ["texto", "textarea", "booleano", "imagem"] as const;
export type CampoTipo = (typeof CAMPO_TIPOS)[number];

export interface CampoDef {
  key: string;
  label: string;
  tipo: CampoTipo;
  placeholder?: string;
}

export interface ItensDef {
  /** Singular label used in "+ Adicionar {label}" and per-card headers. */
  label: string;
  campos: CampoDef[];
  min: number;
  max: number;
}

export interface VarianteDef {
  id: string;
  nome: string;
}

export interface SecaoBlockDef {
  tipo: string;
  nome: string;
  desc: string;
  campos: CampoDef[];
  /** Present only for blocks that render a repeatable list (cards, rows, etc). */
  itens?: ItensDef;
  /** Layout variants the generator/preview implement; first entry is the default. */
  variantes?: VarianteDef[];
}

export const SECAO_BLOCKS: Record<string, SecaoBlockDef> = {
  hero: {
    tipo: "hero",
    nome: "Hero",
    desc: "Título de impacto + call-to-action no topo da página",
    campos: [
      { key: "titulo", label: "Título", tipo: "texto" },
      { key: "subtitulo", label: "Subtítulo", tipo: "textarea" },
      { key: "cta", label: "Texto do botão", tipo: "texto" },
      { key: "badge", label: "Selo acima do título (opcional)", tipo: "texto", placeholder: "Novo · lançamento 2026" },
      { key: "imagemUrl", label: "Imagem de destaque (opcional)", tipo: "imagem" },
    ],
    variantes: [
      { id: "centrado", nome: "Centralizado" },
      { id: "split", nome: "Texto + imagem lado a lado" },
      { id: "editorial", nome: "Editorial (tipografia gigante)" },
    ],
  },
  sobre: {
    tipo: "sobre",
    nome: "Sobre",
    desc: "Bloco de texto livre (quem somos, proposta de valor)",
    campos: [
      { key: "titulo", label: "Título", tipo: "texto" },
      { key: "texto", label: "Texto", tipo: "textarea" },
      { key: "imagemUrl", label: "Imagem lateral (opcional)", tipo: "imagem" },
    ],
    variantes: [
      { id: "texto", nome: "Só texto" },
      { id: "com-imagem", nome: "Texto + imagem" },
    ],
  },
  servicos: {
    tipo: "servicos",
    nome: "Serviços",
    desc: "Grade de cards com os serviços oferecidos",
    campos: [
      { key: "titulo", label: "Título da seção", tipo: "texto" },
      { key: "subtitulo", label: "Subtítulo (opcional)", tipo: "texto" },
    ],
    itens: {
      label: "Serviço",
      min: 1,
      max: 8,
      campos: [
        { key: "titulo", label: "Título", tipo: "texto" },
        { key: "texto", label: "Descrição", tipo: "textarea" },
      ],
    },
    variantes: [
      { id: "grid", nome: "Grade de cards" },
      { id: "bento", nome: "Bento (primeiro card maior)" },
      { id: "lista", nome: "Lista horizontal" },
    ],
  },
  diferenciais: {
    tipo: "diferenciais",
    nome: "Diferenciais",
    desc: "Grade de cards destacando pontos fortes",
    campos: [
      { key: "titulo", label: "Título da seção", tipo: "texto" },
      { key: "subtitulo", label: "Subtítulo (opcional)", tipo: "texto" },
    ],
    itens: {
      label: "Diferencial",
      min: 1,
      max: 8,
      campos: [
        { key: "titulo", label: "Título", tipo: "texto" },
        { key: "texto", label: "Descrição", tipo: "textarea" },
      ],
    },
    variantes: [
      { id: "grid", nome: "Grade de cards" },
      { id: "bento", nome: "Bento (primeiro card maior)" },
      { id: "lista", nome: "Lista horizontal" },
    ],
  },
  estatisticas: {
    tipo: "estatisticas",
    nome: "Estatísticas",
    desc: "Números de impacto com contadores animados",
    campos: [{ key: "titulo", label: "Título da seção (opcional)", tipo: "texto" }],
    itens: {
      label: "Estatística",
      min: 2,
      max: 6,
      campos: [
        { key: "valor", label: "Número", tipo: "texto", placeholder: "120" },
        { key: "sufixo", label: "Sufixo (opcional)", tipo: "texto", placeholder: "+ / % / mil" },
        { key: "label", label: "Legenda", tipo: "texto", placeholder: "projetos entregues" },
      ],
    },
  },
  marcas: {
    tipo: "marcas",
    nome: "Marcas / clientes",
    desc: "Faixa de logos em rolagem contínua (prova social)",
    campos: [{ key: "titulo", label: "Frase de abertura (opcional)", tipo: "texto", placeholder: "Quem confia no trabalho" }],
    itens: {
      label: "Marca",
      min: 3,
      max: 12,
      campos: [
        { key: "nome", label: "Nome da marca", tipo: "texto" },
        { key: "imagemUrl", label: "Logo (opcional)", tipo: "imagem" },
      ],
    },
  },
  depoimentos: {
    tipo: "depoimentos",
    nome: "Depoimentos",
    desc: "Citações de clientes satisfeitos",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Depoimento",
      min: 1,
      max: 8,
      campos: [
        { key: "nome", label: "Nome", tipo: "texto" },
        { key: "cargo", label: "Cargo/empresa", tipo: "texto" },
        { key: "texto", label: "Depoimento", tipo: "textarea" },
        { key: "imagemUrl", label: "Foto (opcional)", tipo: "imagem" },
      ],
    },
    variantes: [
      { id: "grid", nome: "Grade" },
      { id: "marquee", nome: "Rolagem contínua" },
      { id: "destaque", nome: "Citação em destaque" },
    ],
  },
  precos: {
    tipo: "precos",
    nome: "Preços",
    desc: "Tabela de planos",
    campos: [
      { key: "titulo", label: "Título da seção", tipo: "texto" },
      { key: "subtitulo", label: "Subtítulo (opcional)", tipo: "texto" },
    ],
    itens: {
      label: "Plano",
      min: 1,
      max: 4,
      campos: [
        { key: "nome", label: "Nome do plano", tipo: "texto" },
        { key: "preco", label: "Preço", tipo: "texto", placeholder: "R$ 99/mês" },
        { key: "recursos", label: "Recursos (um por linha)", tipo: "textarea" },
        { key: "destaque", label: "Plano em destaque", tipo: "booleano" },
      ],
    },
  },
  faq: {
    tipo: "faq",
    nome: "Perguntas frequentes",
    desc: "Lista de perguntas e respostas",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Pergunta",
      min: 1,
      max: 10,
      campos: [
        { key: "pergunta", label: "Pergunta", tipo: "texto" },
        { key: "resposta", label: "Resposta", tipo: "textarea" },
      ],
    },
  },
  equipe: {
    tipo: "equipe",
    nome: "Equipe",
    desc: "Cards com as pessoas do time",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Pessoa",
      min: 1,
      max: 8,
      campos: [
        { key: "nome", label: "Nome", tipo: "texto" },
        { key: "cargo", label: "Cargo", tipo: "texto" },
        { key: "imagemUrl", label: "Foto (opcional)", tipo: "imagem" },
      ],
    },
  },
  agenda: {
    tipo: "agenda",
    nome: "Agenda",
    desc: "Programação/cronograma de um evento",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Item da agenda",
      min: 1,
      max: 12,
      campos: [
        { key: "horario", label: "Horário", tipo: "texto", placeholder: "09:00" },
        { key: "titulo", label: "Título", tipo: "texto" },
        { key: "descricao", label: "Descrição", tipo: "texto" },
      ],
    },
  },
  galeria: {
    tipo: "galeria",
    nome: "Galeria / Trabalhos",
    desc: "Grade de projetos ou trabalhos realizados",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Item",
      min: 1,
      max: 9,
      campos: [
        { key: "titulo", label: "Título", tipo: "texto" },
        { key: "descricao", label: "Descrição", tipo: "textarea" },
        { key: "imagemUrl", label: "Imagem (opcional)", tipo: "imagem" },
      ],
    },
    variantes: [
      { id: "grid", nome: "Grade uniforme" },
      { id: "masonry", nome: "Mosaico (alturas variadas)" },
    ],
  },
  habilidades: {
    tipo: "habilidades",
    nome: "Habilidades",
    desc: "Barras de nível de habilidades",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Habilidade",
      min: 1,
      max: 8,
      campos: [
        { key: "nome", label: "Nome", tipo: "texto" },
        { key: "nivel", label: "Nível (0-100)", tipo: "texto", placeholder: "80" },
      ],
    },
  },
  formulario: {
    tipo: "formulario",
    nome: "Formulário de contato",
    desc: "Formulário com nome, e-mail e mensagem",
    campos: [
      { key: "titulo", label: "Título", tipo: "texto" },
      { key: "subtitulo", label: "Subtítulo", tipo: "textarea" },
    ],
  },
  contato: {
    tipo: "contato",
    nome: "Contato",
    desc: "Bloco simples de call-to-action para contato",
    campos: [
      { key: "titulo", label: "Título", tipo: "texto" },
      { key: "texto", label: "Texto", tipo: "textarea" },
    ],
  },
  cta: {
    tipo: "cta",
    nome: "Chamada final",
    desc: "Faixa de destaque com botão de ação",
    campos: [
      { key: "titulo", label: "Título", tipo: "texto" },
      { key: "subtitulo", label: "Subtítulo", tipo: "textarea" },
      { key: "cta", label: "Texto do botão", tipo: "texto" },
    ],
  },
};

export type SecaoTipo = keyof typeof SECAO_BLOCKS;

export function defaultCampos(tipo: string): Record<string, string> {
  const def = SECAO_BLOCKS[tipo];
  if (!def) return {};
  return Object.fromEntries(def.campos.map((c) => [c.key, ""]));
}

export function defaultItem(tipo: string): Record<string, string> {
  const def = SECAO_BLOCKS[tipo]?.itens;
  if (!def) return {};
  return Object.fromEntries(def.campos.map((c) => [c.key, c.tipo === "booleano" ? "false" : ""]));
}

export function defaultVariante(tipo: string): string | undefined {
  return SECAO_BLOCKS[tipo]?.variantes?.[0]?.id;
}

// ---------------------------------------------------------------------------
// Wire schema
// ---------------------------------------------------------------------------

export const secaoItemSchema = z.object({
  id: z.string(),
  campos: z.record(z.string(), z.string()),
});

export const secaoSchema = z.object({
  id: z.string(),
  tipo: z.string(),
  campos: z.record(z.string(), z.string()),
  itens: z.array(secaoItemSchema).optional(),
  /** Layout variant id from SECAO_BLOCKS[tipo].variantes; absent = first/default. */
  variante: z.string().optional(),
});
export type Secao = z.infer<typeof secaoSchema>;
export type SecaoItemData = z.infer<typeof secaoItemSchema>;

export const navItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  /** Anchor target: "topo", a secao.id, or "rodape". */
  secaoId: z.string(),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const headerConfigSchema = z.object({
  mostrarLogo: z.boolean(),
  logoUrl: z.string().nullable(),
  mostrarTitulo: z.boolean(),
  titulo: z.string(),
  navItems: z.array(navItemSchema),
});
export type HeaderConfig = z.infer<typeof headerConfigSchema>;

export const redeSocialSchema = z.object({
  id: z.string(),
  rede: z.string(),
  url: z.string(),
});
export type RedeSocial = z.infer<typeof redeSocialSchema>;

export const footerConfigSchema = z.object({
  texto: z.string(),
  endereco: z.string(),
  telefone: z.string(),
  email: z.string(),
  redesSociais: z.array(redeSocialSchema),
});
export type FooterConfig = z.infer<typeof footerConfigSchema>;

export const whatsappConfigSchema = z.object({
  ativo: z.boolean(),
  numero: z.string(),
  mensagem: z.string(),
});
export type WhatsappConfig = z.infer<typeof whatsappConfigSchema>;

export const gerarLandingPageSchema = z.object({
  modeloId: z.string(),
  corAcento: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  /** Per-page design overrides; absent/empty = the theme's own defaults. */
  design: designConfigSchema.optional(),
  header: headerConfigSchema,
  secoes: z.array(secaoSchema).min(1),
  footer: footerConfigSchema,
  whatsapp: whatsappConfigSchema,
});
export type GerarLandingPageInput = z.infer<typeof gerarLandingPageSchema>;

export const gerarLandingPageResultSchema = z.object({
  nomeArquivo: z.string(),
  tamanhoBytes: z.number().int().nonnegative(),
});
export type GerarLandingPageResult = z.infer<typeof gerarLandingPageResultSchema>;

export function novoNavItem(label: string, secaoId: string): NavItem {
  return { id: crypto.randomUUID(), label, secaoId };
}

export function defaultHeaderConfig(titulo: string): HeaderConfig {
  return { mostrarLogo: true, logoUrl: null, mostrarTitulo: true, titulo, navItems: [] };
}

export function defaultFooterConfig(): FooterConfig {
  return { texto: "Todos os direitos reservados.", endereco: "", telefone: "", email: "", redesSociais: [] };
}

export function defaultWhatsappConfig(): WhatsappConfig {
  return { ativo: false, numero: "", mensagem: "Olá! Vim pelo site." };
}
