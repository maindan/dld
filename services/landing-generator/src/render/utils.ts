import type { Secao, SecaoItemData } from "@danlimadev/contracts";

/**
 * JSON.stringify a value so it can be dropped into a `{...}` JSX expression
 * slot, e.g. `<h1>{jsExpr(titulo)}</h1>` becomes `<h1>{"user text"}</h1>` in
 * the generated source. This is what keeps arbitrary user copy — quotes,
 * `{`, `<`, accents, newlines, backticks — from ever being parsed as
 * TSX/HTML: it's always just a JS string literal that React renders as text.
 * Never interpolate user-provided strings directly into generated source;
 * always route them through this.
 */
export function jsExpr(value: unknown): string {
  return JSON.stringify(value);
}

/** Reads `secao.campos[chave]`, falling back to `padrao` when blank/missing. */
export function campo(secao: Secao, chave: string, padrao = ""): string {
  const valor = secao.campos[chave];
  return valor !== undefined && valor.trim().length > 0 ? valor : padrao;
}

/** Same as `campo`, for a repeatable item's own `campos` bag. */
export function itemCampo(item: SecaoItemData, chave: string, padrao = ""): string {
  const valor = item.campos[chave];
  return valor !== undefined && valor.trim().length > 0 ? valor : padrao;
}

/** Reads a "booleano" field (stored as the literal string "true"/"false"). */
export function itemBool(item: SecaoItemData, chave: string): boolean {
  return item.campos[chave]?.trim().toLowerCase() === "true";
}

/** Splits a "um por linha" textarea field into trimmed, non-empty lines. */
export function linhasDe(texto: string): string[] {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

/** Clamps a free-text "0-100" level field to a safe numeric percentage. */
export function nivelPercentual(valor: string, padrao = 60): number {
  const n = Number.parseInt(valor.replace(/[^0-9-]/g, ""), 10);
  if (Number.isNaN(n)) return padrao;
  return Math.min(100, Math.max(0, n));
}

/** Keeps only digits — used to build a `wa.me` link from a free-typed phone number. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Best-effort initials from a full name, for avatar placeholders (equipe). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

/** Escapes a value for safe use inside a literal (non-JSX-expression) HTML attribute. */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
