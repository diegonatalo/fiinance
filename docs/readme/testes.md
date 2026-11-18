### 🧪 Testes

```bash
pnpm test
```

Usa [Vitest](https://vitest.dev). Os testes cobrem os cálculos da carteira (preço médio, número mágico, alocação, sugestão de aporte, proventos), a validação e a exportação dos dados, a formatação de números e datas e a busca de cotações.

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium e percorrem os fluxos inteiros: adicionar um FII e recarregar, somar uma segunda compra, buscar cotações (com a brapi simulada), exportar e importar o backup, e abrir todas as páginas sem erros.

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra ele
```
