import { z } from "zod";

/**
 * Payload for the unauthenticated public approval endpoint (/orcamento/[token]).
 * The client hits this with no session; the token itself is the authorization.
 */
export const aprovarOrcamentoSchema = z.object({
  token: z.string().min(1),
});
export type AprovarOrcamentoInput = z.infer<typeof aprovarOrcamentoSchema>;

export const confirmarPagamentoSchema = z.object({
  orcamentoId: z.string().uuid(),
});
export type ConfirmarPagamentoInput = z.infer<typeof confirmarPagamentoSchema>;
