/**
 * Zero-dependency module: shared between server (lib/queries/freelas.ts) and the
 * "use client" freela-detail component. Must never import @danlimadev/db — Next.js
 * bundles whatever a client component imports, and pulling in drizzle/postgres here
 * breaks the browser build (needs Node's net/tls/perf_hooks).
 */
export type ContratoModo = "modelo" | "anexo";
export type ContratoModeloTipo = "prestacao" | "confidencialidade" | "manutencao";

/** Human labels for the predefined contract templates, keyed by `contratoModeloEnum`. */
export const CONTRATO_MODELOS: Record<ContratoModeloTipo, string> = {
  prestacao: "Prestação de serviços",
  confidencialidade: "Confidencialidade",
  manutencao: "Manutenção mensal",
};
