import type { LandingPageTheme } from "../models";
import { buildRevealCss } from "./animation";
import { fontFamilyCss } from "./fonts";

function botaoRadiusPx(theme: LandingPageTheme): number {
  if (theme.estiloBotao === "pill") return 999;
  if (theme.estiloBotao === "reto") return 0;
  return theme.radius;
}

/**
 * The full `app/globals.css` for the generated project: CSS custom
 * properties derived from the chosen theme + the user's `corAcento`, resets,
 * typography, the 4 header layout variants, button/card/section primitives
 * shared by every block renderer, and the scroll-reveal animation rules.
 * Every visual difference between the 6 themes (color, font, radius, header
 * shape, button shape, animation style, light/dark) is expressed here as
 * real CSS — nothing is hardcoded per-theme outside of this file and the
 * `LANDING_PAGE_MODELS` data itself.
 */
export function buildGlobalsCss(theme: LandingPageTheme, corAcento: string): string {
  const raioBotao = botaoRadiusPx(theme);
  const sombraCard = theme.escuro
    ? "0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -12px rgba(0,0,0,0.55)"
    : "0 1px 2px rgba(15,17,21,0.04), 0 12px 32px -16px rgba(15,17,21,0.16)";
  const corBorda = theme.escuro ? "rgba(255,255,255,0.10)" : "rgba(15,17,21,0.08)";

  return `:root {
  --color-accent: ${corAcento};
  --color-accent-strong: ${theme.corSecundaria};
  --color-bg: ${theme.corFundo};
  --color-bg-alt: ${theme.corFundoAlt};
  --color-text: ${theme.corTexto};
  --color-text-soft: ${theme.corTextoSuave};
  --color-border: ${corBorda};
  --shadow-card: ${sombraCard};
  --font-title: ${fontFamilyCss(theme.fonteTitulo)};
  --font-body: ${fontFamilyCss(theme.fonteCorpo)};
  --radius: ${theme.radius}px;
  --radius-btn: ${raioBotao}px;
  --header-height: 76px;
  --container-width: 1120px;
  color-scheme: ${theme.escuro ? "dark" : "light"};
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
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  display: block;
}

h1, h2, h3, h4 {
  font-family: var(--font-title);
  line-height: 1.15;
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

.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 24px;
}

.section {
  padding: 88px 0;
  scroll-margin-top: var(--header-height);
}

.section-alt {
  background: var(--color-bg-alt);
}

.section-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 12px;
}

.section-title {
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 800;
  margin-bottom: 16px;
  max-width: 720px;
}

.section-lead {
  font-size: 17px;
  color: var(--color-text-soft);
  max-width: 620px;
  line-height: 1.7;
}

.section-header {
  margin-bottom: 48px;
}

.section-narrow {
  max-width: 720px;
}

/* -------------------------------------------------------------------- */
/* Hero — quase tela cheia, título grande + CTA                          */
/* -------------------------------------------------------------------- */

.hero {
  min-height: 86vh;
  display: flex;
  align-items: center;
  padding: 120px 0 88px;
  background: ${theme.escuro ? "radial-gradient(120% 120% at 50% 0%, var(--color-bg-alt), var(--color-bg))" : "linear-gradient(180deg, var(--color-bg-alt), var(--color-bg))"};
}

.hero-inner {
  max-width: 760px;
}

.hero-title {
  font-size: clamp(38px, 6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}

.hero-subtitle {
  font-size: 19px;
  color: var(--color-text-soft);
  max-width: 600px;
  margin-bottom: 36px;
  line-height: 1.7;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.btn-primary {
  background: var(--color-accent);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px color-mix(in srgb, var(--color-accent) 70%, transparent);
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
  transition: opacity 0.2s ease;
}

.site-header__nav a:hover {
  opacity: 1;
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
  color: #ffffff;
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.site-header--transparente-sobre-hero .site-header__logo-fallback {
  background: #ffffff;
}

.site-header--transparente-sobre-hero.is-scrolled {
  background: var(--color-bg);
  color: var(--color-text);
  box-shadow: var(--shadow-card);
}

.site-header--transparente-sobre-hero.is-scrolled .site-header__logo-fallback {
  background: var(--color-accent);
}

/* centralizado: estático no fluxo, logo/título e nav centralizados */
.site-header--centralizado {
  position: static;
  background: var(--color-bg);
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
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  box-shadow: var(--shadow-card);
}

.site-header--pill-flutuante .container {
  min-height: 60px;
  padding: 0 12px 0 20px;
}

.site-header--pill-flutuante.is-scrolled {
  box-shadow: 0 18px 40px -18px rgba(0,0,0,0.35);
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
/* Grids de cards (servicos, diferenciais, equipe, galeria, depoimentos) */
/* -------------------------------------------------------------------- */

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

.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 28px;
  box-shadow: var(--shadow-card);
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: calc(var(--radius) * 0.6);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  margin-bottom: 18px;
}

.card-title {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
}

.card-text {
  color: var(--color-text-soft);
  font-size: 15px;
  line-height: 1.65;
}

/* Depoimentos */

.testimonial {
  position: relative;
}

.testimonial-quote {
  font-size: 32px;
  color: var(--color-accent);
  line-height: 1;
  margin-bottom: 12px;
  font-family: var(--font-title);
}

.testimonial-text {
  font-size: 15.5px;
  line-height: 1.7;
  margin-bottom: 20px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testimonial-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
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

/* Equipe */

.team-card {
  text-align: center;
}

.team-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 22%, var(--color-bg));
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 24px;
  margin: 0 auto 16px;
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

/* Galeria */

.gallery-card {
  padding: 0;
  overflow: hidden;
}

.gallery-thumb {
  height: 160px;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
}

.gallery-body {
  padding: 20px 22px 24px;
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
  box-shadow: 0 20px 48px -20px color-mix(in srgb, var(--color-accent) 60%, transparent);
  transform: scale(1.03);
}

.pricing-badge {
  position: absolute;
  top: -13px;
  right: 24px;
  background: var(--color-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
}

.pricing-name {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 17px;
}

.pricing-price {
  font-family: var(--font-title);
  font-weight: 800;
  font-size: 30px;
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
  max-width: 760px;
  margin-top: 8px;
}

.faq-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 6px 22px;
  background: var(--color-bg);
}

.faq-item summary {
  cursor: pointer;
  list-style: none;
  padding: 16px 0;
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
  font-size: 20px;
  color: var(--color-accent);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.faq-item[open] summary::after {
  transform: rotate(45deg);
}

.faq-answer {
  color: var(--color-text-soft);
  font-size: 14.5px;
  line-height: 1.7;
  padding-bottom: 18px;
}

/* -------------------------------------------------------------------- */
/* Agenda                                                                */
/* -------------------------------------------------------------------- */

.agenda-list {
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin-top: 8px;
}

.agenda-item {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border);
}

.agenda-item:last-child {
  border-bottom: none;
}

.agenda-time {
  font-family: var(--font-title);
  font-weight: 800;
  color: var(--color-accent);
  font-size: 15px;
}

.agenda-title {
  font-weight: 700;
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
}

.skill-track {
  height: 10px;
  border-radius: 999px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  border-radius: 999px;
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

.form-field input,
.form-field textarea {
  border: 1.5px solid var(--color-border);
  border-radius: calc(var(--radius) * 0.5);
  padding: 12px 14px;
  font-size: 15px;
  background: var(--color-bg-alt);
  color: var(--color-text);
}

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
/* CTA final                                                            */
/* -------------------------------------------------------------------- */

.cta-band {
  background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong));
  color: #ffffff;
  text-align: center;
  padding: 96px 0;
}

.cta-band .section-title,
.cta-band .section-lead {
  color: #ffffff;
  margin-left: auto;
  margin-right: auto;
}

.cta-band .section-lead {
  color: rgba(255,255,255,0.88);
}

.cta-band .btn-primary {
  background: #ffffff;
  color: var(--color-accent);
}

/* -------------------------------------------------------------------- */
/* Footer                                                                */
/* -------------------------------------------------------------------- */

.site-footer {
  padding: 56px 0 28px;
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
  box-shadow: 0 10px 28px -6px rgba(0,0,0,0.4);
  z-index: 999;
  transition: transform 0.2s ease;
}

.whatsapp-float:hover {
  transform: scale(1.08);
}

/* -------------------------------------------------------------------- */
/* Responsivo                                                           */
/* -------------------------------------------------------------------- */

@media (max-width: 720px) {
  .section {
    padding: 56px 0;
  }
  .site-header__nav {
    gap: 16px;
    font-size: 13px;
  }
  .agenda-item {
    grid-template-columns: 72px 1fr;
  }
  .pricing-card--destaque {
    transform: none;
  }
}

/* -------------------------------------------------------------------- */
/* Animação de entrada ao rolar (estiloAnimacao: ${theme.estiloAnimacao})  */
/* -------------------------------------------------------------------- */
${buildRevealCss(theme)}
`;
}
