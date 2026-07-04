import "react";

/**
 * O page.tsx gerado passa custom properties CSS inline (`--i` para o stagger
 * das grades, `--hd` para a ordem de entrada do hero, `--w` para a largura
 * das barras de habilidade). O csstype usado pelos types do React não aceita
 * chaves `--*` por padrão — esta augmentação libera qualquer custom property
 * em `style={{ ... }}` sem casts espalhados pelo código.
 */
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
