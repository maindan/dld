/**
 * Um orçamento só libera suas atividades no cronograma público depois que o
 * pagamento (parcial ou total) foi confirmado — aprovado sozinho não basta.
 * Ver App.dc.html:1653-1658 e 1473 ("orçamentos aprovados e pagos").
 */
export const STATUS_ORCAMENTO_LIBERA_CRONOGRAMA = ["pago_parcial", "pago_total"] as const;

export function orcamentoLiberaCronograma(status: string): boolean {
  return (STATUS_ORCAMENTO_LIBERA_CRONOGRAMA as readonly string[]).includes(status);
}
