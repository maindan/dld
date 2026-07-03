import { z } from "zod";

/**
 * Boundary contract between apps/web (editor UI) and services/landing-generator
 * (Next.js project scaffolder). Neither side should reach past this shape.
 * Zero heavy deps here on purpose — this file is imported by a "use client"
 * component (the editor), so anything added must stay bundler-safe for the browser.
 */

// ---------------------------------------------------------------------------
// Section block registry — the "Elementor-like" catalog of section types. The
// editor renders its generic add/edit UI purely from this data (field labels,
// input kind, whether the block supports a repeatable list of items) instead
// of hardcoding a form per section type.
// ---------------------------------------------------------------------------

export const CAMPO_TIPOS = ["texto", "textarea", "booleano"] as const;
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

export interface SecaoBlockDef {
  tipo: string;
  nome: string;
  desc: string;
  campos: CampoDef[];
  /** Present only for blocks that render a repeatable list (cards, rows, etc). */
  itens?: ItensDef;
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
    ],
  },
  sobre: {
    tipo: "sobre",
    nome: "Sobre",
    desc: "Bloco de texto livre (quem somos, proposta de valor)",
    campos: [
      { key: "titulo", label: "Título", tipo: "texto" },
      { key: "texto", label: "Texto", tipo: "textarea" },
    ],
  },
  servicos: {
    tipo: "servicos",
    nome: "Serviços",
    desc: "Grade de cards com os serviços oferecidos",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Serviço",
      min: 1,
      max: 8,
      campos: [
        { key: "titulo", label: "Título", tipo: "texto" },
        { key: "texto", label: "Descrição", tipo: "textarea" },
      ],
    },
  },
  diferenciais: {
    tipo: "diferenciais",
    nome: "Diferenciais",
    desc: "Grade de cards destacando pontos fortes",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
    itens: {
      label: "Diferencial",
      min: 1,
      max: 8,
      campos: [
        { key: "titulo", label: "Título", tipo: "texto" },
        { key: "texto", label: "Descrição", tipo: "textarea" },
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
      max: 6,
      campos: [
        { key: "nome", label: "Nome", tipo: "texto" },
        { key: "cargo", label: "Cargo/empresa", tipo: "texto" },
        { key: "texto", label: "Depoimento", tipo: "textarea" },
      ],
    },
  },
  precos: {
    tipo: "precos",
    nome: "Preços",
    desc: "Tabela de planos",
    campos: [{ key: "titulo", label: "Título da seção", tipo: "texto" }],
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
      ],
    },
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
