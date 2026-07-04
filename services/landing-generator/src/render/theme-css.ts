import { buildRevealCss, EASE } from "./animation";
import { buildBackgroundCss } from "./backgrounds";
import { fontFamilyCss } from "./fonts";
import type { ResolvedDesign } from "./resolve-design";

function botaoRadiusPx(design: ResolvedDesign): number {
  if (design.estiloBotao === "pill") return 999;
  if (design.estiloBotao === "reto") return 0;
  return design.radius;
}

/** Inline-SVG film grain (feTurbulence) as a data URI — used by the aurora decor and the CTA band. */
const GRAIN_DATA_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;

/**
 * Card surface treatment for the resolved `estiloCard`. Only the chosen
 * style's rules are emitted — every card in the page shares the `.card`
 * class, so the treatment is consistent across services, testimonials,
 * pricing, team, gallery and the form.
 */
function cardSurfaceCss(design: ResolvedDesign): string {
  const marker = `/* estiloCard: ${design.estiloCard} */`;
  switch (design.estiloCard) {
    case "glass": {
      const bg = design.escuro ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.6)";
      const borda = design.escuro ? "rgba(255, 255, 255, 0.10)" : "rgba(15, 17, 21, 0.08)";
      return `${marker}
.card {
  background: ${bg};
  border: 1px solid ${borda};
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}`;
    }
    case "elevated":
      return `${marker}
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}`;
    case "outline":
      return `${marker}
.card {
  background: transparent;
  border: 1.5px solid var(--color-border);
}`;
    case "flat":
      return `${marker}
.card {
  background: var(--color-bg-alt);
  border: 1px solid transparent;
}`;
  }
}

/** Form inputs follow the card language: glassy on dark themes, clean elevated fields on light. */
function formInputCss(design: ResolvedDesign): string {
  if (design.escuro) {
    return `.form-field input,
.form-field textarea {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: calc(var(--radius) * 0.55 + 4px);
  padding: 13px 15px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.form-field input:hover,
.form-field textarea:hover {
  border-color: rgba(255, 255, 255, 0.22);
}`;
  }
  return `.form-field input,
.form-field textarea {
  border: 1.5px solid var(--color-border);
  border-radius: calc(var(--radius) * 0.55 + 4px);
  padding: 13px 15px;
  font-size: 15px;
  background: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field input:hover,
.form-field textarea:hover {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
}`;
}

/**
 * The full `app/globals.css` for the generated project: CSS custom properties
 * derived from the resolved design (theme merged with the page's `design`
 * overrides + the user's `corAcento`), resets, the confident type scale, the
 * 4 header variants, the decorative background treatment, every section
 * block's layout variants, the card surface language, and all motion. Every
 * visual difference between themes/overrides is expressed here as real CSS —
 * nothing per-theme is hardcoded outside this file and the design data itself.
 */
export function buildGlobalsCss(design: ResolvedDesign): string {
  const raioBotao = botaoRadiusPx(design);
  const sombraCard = design.escuro
    ? "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px -10px rgba(0, 0, 0, 0.5), 0 24px 48px -20px rgba(0, 0, 0, 0.55)"
    : "0 1px 2px rgba(15, 17, 21, 0.04), 0 8px 24px -12px rgba(15, 17, 21, 0.12), 0 24px 48px -24px rgba(15, 17, 21, 0.14)";
  const corBorda = design.escuro ? "rgba(255, 255, 255, 0.10)" : "rgba(15, 17, 21, 0.08)";
  const hoverShadow = design.escuro
    ? "0 4px 12px rgba(0, 0, 0, 0.45), 0 20px 44px -16px color-mix(in srgb, var(--color-accent) 32%, transparent)"
    : "0 4px 12px rgba(15, 17, 21, 0.06), 0 20px 44px -18px color-mix(in srgb, var(--color-accent) 35%, transparent)";
  const destaqueGlow = design.escuro
    ? "0 0 0 1px color-mix(in srgb, var(--color-accent) 65%, transparent), 0 24px 64px -20px color-mix(in srgb, var(--color-accent) 55%, transparent)"
    : "0 0 0 1px color-mix(in srgb, var(--color-accent) 55%, transparent), 0 24px 56px -22px color-mix(in srgb, var(--color-accent) 45%, transparent)";

  return `:root {
  --color-accent: ${design.corAcento};
  --color-accent-strong: ${design.corSecundaria};
  --color-bg: ${design.corFundo};
  --color-bg-alt: ${design.corFundoAlt};
  --color-text: ${design.corTexto};
  --color-text-soft: ${design.corTextoSuave};
  --color-border: ${corBorda};
  --shadow-card: ${sombraCard};
  --font-title: ${fontFamilyCss(design.fonteTitulo)};
  --font-body: ${fontFamilyCss(design.fonteCorpo)};
  --font-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
  --radius: ${design.radius}px;
  --radius-btn: ${raioBotao}px;
  --header-height: 76px;
  --container-width: 1120px;
  --grain: ${GRAIN_DATA_URI};
  color-scheme: ${design.escuro ? "dark" : "light"};
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  display: block;
}

h1, h2, h3, h4 {
  font-family: var(--font-title);
  line-height: 1.1;
  margin: 0;
}

p {
  margin: 0;
}

a {
  color: inherit;
}

button, input, textarea {
  font-family: var(--font-body);
}

main {
  position: relative;
  z-index: 0;
  overflow-x: clip;
}

.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 24px;
}

.section {
  padding: 96px 0;
  scroll-margin-top: var(--header-height);
}

.section-alt {
  background: var(--color-bg-alt);
}

.section-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 14px;
}

.section-title {
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-wrap: balance;
  margin-bottom: 18px;
  max-width: 760px;
}

.section-lead {
  font-size: 17px;
  color: var(--color-text-soft);
  max-width: 640px;
  line-height: 1.7;
}

.section-header {
  margin-bottom: 56px;
}

.section-narrow {
  max-width: 760px;
}

/* Sobre — variante com-imagem: texto + imagem lado a lado */
.about-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 64px;
  align-items: center;
}

.about-media-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: calc(var(--radius) + 4px);
  box-shadow: var(--shadow-card);
}

/* -------------------------------------------------------------------- */
/* Background decorativo (estiloBackground: ${design.estiloBackground})  */
/* -------------------------------------------------------------------- */

${buildBackgroundCss(design)}

/* -------------------------------------------------------------------- */
/* Hero — 3 variantes (centrado / split / editorial)                     */
/* -------------------------------------------------------------------- */

.hero {
  min-height: 88vh;
  display: flex;
  align-items: center;
  padding: 128px 0 96px;
  background: transparent;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 26px;
}

.hero-badge::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
}

.hero-title {
  font-size: clamp(2.6rem, 6.5vw, 4.6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-wrap: balance;
  margin-bottom: 26px;
}

.hero-grad {
  background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  font-size: 19px;
  color: var(--color-text-soft);
  max-width: 600px;
  margin-bottom: 40px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* centrado: badge + título com gradiente + CTA, tudo no eixo central */
.hero--centrado {
  text-align: center;
}

.hero--centrado .hero-inner {
  max-width: 860px;
  margin: 0 auto;
}

.hero--centrado .hero-subtitle {
  margin-left: auto;
  margin-right: auto;
}

.hero--centrado .hero-actions {
  justify-content: center;
}

/* split: texto à esquerda, imagem ou mockup CSS à direita */
.hero--split .hero-inner {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: center;
  max-width: var(--container-width);
}

.hero-media {
  position: relative;
  min-width: 0;
}

.hero-media-img {
  width: 100%;
  border-radius: calc(var(--radius) + 4px);
  box-shadow: var(--shadow-card);
  object-fit: cover;
}

/* imagem empilhada abaixo do texto nas variantes centrado/editorial */
.hero-media--stack {
  width: 100%;
  max-width: 880px;
  margin-top: 56px;
}

/* Mockup abstrato desenhado em CSS (janela de browser + skeleton) — usado
   quando a variante split não recebe imagemUrl. Nunca um retângulo vazio. */
.hero-mockup {
  border-radius: calc(var(--radius) + 4px);
  border: 1px solid var(--color-border);
  background: ${design.escuro ? "color-mix(in srgb, var(--color-bg-alt) 82%, var(--color-accent) 4%)" : "var(--color-bg)"};
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.hero-mockup-bar {
  display: flex;
  gap: 7px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-text) 3%, transparent);
}

.hero-mockup-bar span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-text) 16%, transparent);
}

.hero-mockup-bar span:first-child {
  background: color-mix(in srgb, var(--color-accent) 70%, transparent);
}

.hero-mockup-body {
  padding: 28px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mock-line {
  height: 12px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-text) 9%, transparent);
  width: 82%;
}

.mock-line--title {
  height: 22px;
  width: 58%;
  background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 55%, transparent), color-mix(in srgb, var(--color-accent-strong) 40%, transparent));
}

.mock-line--short {
  width: 44%;
}

.mock-blocks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 10px;
}

.mock-block {
  height: 72px;
  border-radius: calc(var(--radius) * 0.6 + 4px);
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
  border: 1px solid var(--color-border);
}

.mock-block--accent {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 45%, transparent), color-mix(in srgb, var(--color-accent-strong) 30%, transparent));
}

/* editorial: tipografia gigante alinhada à esquerda, hairline, CTA discreto */
.hero--editorial {
  min-height: 78vh;
}

.hero--editorial .hero-inner {
  max-width: var(--container-width);
}

.hero-title--editorial {
  font-size: clamp(3rem, 9vw, 7.5rem);
  letter-spacing: -0.035em;
  line-height: 0.98;
  max-width: none;
}

.hero-eyebrow {
  display: block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 30px;
}

.hero-cta-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 7px;
  transition: color 0.2s ease, text-underline-offset 0.2s ease;
}

.hero-cta-link:hover {
  color: var(--color-accent);
  text-underline-offset: 10px;
}

.hero-hairline {
  height: 1px;
  background: var(--color-border);
  margin-top: 72px;
}

/* -------------------------------------------------------------------- */
/* Botões                                                                */
/* -------------------------------------------------------------------- */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--radius-btn);
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: transform 0.25s ${EASE}, box-shadow 0.25s ease, opacity 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn-lg {
  padding: 17px 36px;
  font-size: 16px;
}

.btn-primary {
  background: var(--color-accent);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--color-accent) 70%, transparent);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-outline {
  background: transparent;
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
}

.btn-outline:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* -------------------------------------------------------------------- */
/* Header — 4 variantes (estiloHeader)                                   */
/* -------------------------------------------------------------------- */

.site-header {
  z-index: 100;
  font-family: var(--font-body);
}

.site-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: var(--header-height);
}

.site-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-title);
  font-weight: 800;
  font-size: 17px;
}

.site-header__logo-fallback {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--color-accent);
  flex-shrink: 0;
}

.site-header__logo-img {
  height: 32px;
  width: auto;
  border-radius: 8px;
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 14px;
  font-weight: 600;
}

.site-header__nav a {
  text-decoration: none;
  opacity: 0.82;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.site-header__nav a:hover {
  opacity: 1;
  color: var(--color-accent);
}

/* solido-fixo: barra sólida fixa, ganha sombra ao rolar */
.site-header--solido-fixo {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-bottom: 1px solid transparent;
}

.site-header--solido-fixo.is-scrolled {
  border-bottom-color: var(--color-border);
  box-shadow: var(--shadow-card);
}

/* transparente-sobre-hero: some sobre o hero, fica sólido ao rolar */
.site-header--transparente-sobre-hero {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  color: ${design.escuro ? "var(--color-text)" : "#ffffff"};
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.site-header--transparente-sobre-hero .site-header__logo-fallback {
  background: ${design.escuro ? "var(--color-accent)" : "#ffffff"};
}

.site-header--transparente-sobre-hero.is-scrolled {
  background: color-mix(in srgb, var(--color-bg) 88%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: var(--color-text);
  box-shadow: var(--shadow-card);
}

.site-header--transparente-sobre-hero.is-scrolled .site-header__logo-fallback {
  background: var(--color-accent);
}

/* centralizado: estático no fluxo, logo/título e nav centralizados */
.site-header--centralizado {
  position: static;
  background: transparent;
  padding: 32px 0 8px;
  text-align: center;
}

.site-header--centralizado .container {
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.site-header--centralizado .site-header__nav {
  justify-content: center;
  flex-wrap: wrap;
}

/* pill-flutuante: pílula flutuante com margem, não colada na borda */
.site-header--pill-flutuante {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 920px;
  background: color-mix(in srgb, var(--color-bg) 86%, transparent);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  box-shadow: var(--shadow-card);
}

.site-header--pill-flutuante .container {
  min-height: 60px;
  padding: 0 12px 0 20px;
}

.site-header--pill-flutuante.is-scrolled {
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.35);
}

/* Body offset so fixed headers never overlap page content. */
body:has(.site-header--solido-fixo),
body:has(.site-header--transparente-sobre-hero) {
  padding-top: var(--header-height);
}

body:has(.site-header--pill-flutuante) {
  padding-top: calc(var(--header-height) + 18px);
}

body:has(.site-header--transparente-sobre-hero) #topo {
  margin-top: calc(var(--header-height) * -1);
}

/* -------------------------------------------------------------------- */
/* Cards — superfície única (estiloCard) + grades e variantes de layout  */
/* -------------------------------------------------------------------- */

.card {
  border-radius: var(--radius);
  padding: 30px;
  position: relative;
  transition: transform 0.35s ${EASE}, border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
}

${cardSurfaceCss(design)}

.card--hover:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  box-shadow: ${hoverShadow};
}

.grid {
  display: grid;
  gap: 24px;
  margin-top: 8px;
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.card-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 10px;
  border-radius: calc(var(--radius) * 0.6 + 4px);
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 20px;
}

.card-title {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}

.card-text {
  color: var(--color-text-soft);
  font-size: 15px;
  line-height: 1.65;
}

/* bento: o primeiro card ocupa 2 colunas / 2 linhas com tipografia maior */
.cards-bento {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.cards-bento > :first-child {
  grid-column: span 2;
  grid-row: span 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 320px;
}

.cards-bento > :first-child .card-title {
  font-size: clamp(1.5rem, 2.6vw, 2.1rem);
  letter-spacing: -0.02em;
}

.cards-bento > :first-child .card-text {
  font-size: 16.5px;
  max-width: 520px;
}

/* lista: linhas horizontais com hairline e número grande à esquerda */
.cards-rows {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.row-item {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 28px;
  align-items: baseline;
  padding: 34px 0;
  border-top: 1px solid var(--color-border);
  transition: background 0.25s ease;
}

.row-item:last-child {
  border-bottom: 1px solid var(--color-border);
}

.row-index {
  font-family: var(--font-title);
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: color-mix(in srgb, var(--color-accent) 65%, var(--color-text-soft));
  line-height: 1;
}

.row-item .card-title {
  font-size: clamp(1.15rem, 2vw, 1.45rem);
}

.row-item .card-text {
  max-width: 640px;
}

/* -------------------------------------------------------------------- */
/* Estatísticas — números grandes com contador animado                   */
/* -------------------------------------------------------------------- */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 40px 32px;
  margin-top: 8px;
  text-align: center;
}

.stat-value {
  font-family: var(--font-title);
  font-size: clamp(2.4rem, 5.5vw, 3.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
  margin-bottom: 10px;
}

.stat-suffix {
  color: var(--color-accent-strong);
}

.stat-label {
  font-size: 15px;
  color: var(--color-text-soft);
  font-weight: 600;
}

/* -------------------------------------------------------------------- */
/* Marcas — faixa marquee de logos em rolagem contínua                   */
/* -------------------------------------------------------------------- */

.marcas-title {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-soft);
  margin-bottom: 40px;
}

.marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
}

.marquee + .marquee {
  margin-top: 24px;
}

.marquee-track {
  display: flex;
  align-items: center;
  gap: 56px;
  width: max-content;
}

.marquee-group {
  display: flex;
  align-items: center;
  gap: 56px;
  flex-shrink: 0;
}

.marca-logo {
  height: 34px;
  width: auto;
  filter: grayscale(1);
  opacity: 0.55;
  transition: filter 0.25s ease, opacity 0.25s ease;
}

.marca-logo:hover {
  filter: none;
  opacity: 1;
}

.marca-nome {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  color: var(--color-text-soft);
  white-space: nowrap;
  transition: color 0.25s ease;
}

.marca-nome:hover {
  color: var(--color-text);
}

@media (prefers-reduced-motion: no-preference) {
  .marquee-track {
    animation: marquee-scroll 32s linear infinite;
  }
  .marquee-track--reverse {
    animation-direction: reverse;
  }
  .marquee:hover .marquee-track {
    animation-play-state: paused;
  }
  @keyframes marquee-scroll {
    to {
      transform: translateX(calc(-50% - 28px));
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    flex-wrap: wrap;
    justify-content: center;
    width: auto;
  }
  .marquee [aria-hidden="true"].marquee-group {
    display: none;
  }
}

/* -------------------------------------------------------------------- */
/* Depoimentos — grid / marquee / destaque                               */
/* -------------------------------------------------------------------- */

.testimonial {
  position: relative;
  display: flex;
  flex-direction: column;
}

.testimonial-quote {
  font-size: 52px;
  color: color-mix(in srgb, var(--color-accent) 65%, transparent);
  line-height: 0.6;
  margin-bottom: 22px;
  font-family: var(--font-title);
}

.testimonial-text {
  font-size: 15.5px;
  line-height: 1.7;
  margin-bottom: 24px;
  flex: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testimonial-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.testimonial-avatar-img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.testimonial-name {
  font-weight: 700;
  font-size: 14px;
}

.testimonial-role {
  font-size: 13px;
  color: var(--color-text-soft);
}

/* marquee de depoimentos: cards com largura fixa em fileiras opostas */
.testimonials-marquee .testimonial {
  width: min(360px, 78vw);
  flex-shrink: 0;
}

/* destaque: uma citação enorme centralizada */
.testimonial-featured {
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
}

.testimonial-featured + .testimonial-featured {
  margin-top: 88px;
}

.testimonial-featured .testimonial-quote {
  font-size: 84px;
  margin-bottom: 8px;
}

.testimonial-featured-text {
  font-family: var(--font-title);
  font-size: clamp(1.4rem, 3.2vw, 2.2rem);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.35;
  text-wrap: balance;
  margin-bottom: 36px;
}

.testimonial-featured .testimonial-author {
  justify-content: center;
}

/* -------------------------------------------------------------------- */
/* Equipe                                                                */
/* -------------------------------------------------------------------- */

.team-card {
  text-align: center;
}

.team-avatar {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 26px;
  margin: 0 auto 18px;
}

.team-avatar-img {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 18px;
}

.team-name {
  font-weight: 700;
  font-size: 16px;
}

.team-role {
  font-size: 14px;
  color: var(--color-text-soft);
  margin-top: 2px;
}

/* -------------------------------------------------------------------- */
/* Galeria — grid uniforme / masonry, imagem real ou placeholder         */
/* -------------------------------------------------------------------- */

.gallery-card {
  padding: 0;
  overflow: hidden;
}

.gallery-thumb {
  position: relative;
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.gallery-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ${EASE};
}

.gallery-card:hover .gallery-img {
  transform: scale(1.05);
}

.gallery-thumb--g1 {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
}

.gallery-thumb--g2 {
  background: linear-gradient(215deg, var(--color-accent-strong), color-mix(in srgb, var(--color-accent) 55%, var(--color-bg-alt)));
}

.gallery-thumb--g3 {
  background: linear-gradient(160deg, color-mix(in srgb, var(--color-accent) 75%, #000000 8%), var(--color-accent-strong));
}

.gallery-thumb-title {
  position: relative;
  padding: 18px 20px;
  color: #ffffff;
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
}

.gallery-body {
  padding: 20px 22px 24px;
}

.gallery-masonry {
  columns: 3;
  column-gap: 24px;
  margin-top: 8px;
}

.gallery-masonry .gallery-card {
  break-inside: avoid;
  margin-bottom: 24px;
}

.gallery-masonry .thumb-h1 {
  height: 180px;
}

.gallery-masonry .thumb-h2 {
  height: 250px;
}

.gallery-masonry .thumb-h3 {
  height: 215px;
}

/* -------------------------------------------------------------------- */
/* Preços                                                                */
/* -------------------------------------------------------------------- */

.pricing-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.pricing-card--destaque {
  border-color: var(--color-accent);
  box-shadow: ${destaqueGlow};
  transform: scale(1.04);
  z-index: 1;
}

.pricing-badge {
  position: absolute;
  top: -13px;
  right: 24px;
  background: var(--color-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 5px 14px;
  border-radius: 999px;
  box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--color-accent) 80%, transparent);
}

.pricing-name {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 17px;
}

.pricing-price {
  font-family: var(--font-title);
  font-weight: 800;
  font-size: clamp(1.9rem, 3vw, 2.4rem);
  letter-spacing: -0.02em;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14.5px;
  color: var(--color-text-soft);
  flex: 1;
}

.pricing-features li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.pricing-features li::before {
  content: "✓";
  color: var(--color-accent);
  font-weight: 800;
  flex-shrink: 0;
}

/* -------------------------------------------------------------------- */
/* FAQ                                                                   */
/* -------------------------------------------------------------------- */

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 780px;
  margin-top: 8px;
}

.faq-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 6px 24px;
  background: ${design.escuro ? "rgba(255, 255, 255, 0.03)" : "var(--color-bg)"};
  transition: border-color 0.25s ease;
}

.faq-item:hover {
  border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-border));
}

.faq-item summary {
  cursor: pointer;
  list-style: none;
  padding: 17px 0;
  font-weight: 700;
  font-size: 15.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: "+";
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-accent);
  flex-shrink: 0;
  transition: transform 0.3s ${EASE}, background 0.2s ease;
}

.faq-item[open] summary::after {
  transform: rotate(135deg);
}

.faq-answer {
  color: var(--color-text-soft);
  font-size: 14.5px;
  line-height: 1.7;
  padding-bottom: 20px;
  max-width: 640px;
}

/* -------------------------------------------------------------------- */
/* Agenda — linha do tempo vertical                                      */
/* -------------------------------------------------------------------- */

.agenda-list {
  position: relative;
  max-width: 760px;
  margin-top: 8px;
  padding-left: 30px;
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 30%, var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agenda-item {
  position: relative;
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 24px;
  padding: 20px 0;
}

.agenda-item::before {
  content: "";
  position: absolute;
  left: -37px;
  top: 28px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.agenda-time {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-accent);
  font-size: 15px;
  letter-spacing: 0.02em;
  padding-top: 2px;
}

.agenda-title {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 17px;
  margin-bottom: 4px;
}

.agenda-desc {
  color: var(--color-text-soft);
  font-size: 14.5px;
  line-height: 1.6;
}

/* -------------------------------------------------------------------- */
/* Habilidades                                                          */
/* -------------------------------------------------------------------- */

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 640px;
  margin-top: 8px;
}

.skill-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-label {
  display: flex;
  justify-content: space-between;
  font-size: 14.5px;
  font-weight: 700;
}

.skill-level {
  color: var(--color-text-soft);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.skill-track {
  height: 10px;
  border-radius: 999px;
  background: ${design.escuro ? "rgba(255, 255, 255, 0.07)" : "var(--color-bg-alt)"};
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  border-radius: 999px;
  width: var(--w, 60%);
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}

/* -------------------------------------------------------------------- */
/* Formulário                                                           */
/* -------------------------------------------------------------------- */

.form-card {
  max-width: 560px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13.5px;
  font-weight: 700;
}

${formInputCss(design)}

.form-field input:focus,
.form-field textarea:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.form-note {
  font-size: 12.5px;
  color: var(--color-text-soft);
}

/* -------------------------------------------------------------------- */
/* CTA final — faixa full-width com gradiente, brilho e grão             */
/* -------------------------------------------------------------------- */

.cta-band {
  position: relative;
  overflow: hidden;
  background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong));
  color: #ffffff;
  text-align: center;
  padding: 110px 0;
}

.cta-band::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 90% at 50% 0%, rgba(255, 255, 255, 0.18), transparent 70%);
  pointer-events: none;
}

.cta-band::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--grain);
  background-size: 180px 180px;
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.cta-band .container {
  position: relative;
  z-index: 1;
}

.cta-band .section-title,
.cta-band .section-lead {
  color: #ffffff;
  margin-left: auto;
  margin-right: auto;
}

.cta-band .section-lead {
  color: rgba(255, 255, 255, 0.88);
}

.cta-band .btn-primary {
  background: #ffffff;
  color: var(--color-accent);
}

.cta-band .btn-primary:hover {
  box-shadow: 0 16px 32px -10px rgba(0, 0, 0, 0.35);
}

/* -------------------------------------------------------------------- */
/* Footer                                                                */
/* -------------------------------------------------------------------- */

.site-footer {
  padding: 64px 0 28px;
  font-size: 14px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-alt);
}

.site-footer__grid {
  display: grid;
  gap: 32px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 36px;
}

.site-footer__heading {
  font-family: var(--font-title);
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 15px;
}

.site-footer__line {
  color: var(--color-text-soft);
  margin-bottom: 6px;
  line-height: 1.6;
}

.site-footer__social a {
  display: block;
  color: var(--color-text-soft);
  text-decoration: none;
  margin-bottom: 6px;
  transition: color 0.2s ease;
}

.site-footer__social a:hover {
  color: var(--color-accent);
}

.site-footer__bottom {
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
  color: var(--color-text-soft);
  font-size: 13px;
  text-align: center;
}

/* -------------------------------------------------------------------- */
/* Botão flutuante de WhatsApp                                          */
/* -------------------------------------------------------------------- */

.whatsapp-float {
  position: fixed;
  right: 22px;
  bottom: 22px;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #25d366;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px -6px rgba(0, 0, 0, 0.4);
  z-index: 999;
  transition: transform 0.25s ${EASE};
}

.whatsapp-float:hover {
  transform: scale(1.08);
}

/* -------------------------------------------------------------------- */
/* Responsivo                                                           */
/* -------------------------------------------------------------------- */

@media (max-width: 900px) {
  .hero--split .hero-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .about-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .cards-bento {
    grid-template-columns: 1fr;
  }
  .cards-bento > :first-child {
    grid-column: auto;
    grid-row: auto;
    min-height: 0;
  }
  .gallery-masonry {
    columns: 2;
  }
}

@media (max-width: 720px) {
  .section {
    padding: 60px 0;
  }
  .hero {
    min-height: 0;
    padding: 96px 0 64px;
  }
  .site-header__nav {
    gap: 16px;
    font-size: 13px;
  }
  .row-item {
    grid-template-columns: 56px 1fr;
    gap: 18px;
    padding: 26px 0;
  }
  .agenda-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .pricing-card--destaque {
    transform: none;
  }
  .gallery-masonry {
    columns: 1;
  }
  .hero-hairline {
    margin-top: 48px;
  }
}

/* -------------------------------------------------------------------- */
/* Animações (estiloAnimacao: ${design.estiloAnimacao})                  */
/* -------------------------------------------------------------------- */
${buildRevealCss(design)}
`;
}
