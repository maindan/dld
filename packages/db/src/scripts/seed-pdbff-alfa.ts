import { readFileSync } from "node:fs";
import {
  db,
  clientes,
  freelas,
  orcamentos,
  orcamentoItens,
  orcamentoParcelas,
  contratos,
} from "../index";
import { eq } from "drizzle-orm";

/**
 * One-off backfill: registers the ALFA/PDBFF engagement (contrato assinado em
 * 17/12/2025 + 3 orçamentos, todos aprovados/faturados/pagos, todas as demandas
 * concluídas) that predates this system. Idempotent by name — safe to re-run.
 *
 * Usage: pnpm --filter @danlimadev/db exec tsx --env-file=.env --env-file=../../apps/web/.env.local src/scripts/seed-pdbff-alfa.ts <path-to-contrato.pdf>
 */

function generateChave(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase().replace(/(.{8})(.{8})/, "$1-$2");
}

async function uploadContrato(path: string): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY not set");

  const bytes = readFileSync(path);
  const objectPath = `contratos/${crypto.randomUUID()}.pdf`;
  const res = await fetch(`${supabaseUrl}/storage/v1/object/uploads/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/pdf",
    },
    body: bytes,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.status} ${await res.text()}`);
  return `${supabaseUrl}/storage/v1/object/public/uploads/${objectPath}`;
}

interface ItemSeed {
  desc: string;
  valor: number;
}

interface OrcamentoSeed {
  titulo: string;
  valor: number;
  data: string;
  itens: ItemSeed[];
}

const ORCAMENTOS: OrcamentoSeed[] = [
  {
    titulo: "Site Institucional PDBFF + Sistema ALFA",
    valor: 7716,
    data: "2025-12-17",
    itens: [
      {
        desc: "Site Institucional PDBFF — protótipo (desktop/mobile), atualização visual, redes sociais, blog e login com redirecionamento para o ALFA",
        valor: 3000,
      },
      {
        desc: "Sistema ALFA — protótipo do frontend, correções de bugs, refatoração e sistema de blog com painel administrativo",
        valor: 4716,
      },
      {
        desc: "Outros — ajustes de domínio, DNS, hospedagem e suporte na criação de conta de financiamento coletivo",
        valor: 0,
      },
    ],
  },
  {
    titulo: "Site Institucional ALFA (orçamento complementar)",
    valor: 6300,
    data: "2026-02-04",
    itens: [
      {
        desc: "Site Institucional ALFA — protótipo, criação do site institucional, páginas estruturadas e formulário de login com exibição dinâmica de módulos para usuários autenticados",
        valor: 6300,
      },
      { desc: "Outros — alterações de domínio, criação de subdomínios e ajustes de hospedagem", valor: 0 },
    ],
  },
  {
    titulo: "Ajustes Sistema ALFA + Novas Páginas PDBFF (orçamento complementar)",
    valor: 2100,
    data: "2026-04-10",
    itens: [
      { desc: "Relatório geral por período (entradas e saídas de linhas de orçamento ativas)", valor: 0 },
      { desc: "Ajustes na exportação de relatórios de débitos e créditos para Excel", valor: 0 },
      { desc: "Ajustes na tabela e formulário de pessoas — inclusão de imagem, e-mail e telefone", valor: 0 },
      { desc: "Remoção de agendamento de entrada de campo e verificação de permissões de alteração", valor: 0 },
      { desc: "Reformulação da calculadora de custos de campo — seleção por data, fins de semana e feriados", valor: 0 },
      { desc: "Página de contato do site PDBFF, com formulário direto por e-mail", valor: 0 },
      { desc: "Página de transparência — contabilidade e prestação de contas", valor: 0 },
      { desc: "Páginas informativas de linhas de pesquisa e projetos ativos", valor: 2100 },
    ],
  },
];

async function main() {
  const contratoPdfPath = process.argv[2];
  if (!contratoPdfPath) throw new Error("usage: seed-pdbff-alfa.ts <path-to-contrato.pdf>");

  const clienteNome = "Associação de Levantamento Florestal do Amazonas (ALFA)";
  let [cliente] = await db.select().from(clientes).where(eq(clientes.nome, clienteNome));
  if (!cliente) {
    [cliente] = await db
      .insert(clientes)
      .values({
        nome: clienteNome,
        email: "pdbff.alfa@gmail.com",
        whatsapp: "",
        empresa: "PDBFF / ALFA",
        observacoes:
          "CNPJ 14.232.672/0001-37 · Site institucional: https://pdbff.org.br/ · Sistema: https://alfa-pdbff.site/ · Representante legal: Ana Cristina Segalin de Andrade.",
      })
      .returning();
    console.log(`cliente criado: ${cliente!.nome} (${cliente!.id})`);
  } else {
    console.log(`cliente já existia: ${cliente.nome} (${cliente.id})`);
  }

  const freelaNome = "PDBFF — Site institucional + Sistema ALFA";
  let [freela] = await db.select().from(freelas).where(eq(freelas.nome, freelaNome));
  if (!freela) {
    [freela] = await db
      .insert(freelas)
      .values({
        nome: freelaNome,
        tipo: "Desenvolvimento e manutenção de site e sistema web",
        cor: "#34d399",
        clienteId: cliente!.id,
        chaveCrono: generateChave(),
        resumo:
          "Reestruturação visual e desenvolvimento do site institucional PDBFF e do sistema ALFA (gestão financeira/administrativa), incluindo blog integrado, criação do site institucional da ALFA, ajustes de relatórios e novas páginas do site PDBFF. Contrato assinado em 17/12/2025 via Clicksign. Os 3 orçamentos foram aprovados, faturados e pagos integralmente; todas as demandas foram concluídas.",
      })
      .returning();
    console.log(`freela criado: ${freela!.nome} (${freela!.id})`);
  } else {
    console.log(`freela já existia: ${freela.nome} (${freela.id})`);
  }

  const contratoTitulo = "Contrato de Prestação de Serviços — ALFA/PDBFF";
  const [contratoExistente] = await db.select().from(contratos).where(eq(contratos.titulo, contratoTitulo));
  if (!contratoExistente) {
    const arquivoPath = await uploadContrato(contratoPdfPath);
    await db.insert(contratos).values({
      freelaId: freela!.id,
      titulo: contratoTitulo,
      tipo: "Prestação de serviços (assinado via Clicksign)",
      status: "assinado",
      modo: "anexo",
      modeloTipo: null,
      data: "2025-12-17",
      arquivoPath,
    });
    console.log(`contrato anexado: ${arquivoPath}`);
  } else {
    console.log(`contrato já existia: ${contratoExistente.id}`);
  }

  for (const seed of ORCAMENTOS) {
    const [existente] = await db
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.titulo, seed.titulo));
    if (existente) {
      console.log(`orçamento já existia: ${seed.titulo}`);
      continue;
    }

    const [orcamento] = await db
      .insert(orcamentos)
      .values({
        freelaId: freela!.id,
        titulo: seed.titulo,
        status: "pago_total",
        chave: generateChave(),
        valor: String(seed.valor),
        pago: String(seed.valor),
        data: seed.data,
        prazoExec: "",
        aprovadoEm: new Date(`${seed.data}T12:00:00Z`),
      })
      .returning();

    // Both parcelas (50% aprovação + 50% entrega) are already fully paid and
    // faturadas — this engagement predates the app and was settled long ago.
    const metade = Math.round((seed.valor / 2) * 100) / 100;
    await db.insert(orcamentoParcelas).values([
      {
        orcamentoId: orcamento!.id,
        tipo: "aprovacao",
        valor: String(metade),
        pago: true,
        pagoEm: new Date(`${seed.data}T12:00:00Z`),
        faturado: true,
        percentualImpostoNf: "5",
        percentualRetencaoCliente: "11",
      },
      {
        orcamentoId: orcamento!.id,
        tipo: "entrega",
        valor: String(seed.valor - metade),
        pago: true,
        pagoEm: new Date(`${seed.data}T12:00:00Z`),
        faturado: true,
        percentualImpostoNf: "5",
        percentualRetencaoCliente: "11",
      },
    ]);

    await db.insert(orcamentoItens).values(
      seed.itens.map((it, idx) => ({
        orcamentoId: orcamento!.id,
        desc: it.desc,
        tempo: "",
        valor: String(it.valor),
        prazo: null,
        done: true,
        ordem: idx,
      }))
    );
    console.log(`orçamento criado: ${seed.titulo} — R$ ${seed.valor}`);
  }

  console.log("done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
