### 🧪 Testes

```bash
pnpm test
```

Usa [Vitest](https://vitest.dev). Os testes cobrem os cálculos da carteira (preço médio, número mágico, alocação, sugestão de aporte, proventos), a validação do que chega às Server Actions, a conversão para as linhas do banco (centavos), as regras da conta (Better Auth com o adaptador em memória), a formatação de números e datas e a geometria dos gráficos.

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium, cada um com uma conta nova, e percorrem os fluxos inteiros: cadastro, entrar, sair, senha errada, e-mail repetido, uma conta sem ver a outra, excluir a conta, adicionar um FII e recarregar, somar uma segunda compra, lançar provento, ajustar a meta e abrir todas as páginas sem erros. Eles usam o banco do `.env.local` (a branch `dev` do Neon); no CI, um Postgres descartável.

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra ele
```

Os prints da landing (`public/landing/`) e do README (`docs/screenshots/`) também saem do Playwright, com uma carteira de exemplo:

```bash
SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts
```
