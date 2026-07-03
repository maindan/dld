import { SECAO_BLOCKS, type Secao } from "@danlimadev/contracts";

/**
 * Human label for a section, disambiguated with a "#N" suffix when more than one
 * section of the same tipo exists (e.g. two "Serviços" blocks -> "Serviços #1" / "Serviços #2").
 * Used by the section list panel and by the header nav-target <select>.
 */
export function secaoLabel(secoes: Secao[], secao: Secao): string {
  const nome = SECAO_BLOCKS[secao.tipo]?.nome ?? secao.tipo;
  const mesmoTipo = secoes.filter((s) => s.tipo === secao.tipo);
  if (mesmoTipo.length <= 1) return nome;
  const idx = mesmoTipo.findIndex((s) => s.id === secao.id);
  return `${nome} #${idx + 1}`;
}
