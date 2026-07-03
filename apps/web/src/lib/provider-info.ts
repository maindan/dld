/**
 * This app is single-tenant ("acesso restrito · sem registro de novos
 * usuários") — the contracting party is always Daniel, so this is a plain
 * constant rather than a settings table. Shown on the public /orc/[chave]
 * document header, matching the format of the orçamentos issued outside
 * the app (see C:\Users\danie\OneDrive\Documentos\freelas\PDBFF\docs).
 */
export const PROVIDER_INFO = {
  nome: "Daniel da Silva Lima",
  email: "danlimadev@gmail.com",
  telefone: "(92) 98633-7371",
  cidade: "Manaus",
};
