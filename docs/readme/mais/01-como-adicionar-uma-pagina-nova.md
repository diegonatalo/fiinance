### 🧩 Como adicionar uma página nova

1. Crie `app/nome/nome-page.tsx` exportando o componente da tela (com `"use client"` no topo).
2. Crie `app/nome/page.tsx`, importando e renderizando esse componente.
3. Inclua o item em `navItems`, no `components/app-shell.tsx`, para aparecer no menu.
4. Adicione o caminho em `ROTAS`, no `lib/site.ts`, para entrar no `sitemap.xml`.
