Requer [Node.js](https://nodejs.org), [pnpm](https://pnpm.io) e um banco Postgres (o projeto usa o [Neon](https://neon.tech)).

```bash
git clone https://github.com/diegonatalo/fiinance.git
cd fiinance
pnpm install
cp .env.example .env.local   # preencha o banco de desenvolvimento e o segredo
pnpm db:migrate              # cria as tabelas
pnpm dev                     # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento, também acessível pela rede local |
| `pnpm build` | Checa os tipos e gera o build de produção em `.next/` |
| `pnpm start` | Serve o build de produção |
| `pnpm lint` | Roda o ESLint |
| `pnpm test:e2e` | Roda os testes de ponta a ponta (Playwright) |
| `pnpm db:generate` | Gera a migração em `drizzle/` depois de mudar `lib/db/schema.ts` |
| `pnpm db:migrate` | Aplica as migrações no banco do `.env.local` |

### 🔑 Variáveis de ambiente

O modelo está em [`.env.example`](.env.example). Em desenvolvimento, o banco precisa ser de uma branch `dev` do Neon, com o nome terminando em `_dev`: com qualquer outro, o `pnpm dev`, as migrações e o E2E param (`lib/dev-database.ts`).

| Variável | Descrição | Se não for definida |
|---|---|---|
| `DATABASE_URL` | URL do Postgres (no Neon, a com pooler). | O app não abre. |
| `DATABASE_URL_UNPOOLED` | URL sem pooler, usada pelas migrações. | As migrações usam a `DATABASE_URL`. |
| `BETTER_AUTH_SECRET` | Segredo que assina os cookies de sessão; um diferente em cada ambiente. | O login não funciona. |
| `BETTER_AUTH_URL` | Endereço local, sem barra final (só em desenvolvimento e nos testes). | Na Vercel, vale o `SITE_URL`. |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, sem barra final. | Usa `https://fiinance1.vercel.app` (valor padrão em `lib/site.ts`). |
