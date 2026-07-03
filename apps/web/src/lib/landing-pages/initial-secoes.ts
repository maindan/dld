import {
  SECAO_BLOCKS,
  defaultCampos,
  defaultItem,
  defaultHeaderConfig,
  defaultFooterConfig,
  defaultWhatsappConfig,
  novoNavItem,
  type Secao,
  type HeaderConfig,
  type FooterConfig,
  type WhatsappConfig,
} from "@danlimadev/contracts";

/**
 * Seed content per landing page theme, shared between the server (createLandingPage,
 * lib/queries/landing-pages.ts) and the client (model picker grid thumbnails in
 * landing-pages-section.tsx). Zero heavy deps on purpose — only @danlimadev/contracts,
 * so this file is safe to import from a "use client" component.
 *
 * Each theme gets a *different* starter section set + plausible example copy, so a
 * fresh draft (or a thumbnail in the picker grid) already looks like a real page
 * instead of an empty shell.
 */

function criarSecao(tipo: string, campos: Record<string, string> = {}, itens?: Record<string, string>[]): Secao {
  return {
    id: crypto.randomUUID(),
    tipo,
    campos: { ...defaultCampos(tipo), ...campos },
    itens: itens?.map((overrides) => ({ id: crypto.randomUUID(), campos: { ...defaultItem(tipo), ...overrides } })),
  };
}

interface ModeloSeed {
  /** Header title used to seed defaultHeaderConfig(...) for a brand-new draft. */
  titulo: string;
  secoes: () => Secao[];
}

const SEEDS: Record<string, ModeloSeed> = {
  base: {
    titulo: "Minha Empresa",
    secoes: () => [
      criarSecao("hero", {
        titulo: "Sua marca em destaque",
        subtitulo: "Descreva em uma frase o problema que você resolve para o cliente.",
        cta: "Fale conosco",
      }),
      criarSecao("sobre", {
        titulo: "Sobre nós",
        texto: "Contamos aqui a história e a proposta de valor do seu negócio.",
      }),
      criarSecao("contato", {
        titulo: "Vamos conversar?",
        texto: "Entre em contato e receba uma resposta rápida.",
      }),
    ],
  },
  servicos: {
    titulo: "Clínica Vitalle",
    secoes: () => [
      criarSecao("hero", {
        titulo: "Cuidado que faz a diferença",
        subtitulo: "Atendimento humano e especializado para você viver melhor.",
        cta: "Agendar consulta",
      }),
      criarSecao(
        "servicos",
        { titulo: "Nossos serviços" },
        [{ titulo: "Consulta inicial", texto: "Avaliação completa para entender sua necessidade." }],
      ),
      criarSecao(
        "depoimentos",
        { titulo: "O que dizem nossos pacientes" },
        [{ nome: "Marina Souza", cargo: "Paciente", texto: "Atendimento excelente, me senti acolhida do início ao fim." }],
      ),
      criarSecao("contato", {
        titulo: "Marque seu horário",
        texto: "Fale com a nossa equipe e agende sua consulta.",
      }),
    ],
  },
  produto: {
    titulo: "NomeApp",
    secoes: () => [
      criarSecao("hero", {
        titulo: "O software que sua equipe vai amar usar",
        subtitulo: "Automatize processos e ganhe horas de produtividade por semana.",
        cta: "Testar grátis",
      }),
      criarSecao(
        "servicos",
        { titulo: "Recursos" },
        [{ titulo: "Automação inteligente", texto: "Fluxos que rodam sozinhos, sem esforço manual." }],
      ),
      criarSecao(
        "precos",
        { titulo: "Planos" },
        [{ nome: "Pro", preco: "R$ 99/mês", recursos: "Usuários ilimitados\nSuporte prioritário\nRelatórios avançados", destaque: "true" }],
      ),
      criarSecao(
        "faq",
        { titulo: "Perguntas frequentes" },
        [{ pergunta: "Preciso de cartão de crédito para testar?", resposta: "Não, o teste grátis de 14 dias não pede cartão." }],
      ),
    ],
  },
  evento: {
    titulo: "Evento 2026",
    secoes: () => [
      criarSecao("hero", {
        titulo: "O maior evento do ano chegou",
        subtitulo: "Três dias de conteúdo, networking e experiências inesquecíveis.",
        cta: "Garantir minha vaga",
      }),
      criarSecao(
        "agenda",
        { titulo: "Programação" },
        [{ horario: "09:00", titulo: "Abertura", descricao: "Recepção e boas-vindas." }],
      ),
      criarSecao("formulario", {
        titulo: "Garanta seu ingresso",
        subtitulo: "Preencha seus dados e receba as novidades em primeira mão.",
      }),
    ],
  },
  "portfolio-pessoal": {
    titulo: "Seu Nome",
    secoes: () => [
      criarSecao("hero", {
        titulo: "Olá, eu sou Seu Nome",
        subtitulo: "Designer e criador de experiências digitais memoráveis.",
        cta: "Ver trabalhos",
      }),
      criarSecao(
        "galeria",
        { titulo: "Trabalhos selecionados" },
        [{ titulo: "Identidade visual — Café Aurora", descricao: "Branding completo para uma cafeteria de bairro." }],
      ),
      criarSecao(
        "habilidades",
        { titulo: "Habilidades" },
        [{ nome: "UI Design", nivel: "90" }],
      ),
      criarSecao("contato", {
        titulo: "Vamos trabalhar juntos?",
        texto: "Estou disponível para novos projetos freelance.",
      }),
    ],
  },
  institucional: {
    titulo: "Institucional Ltda",
    secoes: () => [
      criarSecao("hero", {
        titulo: "Solidez e confiança para o seu negócio",
        subtitulo: "Mais de uma década entregando resultados para nossos clientes.",
        cta: "Conheça nossa empresa",
      }),
      criarSecao("sobre", {
        titulo: "Quem somos",
        texto: "Uma empresa comprometida com excelência, ética e resultado.",
      }),
      criarSecao(
        "diferenciais",
        { titulo: "Por que nos escolher" },
        [{ titulo: "Equipe especializada", texto: "Profissionais certificados e em constante atualização." }],
      ),
      criarSecao(
        "equipe",
        { titulo: "Nossa equipe" },
        [{ nome: "Carlos Mendes", cargo: "Diretor executivo" }],
      ),
      criarSecao("contato", {
        titulo: "Fale com a gente",
        texto: "Nossa equipe está pronta para atender sua empresa.",
      }),
    ],
  },
};

export function initialSecoesForModelo(modeloId: string): Secao[] {
  return (SEEDS[modeloId] ?? SEEDS.base).secoes();
}

export interface InitialLandingPageState {
  corAcento: string;
  header: HeaderConfig;
  secoes: Secao[];
  footer: FooterConfig;
  whatsapp: WhatsappConfig;
}

/** Full seed state for a brand-new draft (or a model-picker thumbnail): sections with
 * plausible example copy for the theme, a header whose nav already links to each
 * section, a default footer, and WhatsApp off by default. */
export function buildInitialLandingPageState(modeloId: string, corAcento: string): InitialLandingPageState {
  const seed = SEEDS[modeloId] ?? SEEDS.base;
  const secoes = seed.secoes();
  const header = defaultHeaderConfig(seed.titulo);
  header.navItems = secoes.map((s) => novoNavItem(SECAO_BLOCKS[s.tipo]?.nome ?? s.tipo, s.id));

  return {
    corAcento,
    header,
    secoes,
    footer: defaultFooterConfig(),
    whatsapp: defaultWhatsappConfig(),
  };
}
