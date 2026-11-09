```text
├── app/          rotas do Next (App Router): layout, páginas, 404, robots e sitemap;
│                 o corpo de cada tela fica em components/ (portfolio-page.tsx…)
├── types/        tipos do domínio: Asset, Transaction, Payout, AppData
├── lib/          lógica pura: posição, resumo, proventos, metas,
│                 calculadoras, validação dos dados, exportação, contextos
├── hooks/        use-portfolio (estado e ações), use-local-storage, use-theme
└── components/   interface (ui/: Button, Card, Modal, Field, Input), providers
```

> [!NOTE]
> A lógica de negócio fica em `lib/`, em funções puras sem dependência de React. Os componentes só chamam essas funções.
