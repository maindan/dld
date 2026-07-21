/** Escapes the handful of characters that matter inside HTML text/attribute
 * content. `resetUrl` comes from Supabase's own link generator, but every
 * value that lands in an HTML string gets escaped on principle. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function passwordResetSubject(): string {
  return "Redefinição de senha - danlimadev";
}

export function passwordResetHtml(resetUrl: string): string {
  const safeUrl = escapeHtml(resetUrl);
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px 16px;background:#0b0d10;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:420px;margin:0 auto;">
      <tr>
        <td style="padding-bottom:20px;font-family:monospace;font-size:18px;font-weight:600;color:#e5e9ef;">
          ~/<span style="color:#818cf8;">danlimadev</span>
        </td>
      </tr>
      <tr>
        <td style="background:#12151a;border:1px solid #23272e;border-radius:14px;padding:28px;">
          <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#e5e9ef;">Redefinição de senha</p>
          <p style="margin:0 0 20px;font-size:13.5px;line-height:1.6;color:#9aa4b2;">
            Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para escolher uma nova senha.
            Se você não pediu isso, ignore este e-mail.
          </p>
          <a href="${safeUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#818cf8,#6366f1);color:#0b0d10;text-decoration:none;font-size:13.5px;font-weight:600;padding:10px 18px;border-radius:8px;">
            Redefinir senha
          </a>
          <p style="margin:20px 0 0;font-size:11.5px;line-height:1.6;color:#55606e;">
            O link expira em 1 hora. Se o botão não funcionar, copie e cole este endereço no navegador:<br />
            <span style="word-break:break-all;">${safeUrl}</span>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function passwordResetText(resetUrl: string): string {
  return [
    "Redefinição de senha - danlimadev",
    "",
    "Recebemos um pedido para redefinir sua senha. Abra o link abaixo para escolher uma nova senha:",
    resetUrl,
    "",
    "O link expira em 1 hora. Se você não pediu isso, ignore este e-mail.",
  ].join("\n");
}
