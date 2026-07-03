import { db, freelas, clientes, orcamentos, orcamentoItens } from "@danlimadev/db";
import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { isLate } from "@/lib/format";

/**
 * List-view summary for the /freelas screen. Lives in its own file (rather than
 * lib/queries/freelas.ts) because that file is owned by the detail-page rebuild
 * happening in parallel — this keeps the two workstreams from touching the same file.
 */
export interface FreelaCardView {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  inicial: string;
  clienteNome: string;
  recebido: number;
  aReceber: number;
  orcamentosAbertos: number;
  proxima: string | null;
  proxPrazo: string | null;
  proxAtrasado: boolean;
}

export interface FreelasListSummary {
  freelas: FreelaCardView[];
  recebidoTotal: number;
  aReceberTotal: number;
}

const STATUS_ATIVOS = ["enviado", "aprovado", "pago_parcial", "pago_total"] as const;

export async function getFreelasListView(): Promise<FreelasListSummary> {
  const [freelasList, todosOrcamentos] = await Promise.all([
    db
      .select({
        id: freelas.id,
        nome: freelas.nome,
        tipo: freelas.tipo,
        cor: freelas.cor,
        createdAt: freelas.createdAt,
        clienteNome: clientes.nome,
      })
      .from(freelas)
      .innerJoin(clientes, eq(freelas.clienteId, clientes.id))
      .orderBy(desc(freelas.createdAt)),
    db.select().from(orcamentos),
  ]);

  const orcamentoIds = todosOrcamentos.map((o) => o.id);
  const itensPendentes = orcamentoIds.length
    ? await db
        .select()
        .from(orcamentoItens)
        .where(
          and(
            inArray(orcamentoItens.orcamentoId, orcamentoIds),
            eq(orcamentoItens.done, false),
            isNotNull(orcamentoItens.prazo),
          ),
        )
        .orderBy(asc(orcamentoItens.prazo))
    : [];

  const orcamentoById = new Map(todosOrcamentos.map((o) => [o.id, o]));

  const orcamentosPorFreela = new Map<string, typeof todosOrcamentos>();
  for (const o of todosOrcamentos) {
    const list = orcamentosPorFreela.get(o.freelaId) ?? [];
    list.push(o);
    orcamentosPorFreela.set(o.freelaId, list);
  }

  const proximoItemPorFreela = new Map<string, (typeof itensPendentes)[number]>();
  for (const item of itensPendentes) {
    const orcamento = orcamentoById.get(item.orcamentoId);
    if (!orcamento) continue;
    if (!proximoItemPorFreela.has(orcamento.freelaId)) {
      proximoItemPorFreela.set(orcamento.freelaId, item);
    }
  }

  let recebidoTotal = 0;
  let aReceberTotal = 0;

  const freelasView: FreelaCardView[] = freelasList.map((f) => {
    const seus = orcamentosPorFreela.get(f.id) ?? [];
    const ativos = seus.filter((o) => (STATUS_ATIVOS as readonly string[]).includes(o.status));
    const recebido = ativos.reduce((acc, o) => acc + Number(o.pago), 0);
    const aReceber = ativos.reduce((acc, o) => acc + Math.max(0, Number(o.valor) - Number(o.pago)), 0);
    recebidoTotal += recebido;
    aReceberTotal += aReceber;

    const proximo = proximoItemPorFreela.get(f.id) ?? null;
    const inicial = f.nome.trim().charAt(0).toUpperCase() || "?";

    return {
      id: f.id,
      nome: f.nome,
      tipo: f.tipo,
      cor: f.cor,
      inicial,
      clienteNome: f.clienteNome,
      recebido,
      aReceber,
      orcamentosAbertos: ativos.length,
      proxima: proximo?.desc ?? null,
      proxPrazo: proximo?.prazo ?? null,
      proxAtrasado: proximo ? isLate(proximo.prazo) : false,
    };
  });

  return { freelas: freelasView, recebidoTotal, aReceberTotal };
}
