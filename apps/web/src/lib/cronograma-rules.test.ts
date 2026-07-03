import { describe, expect, it } from "vitest";
import { orcamentoLiberaCronograma, STATUS_ORCAMENTO_LIBERA_CRONOGRAMA } from "./cronograma-rules";

describe("orcamentoLiberaCronograma", () => {
  it("bloqueia orçamentos que ainda não foram pagos", () => {
    expect(orcamentoLiberaCronograma("rascunho")).toBe(false);
    expect(orcamentoLiberaCronograma("enviado")).toBe(false);
    expect(orcamentoLiberaCronograma("aprovado")).toBe(false);
    expect(orcamentoLiberaCronograma("recusado")).toBe(false);
  });

  it("libera orçamentos pagos, parcial ou totalmente", () => {
    expect(orcamentoLiberaCronograma("pago_parcial")).toBe(true);
    expect(orcamentoLiberaCronograma("pago_total")).toBe(true);
  });

  it("expõe exatamente os dois status de pagamento como fonte de verdade", () => {
    expect(STATUS_ORCAMENTO_LIBERA_CRONOGRAMA).toEqual(["pago_parcial", "pago_total"]);
  });
});
