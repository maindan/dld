import type { Secao } from "@danlimadev/contracts";
import type { LandingPageTheme } from "../../models";
import { campo, jsExpr } from "../utils";
import { SECTION_CLOSE, sectionOpen } from "./shared";

/**
 * Real `<form>` markup (nome/e-mail/mensagem) with NO backend — this
 * generator only produces a static Next.js project, it doesn't stand up a
 * server to receive submissions. The form submits via a `mailto:` action
 * (`method="post" encType="text/plain"`), which opens the visitor's email
 * client with the fields pre-filled in the body. This is a well-known
 * static-site fallback, not a real form handler: it only works in browsers
 * with a configured desktop mail client, and silently does nothing on most
 * mobile browsers without one configured. For a production form, replace
 * the `action` with a Next.js Server Action, an API route, or a hosted
 * form service (Formspree, Resend, etc.) — that wiring is intentionally
 * left out here since the contract for this generator has no email/webhook
 * destination field.
 */
export function renderFormulario(secao: Secao, theme: LandingPageTheme, footerEmail: string): string {
  const titulo = campo(secao, "titulo", "Fale com a gente");
  const subtitulo = campo(secao, "subtitulo", "Preencha o formulário e retornaremos em breve.");
  const destino = footerEmail.trim() || "contato@seudominio.com.br";

  return `${sectionOpen(secao, theme, "section-alt")}
        <div className="container section-narrow">
          <h2 className="section-title">{${jsExpr(titulo)}}</h2>
          <p className="section-lead">{${jsExpr(subtitulo)}}</p>
          {/*
            Formulário estático, sem backend: envia via "mailto:" (abre o
            cliente de e-mail do visitante). Funciona apenas em navegadores
            desktop com um cliente de e-mail configurado. Para produção,
            troque o "action" abaixo por uma Server Action, uma API route,
            ou um serviço de formulários (Formspree, Resend, etc).
          */}
          <form className="form-card" action={${jsExpr(`mailto:${destino}`)}} method="post" encType="text/plain">
            <div className="form-field">
              <label htmlFor="nome">Nome</label>
              <input id="nome" name="nome" type="text" required />
            </div>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div className="form-field">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea id="mensagem" name="mensagem" rows={5} required />
            </div>
            <button type="submit" className="btn btn-primary">Enviar mensagem</button>
            <p className="form-note">
              Este formulário não tem backend: ao enviar, seu cliente de e-mail padrão será aberto com a mensagem
              pronta para {${jsExpr(destino)}}.
            </p>
          </form>
        </div>
      ${SECTION_CLOSE}`;
}
