import {
  db,
  freelas,
  clientes,
  orcamentos,
  orcamentoItens,
  orcamentoParcelas,
  observacoes,
  reunioes,
  contratos,
} from "@danlimadev/db";
import { desc, eq, inArray } from "drizzle-orm";
import { generateChave } from "@/lib/format";
import { CONTRATO_MODELOS, type ContratoModo, type ContratoModeloTipo } from "@/lib/contrato-modelos";

export { CONTRATO_MODELOS, type ContratoModo, type ContratoModeloTipo };

export interface FreelaListItem {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  clienteId: string;
  clienteNome: string;
  orcamentosAbertos: number;
  aReceber: number;
}

export async function getFreelasList(): Promise<FreelaListItem[]> {
  const [freelasList, todosOrcamentos] = await Promise.all([
    db
      .select({ freela: freelas, cliente: clientes })
      .from(freelas)
      .innerJoin(clientes, eq(freelas.clienteId, clientes.id))
      .orderBy(desc(freelas.createdAt)),
    db.select().from(orcamentos),
  ]);

  const porFreela = new Map<string, typeof todosOrcamentos>();
  for (const o of todosOrcamentos) {
    const list = porFreela.get(o.freelaId) ?? [];
    list.push(o);
    porFreela.set(o.freelaId, list);
  }

  return freelasList.map(({ freela: f, cliente: c }) => {
    const seus = porFreela.get(f.id) ?? [];
    const abertos = seus.filter((o) => o.status !== "recusado" && o.status !== "rascunho");
    return {
      id: f.id,
      nome: f.nome,
      tipo: f.tipo,
      cor: f.cor,
      clienteId: c.id,
      clienteNome: c.nome,
      orcamentosAbertos: abertos.length,
      aReceber: abertos.reduce((acc, o) => acc + Math.max(0, Number(o.valor) - Number(o.pago)), 0),
    };
  });
}

export async function createFreela(input: {
  nome: string;
  tipo: string;
  cor: string;
  clienteId: string;
  resumo: string;
}) {
  const [freela] = await db
    .insert(freelas)
    .values({ ...input, chaveCrono: generateChave() })
    .returning();
  return freela;
}

export async function updateFreelaResumo(id: string, resumo: string) {
  await db.update(freelas).set({ resumo, updatedAt: new Date() }).where(eq(freelas.id, id));
}

export interface OrcamentoItemView {
  id: string;
  desc: string;
  tempo: string;
  valor: number;
  /** Optional URL shown next to the item title on the public orçamento document. */
  link: string | null;
  /** Sub-bullets describing the scope of this item on the public orçamento document. */
  bullets: string[];
  prazo: string | null;
  done: boolean;
  ordem: number;
}

export type ParcelaTipo = "aprovacao" | "entrega";

export interface ParcelaView {
  id: string;
  tipo: ParcelaTipo;
  valor: number;
  pago: boolean;
  pagoEm: Date | null;
  /** Whether the NF (nota fiscal) for this specific parcela has already been emitted. */
  faturado: boolean;
  /** % paid by the CONTRATADO on this parcela's NF emission. */
  percentualImpostoNf: number;
  /** % the client withholds from this parcela's NF value on payment. */
  percentualRetencaoCliente: number;
  /** `valor` net of both tax percentages. */
  valorLiquido: number;
}

export interface OrcamentoView {
  id: string;
  numero: number;
  titulo: string;
  status: string;
  chave: string;
  valor: number;
  pago: number;
  /** Sempre 2: aprovação (50%) e entrega (50%), nessa ordem — cada uma com seu próprio imposto/retenção, porque são NFs emitidas em datas (e possivelmente alíquotas) diferentes. */
  parcelas: ParcelaView[];
  /** Sum of `valorLiquido` across both parcelas — o que fica na conta se as duas forem pagas nos percentuais configurados hoje. */
  valorLiquido: number;
  /** Sum of `valorLiquido` across only the PAID parcelas — o que de fato já caiu na conta. */
  pagoLiquido: number;
  data: string;
  prazoExec: string;
  /** Standard terms paragraph shown on the public /orc/[chave] page. */
  termos: string;
  itens: OrcamentoItemView[];
}

/** valor * (1 - (impostoNf + retencaoCliente) / 100), floored at 0. */
function calcularLiquido(valor: number, percentualImpostoNf: number, percentualRetencaoCliente: number): number {
  const fator = 1 - (percentualImpostoNf + percentualRetencaoCliente) / 100;
  return Math.max(0, valor * fator);
}

function parcelaToView(p: typeof orcamentoParcelas.$inferSelect): ParcelaView {
  const percentualImpostoNf = Number(p.percentualImpostoNf);
  const percentualRetencaoCliente = Number(p.percentualRetencaoCliente);
  const valor = Number(p.valor);
  return {
    id: p.id,
    tipo: p.tipo,
    valor,
    pago: p.pago,
    pagoEm: p.pagoEm,
    faturado: p.faturado,
    percentualImpostoNf,
    percentualRetencaoCliente,
    valorLiquido: calcularLiquido(valor, percentualImpostoNf, percentualRetencaoCliente),
  };
}

export interface FreelaDetail {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  clienteId: string;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp: string;
  clienteEmpresa: string;
  chaveCrono: string;
  resumo: string;
  orcamentos: OrcamentoView[];
  observacoes: { id: string; data: string; texto: string }[];
  reunioes: { id: string; titulo: string; data: string; topicos: string[] }[];
  contratos: {
    id: string;
    titulo: string;
    tipo: string;
    status: string;
    data: string;
    modo: ContratoModo;
    modeloTipo: ContratoModeloTipo | null;
    arquivoPath: string | null;
  }[];
  /** Sum of `valor` across every orçamento that hasn't been recusado. */
  totalValor: number;
  /** Sum of `pago` across every orçamento that hasn't been recusado. */
  totalPago: number;
  /** `totalValor - totalPago`, floored at 0. */
  totalAReceber: number;
  /** Sum of `pagoLiquido` across every orçamento that hasn't been recusado — o que de fato cai na conta. */
  totalPagoLiquido: number;
  /** `totalPago - totalPagoLiquido` — quanto do que já entrou foi retido em imposto/retenção. */
  totalImposto: number;
}

export async function getFreelaDetail(id: string): Promise<FreelaDetail | null> {
  const [row] = await db
    .select({ freela: freelas, cliente: clientes })
    .from(freelas)
    .innerJoin(clientes, eq(freelas.clienteId, clientes.id))
    .where(eq(freelas.id, id));
  if (!row) return null;
  const { freela, cliente } = row;

  const orcamentosList = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.freelaId, id))
    .orderBy(desc(orcamentos.numero));

  const orcamentoIds = orcamentosList.map((o) => o.id);
  const [itens, parcelas] = await Promise.all([
    orcamentoIds.length
      ? db.select().from(orcamentoItens).where(inArray(orcamentoItens.orcamentoId, orcamentoIds))
      : Promise.resolve([]),
    orcamentoIds.length
      ? db.select().from(orcamentoParcelas).where(inArray(orcamentoParcelas.orcamentoId, orcamentoIds))
      : Promise.resolve([]),
  ]);

  const parcelasPorOrcamento = new Map<string, ParcelaView[]>();
  for (const p of parcelas) {
    const list = parcelasPorOrcamento.get(p.orcamentoId) ?? [];
    list.push(parcelaToView(p));
    parcelasPorOrcamento.set(p.orcamentoId, list);
  }
  const ORDEM_TIPO: Record<ParcelaTipo, number> = { aprovacao: 0, entrega: 1 };
  for (const list of parcelasPorOrcamento.values()) list.sort((a, b) => ORDEM_TIPO[a.tipo] - ORDEM_TIPO[b.tipo]);

  const itensPorOrcamento = new Map<string, OrcamentoItemView[]>();
  for (const it of itens) {
    const list = itensPorOrcamento.get(it.orcamentoId) ?? [];
    list.push({
      id: it.id,
      desc: it.desc,
      tempo: it.tempo,
      valor: Number(it.valor),
      link: it.link,
      bullets: it.bullets,
      prazo: it.prazo,
      done: it.done,
      ordem: it.ordem,
    });
    itensPorOrcamento.set(it.orcamentoId, list);
  }
  for (const list of itensPorOrcamento.values()) list.sort((a, b) => a.ordem - b.ordem);

  const [observacoesList, reunioesList, contratosList] = await Promise.all([
    db.select().from(observacoes).where(eq(observacoes.freelaId, id)).orderBy(desc(observacoes.data)),
    db.select().from(reunioes).where(eq(reunioes.freelaId, id)).orderBy(desc(reunioes.data)),
    db.select().from(contratos).where(eq(contratos.freelaId, id)).orderBy(desc(contratos.data)),
  ]);

  const orcamentosView: OrcamentoView[] = orcamentosList.map((o) => {
    const parcelasView = parcelasPorOrcamento.get(o.id) ?? [];
    const valorLiquido = parcelasView.reduce((acc, p) => acc + p.valorLiquido, 0);
    const pagoLiquido = parcelasView.filter((p) => p.pago).reduce((acc, p) => acc + p.valorLiquido, 0);
    return {
      id: o.id,
      numero: o.numero,
      titulo: o.titulo,
      status: o.status,
      chave: o.chave,
      valor: Number(o.valor),
      pago: Number(o.pago),
      parcelas: parcelasView,
      valorLiquido,
      pagoLiquido,
      data: o.data,
      prazoExec: o.prazoExec,
      termos: o.termos,
      itens: itensPorOrcamento.get(o.id) ?? [],
    };
  });

  const relevantes = orcamentosView.filter((o) => o.status !== "recusado");
  const totalValor = relevantes.reduce((acc, o) => acc + o.valor, 0);
  const totalPago = relevantes.reduce((acc, o) => acc + o.pago, 0);
  const totalAReceber = Math.max(0, totalValor - totalPago);
  const totalPagoLiquido = relevantes.reduce((acc, o) => acc + o.pagoLiquido, 0);
  const totalImposto = Math.max(0, totalPago - totalPagoLiquido);

  return {
    id: freela.id,
    nome: freela.nome,
    tipo: freela.tipo,
    cor: freela.cor,
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    clienteEmail: cliente.email,
    clienteWhatsapp: cliente.whatsapp,
    clienteEmpresa: cliente.empresa,
    chaveCrono: freela.chaveCrono,
    resumo: freela.resumo,
    orcamentos: orcamentosView,
    observacoes: observacoesList.map((o) => ({ id: o.id, data: o.data, texto: o.texto })),
    reunioes: reunioesList.map((r) => ({ id: r.id, titulo: r.titulo, data: r.data, topicos: r.topicos })),
    contratos: contratosList.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      tipo: c.tipo,
      status: c.status,
      data: c.data,
      modo: c.modo,
      modeloTipo: c.modeloTipo,
      arquivoPath: c.arquivoPath,
    })),
    totalValor,
    totalPago,
    totalAReceber,
    totalPagoLiquido,
    totalImposto,
  };
}

export async function createOrcamento(input: {
  freelaId: string;
  titulo: string;
  valor: number;
  data: string;
  prazoExec: string;
  termos?: string;
  /** Activities created together with the orçamento (new flow: itens são somados no total antes de salvar). */
  itens?: { desc: string; tempo: string; valor: number; link?: string | null; bullets?: string[]; prazo?: string | null }[];
}) {
  const [orcamento] = await db
    .insert(orcamentos)
    .values({
      freelaId: input.freelaId,
      titulo: input.titulo,
      valor: String(input.valor),
      data: input.data,
      prazoExec: input.prazoExec,
      chave: generateChave(),
      ...(input.termos !== undefined ? { termos: input.termos } : {}),
    })
    .returning();

  if (orcamento) {
    // Every orçamento is always billed in exactly 2 parcelas — 50% na aprovação,
    // 50% na entrega — each starting with the default imposto/retenção rates,
    // editable independently later since each is invoiced (and taxed) on its own.
    const metade = Math.round((input.valor / 2) * 100) / 100;
    await db.insert(orcamentoParcelas).values([
      { orcamentoId: orcamento.id, tipo: "aprovacao", valor: String(metade) },
      { orcamentoId: orcamento.id, tipo: "entrega", valor: String(input.valor - metade) },
    ]);
  }

  if (orcamento && input.itens?.length) {
    await db.insert(orcamentoItens).values(
      input.itens.map((it, idx) => ({
        orcamentoId: orcamento.id,
        desc: it.desc,
        tempo: it.tempo,
        valor: String(it.valor),
        link: it.link ?? null,
        bullets: it.bullets ?? [],
        prazo: it.prazo ?? null,
        ordem: idx,
      }))
    );
  }

  return orcamento;
}

export async function enviarOrcamento(id: string) {
  await db.update(orcamentos).set({ status: "enviado", updatedAt: new Date() }).where(eq(orcamentos.id, id));
}

/** Marks one specific parcela (aprovação or entrega) as paid, then recomputes the
 * parent orçamento's cumulative `pago`/`status` from the two parcelas' own state —
 * never a raw increment, since each parcela's valor is fixed at creation. */
export async function registrarParcelaPagamento(parcelaId: string) {
  const [parcela] = await db.select().from(orcamentoParcelas).where(eq(orcamentoParcelas.id, parcelaId));
  if (!parcela || parcela.pago) return null;

  await db
    .update(orcamentoParcelas)
    .set({ pago: true, pagoEm: new Date() })
    .where(eq(orcamentoParcelas.id, parcelaId));

  const todasParcelas = await db
    .select()
    .from(orcamentoParcelas)
    .where(eq(orcamentoParcelas.orcamentoId, parcela.orcamentoId));
  const pagoTotal = todasParcelas.reduce((acc, p) => acc + (p.id === parcelaId || p.pago ? Number(p.valor) : 0), 0);
  const todasPagas = todasParcelas.every((p) => p.id === parcelaId || p.pago);
  const status = todasPagas ? "pago_total" : "pago_parcial";

  const [orcamento] = await db
    .update(orcamentos)
    .set({ pago: String(pagoTotal), status, updatedAt: new Date() })
    .where(eq(orcamentos.id, parcela.orcamentoId))
    .returning();
  if (!orcamento) return null;

  const [freela] = await db.select().from(freelas).where(eq(freelas.id, orcamento.freelaId));
  return { chave: orcamento.chave, chaveCrono: freela?.chaveCrono ?? null };
}

export async function updateParcelaImpostos(
  parcelaId: string,
  input: { faturado: boolean; percentualImpostoNf: number; percentualRetencaoCliente: number },
) {
  await db
    .update(orcamentoParcelas)
    .set({
      faturado: input.faturado,
      percentualImpostoNf: String(input.percentualImpostoNf),
      percentualRetencaoCliente: String(input.percentualRetencaoCliente),
    })
    .where(eq(orcamentoParcelas.id, parcelaId));
}

export async function createOrcamentoItem(input: {
  orcamentoId: string;
  desc: string;
  tempo: string;
  valor: number;
  link?: string | null;
  bullets?: string[];
  prazo: string | null;
  ordem: number;
}) {
  await db.insert(orcamentoItens).values({
    ...input,
    valor: String(input.valor),
    link: input.link ?? null,
    bullets: input.bullets ?? [],
  });
}

export async function updateOrcamentoTermos(id: string, termos: string) {
  await db.update(orcamentos).set({ termos, updatedAt: new Date() }).where(eq(orcamentos.id, id));
}

export async function deleteOrcamentoItem(id: string) {
  await db.delete(orcamentoItens).where(eq(orcamentoItens.id, id));
}

export async function createObservacao(input: { freelaId: string; texto: string; data: string }) {
  await db.insert(observacoes).values(input);
}

export async function createReuniao(input: {
  freelaId: string;
  titulo: string;
  data: string;
  topicos: string[];
}) {
  await db.insert(reunioes).values(input);
}

export async function createContrato(input: {
  freelaId: string;
  titulo: string;
  tipo: string;
  data: string;
  modo?: ContratoModo;
  modeloTipo?: ContratoModeloTipo | null;
  arquivoPath?: string | null;
}) {
  await db.insert(contratos).values({
    freelaId: input.freelaId,
    titulo: input.titulo,
    tipo: input.tipo,
    data: input.data,
    modo: input.modo ?? "modelo",
    modeloTipo: input.modeloTipo ?? null,
    arquivoPath: input.arquivoPath ?? null,
  });
}

export async function setContratoStatus(id: string, status: "pendente" | "assinado") {
  await db.update(contratos).set({ status }).where(eq(contratos.id, id));
}
