-- Custom SQL migration file, put your code below! --

-- One "aprovação" (first 50%) parcela per existing orçamento, carrying over its
-- current faturado/imposto/retenção config and marking it paid if at least half
-- of `pago` had already landed.
INSERT INTO orcamento_parcelas (orcamento_id, tipo, valor, pago, pago_em, faturado, percentual_imposto_nf, percentual_retencao_cliente)
SELECT
  id,
  'aprovacao',
  ROUND(valor / 2, 2),
  pago >= ROUND(valor / 2, 2),
  CASE WHEN pago >= ROUND(valor / 2, 2) THEN updated_at ELSE NULL END,
  faturado,
  percentual_imposto_nf,
  percentual_retencao_cliente
FROM orcamentos;

-- One "entrega" (remaining 50%, complement of the rounded first half so the
-- two parcelas always sum exactly to `valor`) parcela per existing orçamento.
INSERT INTO orcamento_parcelas (orcamento_id, tipo, valor, pago, pago_em, faturado, percentual_imposto_nf, percentual_retencao_cliente)
SELECT
  id,
  'entrega',
  valor - ROUND(valor / 2, 2),
  pago >= valor,
  CASE WHEN pago >= valor THEN updated_at ELSE NULL END,
  faturado,
  percentual_imposto_nf,
  percentual_retencao_cliente
FROM orcamentos;
