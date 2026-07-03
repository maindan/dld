export { slugify } from "@danlimadev/contracts";

export const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "2026-07-02" -> "02/07" */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** "2026-07-02" -> "02 jul" */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d} ${MESES_ABREV[Number(m) - 1]}`;
}

const MESES_EXTENSO = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "2026-07-02" -> "02 de julho de 2026" */
export function formatDateExtenso(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d} de ${MESES_EXTENSO[Number(m) - 1]} de ${y}`;
}

/** 8400.5 -> "R$ 8.401" */
export function formatBRL(valor: number): string {
  return `R$ ${Math.round(valor).toLocaleString("pt-BR")}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True when the deadline has passed relative to the current date. */
export function isLate(prazoIso: string | null | undefined, reference = todayIso()): boolean {
  return !!prazoIso && prazoIso < reference;
}

/** 3725 -> "01:02:05" */
export function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.trunc(totalSeconds));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

/** 4.25 -> "4,3h" */
export function formatHours(horas: number): string {
  return `${horas.toFixed(1).replace(".", ",")}h`;
}

/** (2026, 6) -> "jul/26" (monthIndex0 is 0-based, like Date#getMonth). */
export function formatMonthLabel(year: number, monthIndex0: number): string {
  return `${MESES_ABREV[monthIndex0]}/${String(year).slice(2)}`;
}

/**
 * Random uppercase token like "A1B2C3D4-E5F6A7B8", used for public share links
 * (/orc/[chave], /cronograma/[chave]). Anyone holding it can view and, for
 * orçamentos, approve — so it's drawn from crypto.randomUUID(), not Math.random().
 */
export function generateChave(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase().replace(/(.{8})(.{8})/, "$1-$2");
}
