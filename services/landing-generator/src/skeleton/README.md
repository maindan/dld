# Landing page

Projeto Next.js (App Router) gerado automaticamente a partir do editor visual.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

- `app/page.tsx` — todo o conteúdo da página (header, seções, footer, botão de WhatsApp), montado a partir do que foi editado no editor visual.
- `app/layout.tsx` — `<html>/<body>`, metadados e a fonte do Google Fonts do tema escolhido.
- `app/globals.css` — cores, tipografia e animações do tema escolhido, como variáveis CSS (`:root`) e classes reutilizáveis.

## Limitações conhecidas

- **Formulário de contato**: é puramente estático (sem servidor). Ele usa `action="mailto:..."`, que abre o cliente de e-mail do visitante — funciona apenas em navegadores desktop com um cliente configurado. Para receber submissões de verdade em produção, troque o `action` do `<form>` em `app/page.tsx` por uma [Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations), uma API route, ou um serviço de formulários (Formspree, Resend, etc).
- **Imagens**: seções como Galeria e Equipe não têm campo de upload de imagem no editor, então usam placeholders (gradiente / iniciais) em vez de fotos reais. Troque por `<img>`/`next/image` manualmente se quiser fotos.
