```text
├── app/          rotas do Next (App Router): landing (/), app (/app/...), /entrar, /cadastro, /api/auth,
│                 /privacidade, /termos, 404, robots e sitemap;
│                 o corpo de cada tela fica em components/ (portfolio-page.tsx…)
├── types/        tipos do domínio: Asset, Transaction, Payout, AppData
├── lib/          lógica pura: posição, resumo, proventos, metas, calculadoras, gráficos, validação;
│                 db/ (schema e conexão), data/ (leituras e Server Actions), auth (Better Auth)
├── drizzle/      migrações do banco, geradas por pnpm db:generate
├── hooks/        use-portfolio (estado e salvamento), use-account, use-theme
├── e2e/          testes de ponta a ponta (Playwright)
├── components/   interface (ui/: Button, Card, Modal, Field, Input), marca, providers, telas de conta
└── proxy.ts      manda para /entrar quem abre o app sem o cookie de sessão
```

> [!NOTE]
> A lógica de negócio fica em `lib/`, em funções puras sem dependência de React. Os componentes só chamam essas funções.
