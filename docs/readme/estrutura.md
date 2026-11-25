```text
├── app/          rotas do Next (App Router): landing (/), app (/app/...), /privacidade, /termos, 404, robots, sitemap
│                 e a rota /api/quotes, que busca as cotações na brapi;
│                 o corpo de cada tela fica em components/ (portfolio-page.tsx…)
├── types/        tipos do domínio: Asset, Transaction, Payout, AppData
├── lib/          lógica pura: posição, resumo, proventos, metas,
│                 calculadoras, cotações, gráficos, validação dos dados, exportação
├── hooks/        use-portfolio (estado e ações), use-quote-refresh, use-local-storage, use-theme
├── e2e/          testes de ponta a ponta (Playwright)
└── components/   interface (ui/: Button, Card, Modal, Field, Input), marca, providers
```

> [!NOTE]
> A lógica de negócio fica em `lib/`, em funções puras sem dependência de React. Os componentes só chamam essas funções.
