<!-- Arquivo gerado pelo readme-kit. Não edite aqui: altere docs/readme/ e rode "readme-kit build". -->
<div align="center">

<img src="docs/assets/banner.svg" alt="FIInance: Sua carteira de FIIs em papel e tijolo. github.com/diegonatalo/fiinance. Stack: Next.js 16, React 19, TypeScript 6, Tailwind CSS 4" width="100%" />

<br />

<a href="https://fiinance1.vercel.app"><img src="docs/assets/btn-demo.svg" alt="Abrir o app ↗" height="46" /></a>
<a href="https://github.com/diegonatalo/fiinance"><img src="docs/assets/btn-code.svg" alt="Código ↗" height="46" /></a>

<br />

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript_6-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Privacidade](https://img.shields.io/badge/dados-na_sua_conta-7aa7ff?style=flat-square)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-16a34a?style=flat-square)

</div>

<br />

<div align="center">

<img src="docs/assets/h-sobre.svg" alt="01 · SOBRE: Sobre o projeto" width="100%" />

</div>

**Sua carteira de FIIs em papel e tijolo.**<br />
Acompanhe preço médio, proventos e meta de alocação, e simule novos aportes direto no navegador.

<br />

<div align="center">

<img src="docs/assets/h-demo.svg" alt="02 · DEMO: Demonstração" width="100%" />

</div>

<div align="center">

<sub>Capturas com dados fictícios, só para demonstração.</sub>

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/shot-01.svg" /><img src="docs/assets/shot-01-light.svg" alt="Painel com o total investido, a evolução, a meta de alocação e o peso de cada fundo" width="100%" /></picture>

<br />

<img src="docs/assets/shot-02.svg" alt="Tabela de fundos com cotas, preço médio, valor investido e peso" width="380" />
<br />
<sub><b>Carteira</b>: posição, preço médio e peso de cada fundo.</sub>

<br />

<img src="docs/assets/shot-03.svg" alt="Proventos dos últimos 12 meses em barras e os pagamentos de cada mês" width="380" />
<br />
<sub><b>Proventos</b>: renda mensal e histórico de pagamentos.</sub>

<br />

<img src="docs/assets/shot-04.svg" alt="Calculadoras de preço médio e número mágico lado a lado com seus resultados" width="100%" />
<br />
<sub><b>Calculadoras</b>: novo preço médio e número mágico.</sub>

<br />

<img src="docs/assets/shot-05.svg" alt="Painel no celular, com o patrimônio e a meta de alocação, e carteira no celular, com cada fundo em uma linha" width="100%" />
<br />
<sub><b>No celular</b>: o layout se adapta à tela.</sub>

</div>

<br />

<div align="center">

<img src="docs/assets/h-func.svg" alt="03 · FUNCIONALIDADES: O que dá para fazer" width="100%" />

</div>

<div align="center">

<img src="docs/assets/f-01.svg" alt="Operações: Lance compras e vendas. Cotas e preço médio saem delas, e comprar um ticker repetido soma à posição." width="49%" />
<img src="docs/assets/f-02.svg" alt="Proventos: O app confere quantas cotas você tinha na data e calcula renda mensal e yield on cost de 12 meses." width="49%" />
<br />
<img src="docs/assets/f-03.svg" alt="Meta de alocação: Defina quanto quer em papel e em tijolo e veja o aporte que falta para chegar lá." width="49%" />
<img src="docs/assets/f-04.svg" alt="Gráficos: Evolução do investido, peso de cada fundo, tijolo por segmento e papel por indexador." width="49%" />
<br />
<img src="docs/assets/f-05.svg" alt="Calculadoras: Número mágico e preço médio, já ligados à sua carteira, com opção de registrar a compra simulada." width="49%" />
<img src="docs/assets/f-06.svg" alt="Conta: E-mail e senha: a carteira fica salva no banco e aparece igual no celular e no computador." width="49%" />
<br />
<img src="docs/assets/f-07.svg" alt="Tema e celular: Tema claro ou escuro, barra de abas e uma carteira em lista no celular." width="49%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-stack.svg" alt="04 · STACK: Stack" width="100%" />

</div>

<div align="center">

<img src="docs/assets/stack.svg" alt="Stack: Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, drizzle-orm, better-auth, Phosphor Icons" width="100%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-run.svg" alt="05 · COMO RODAR: Rodando localmente" width="100%" />

</div>

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

<br />

<div align="center">

<img src="docs/assets/h-estrutura.svg" alt="06 · ESTRUTURA: Estrutura" width="100%" />

</div>

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

<br />

<div align="center">

<img src="docs/assets/h-mais.svg" alt="07 · MAIS: Mais informações" width="100%" />

</div>

### 🧩 Como adicionar uma página nova

1. Crie `app/nome/nome-page.tsx` exportando o componente da tela (com `"use client"` no topo).
2. Crie `app/nome/page.tsx`, importando e renderizando esse componente.
3. Inclua o item em `navItems`, no `components/app-shell.tsx`, para aparecer no menu.
4. Adicione o caminho em `ROUTES`, no `lib/site.ts`, para entrar no `sitemap.xml`.

### 🔒 Seus dados

O app pede uma conta (e-mail e senha, com o [Better Auth](https://www.better-auth.com)). A carteira fica no Postgres, ligada à conta, e aparece igual em qualquer aparelho.

Cada tabela do app tem a chave `(user_id, id)`, e cada Server Action confere a sessão e grava só nas linhas da própria pessoa. Dinheiro fica em centavos. Excluir a conta, em **Conta**, apaga tudo em cascata.

O app não busca cotações: os valores são sempre o que você investiu, a partir das compras e vendas que você lança.

### 🧠 Como funciona

O app guarda **operações**, e a posição de cada fundo é sempre derivada delas.

| Conceito | Regra |
|---|---|
| **Compra** | Soma as cotas e recalcula o preço médio ponderado. |
| **Venda** | Reduz as cotas e mantém o preço médio. Não deixa vender mais do que havia na data. |
| **Provento** | `valor por cota × cotas em carteira na data do pagamento`. |
| **Yield on cost (12m)** | Proventos dos últimos 12 meses ÷ total investido. |
| **Número mágico** | `⌈preço da cota ÷ provento por cota⌉`: cotas para o provento do mês comprar uma nova. |
| **Peso** | Fatia de cada fundo no total investido. O app não busca cotações. |
| **Aporte para a meta** | Menor compra em uma só classe que leva à proporção desejada: `(A + x) / (T + x) = alvo`. |

> Os valores servem para acompanhamento e não substituem a nota de corretagem nem o informe de
> rendimentos. O app não calcula imposto de renda.

### 🌐 Deploy

O app é publicado na [Vercel](https://vercel.com). O banco é o Postgres do Neon, ligado pela integração da Vercel, que cria a `DATABASE_URL` e a `DATABASE_URL_UNPOOLED`. Falta só o `BETTER_AUTH_SECRET` de produção. O script `vercel-build` aplica as migrações (`drizzle-kit migrate`) antes do `next build`, só na `main`. A landing fica em `/` e o app, que pede login, em `/app` (`/app/carteira`, `/app/proventos`, `/app/calculadoras`, `/app/conta`); os endereços antigos sem `/app` redirecionam com 308 (`lib/redirects.ts`). Atualizar a página em `/app/carteira`
funciona, e um endereço inexistente devolve a 404 do próprio app, com status 404.

Ao mudar de domínio, defina `NEXT_PUBLIC_SITE_URL` no build (ou altere o valor padrão em `lib/site.ts`). É ela que gera o `sitemap.xml`,
o `robots.txt` e as URLs absolutas de `og:image` e `twitter:image` usadas nos previews de links.

### 🧭 Próximos passos

- [ ] Lucro realizado e imposto de renda sobre vendas.
- [ ] Paginação do histórico de operações e de proventos, que cresce com o tempo.
- [ ] Recuperação de senha e confirmação de e-mail, com um serviço de e-mail.

### 📄 Créditos e licença

- Ícones do [Phosphor Icons](https://phosphoricons.com) e fontes [Geist](https://vercel.com/font).
- Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE).

<br />

<div align="center">

<img src="docs/assets/h-autor.svg" alt="08 · AUTOR: Autor" width="100%" />

</div>

<div align="center">

<a href="https://diegonatalo.dev"><img src="docs/assets/btn-portfolio.svg" alt="Portfólio ↗" height="46" /></a>
<a href="https://www.linkedin.com/in/diegonatalo/"><img src="docs/assets/btn-linkedin.svg" alt="LinkedIn ↗" height="46" /></a>
<a href="https://github.com/diegonatalo"><img src="docs/assets/btn-github.svg" alt="GitHub ↗" height="46" /></a>

</div>

<br />

<div align="center">

<img src="docs/assets/footer.svg" alt="© 2026 Diego Natalo. Feito com 🧱 para quem investe em FIIs." width="100%" />

</div>
