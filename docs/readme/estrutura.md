```text
src/
├── models/       tipos do domínio: Ativo, Transacao, Provento, Dados
├── lib/          lógica pura, sem React: posição, resumo, proventos, metas,
│                 calculadoras, validação e migração dos dados, exportação
├── hooks/        useCarteira (estado e ações), useLocalStorage, useTheme
├── contexts/     CarteiraProvider e ToastProvider
├── components/   interface (ui/: Button, Card, Modal, Field, Input)
└── pages/        uma tela por rota: Painel, Carteira, Proventos, Calculadoras e 404
```

> [!NOTE]
> A lógica de negócio fica em `lib/`, sem dependência de React. Os componentes só chamam essas funções.
