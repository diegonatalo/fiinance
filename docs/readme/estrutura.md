```text
├── app/          rotas do Next (App Router): layout, páginas, 404, robots e sitemap
├── types/        tipos do domínio: Ativo, Transacao, Provento, Dados
├── lib/          lógica pura: posição, resumo, proventos, metas,
│                 calculadoras, validação e migração dos dados, exportação, contextos
├── hooks/        use-carteira (estado e ações), use-local-storage, use-theme
└── components/   interface (ui/: Button, Card, Modal, Field, Input), providers
│   └── views/    uma tela por rota: Painel, Carteira, Proventos, Calculadoras e 404
```

> [!NOTE]
> A lógica de negócio fica em `lib/`, em funções puras sem dependência de React. Os componentes só chamam essas funções.
