### 🧩 Como adicionar uma página nova

1. Crie `src/pages/nome-page.tsx` exportando o componente da tela.
2. Registre a rota em `src/App.tsx`, dentro do `<Route element={<Layout />}>`.
3. Inclua o item em `navItems`, no `src/layout.tsx`, para aparecer no menu.
4. Adicione o caminho em `ROTAS`, no `vite.config.ts`, para entrar no `sitemap.xml`.
