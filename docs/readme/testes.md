### 🧪 Testes

```bash
pnpm test
```

Usa [Vitest](https://vitest.dev). Os testes cobrem os cálculos da carteira (preço médio, número mágico, alocação, sugestão de aporte, proventos), a validação e a exportação dos dados, a formatação de números e datas a busca de cotações (com a rota do servidor) e o selo "Cotações de hoje".

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium e percorrem os fluxos inteiros: adicionar um FII e recarregar, somar uma segunda compra, receber as cotações sozinho (com a rota `/api/quotes` simulada), ajustar a meta de alocação, exportar e importar o backup, e abrir todas as páginas sem erros.

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra ele
```

Os prints da landing (`public/landing/`) e do README (`docs/screenshots/`) também saem do Playwright, com uma carteira de exemplo:

```bash
SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts
```
