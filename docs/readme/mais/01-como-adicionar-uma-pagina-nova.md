### 🧩 Como adicionar uma página nova

1. Crie `src/views/nome-page.tsx` exportando o componente da tela (com `"use client"` no topo).
2. Crie a rota em `src/app/nome/page.tsx`, renderizando esse componente.
3. Inclua o item em `navItems`, no `src/components/app-shell.tsx`, para aparecer no menu.
4. Adicione o caminho em `ROTAS`, no `src/lib/site.ts`, para entrar no `sitemap.xml`.
