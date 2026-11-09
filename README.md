<!-- Arquivo gerado pelo readme-kit. Não edite aqui: altere docs/readme/ e rode "readme-kit build". -->
<div align="center">

<img src="docs/assets/banner.svg" alt="FIInance: Sua carteira de FIIs, sem planilha. github.com/diegonatalo/fiinance. Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4" width="100%" />

<br />

<a href="https://fiinance1.vercel.app"><img src="docs/assets/btn-demo.svg" alt="Abrir o app ↗" height="46" /></a>
<a href="https://github.com/diegonatalo/fiinance"><img src="docs/assets/btn-code.svg" alt="Código ↗" height="46" /></a>

<br />

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Privacidade](https://img.shields.io/badge/dados-s%C3%B3_no_seu_navegador-10b981?style=flat-square)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-16a34a?style=flat-square)

</div>

<br />

<div align="center">

<img src="docs/assets/h-sobre.svg" alt="01 · SOBRE: Sobre o projeto" width="100%" />

</div>

**Sua carteira de FIIs, sem planilha.**<br />
Acompanhe preço médio, proventos e meta de alocação, e simule novos aportes direto no navegador.

<br />

<div align="center">

<img src="docs/assets/h-demo.svg" alt="02 · DEMO: Demonstração" width="100%" />

</div>

<div align="center">

<sub>Capturas com dados fictícios, só para demonstração.</sub>

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/shot-01.svg" /><img src="docs/assets/shot-01-light.svg" alt="Painel com resumo da carteira, meta de alocação, gráficos de distribuição e evolução dos aportes" width="380" /></picture>

<br />

<img src="docs/assets/shot-02.svg" alt="Tabela de ativos com cotas, preço médio, cotação e resultado" width="100%" />
<br />
<sub><b>Carteira</b>: posição, cotação e resultado de cada fundo.</sub>

<br />

<img src="docs/assets/shot-03.svg" alt="Formulário de proventos, gráfico dos últimos 12 meses e histórico" width="100%" />
<br />
<sub><b>Proventos</b>: renda mensal e histórico de pagamentos.</sub>

<br />

<img src="docs/assets/shot-04.svg" alt="Calculadoras de Magic Number e de Preço Médio lado a lado com seus resultados" width="100%" />
<br />
<sub><b>Calculadoras</b>: Magic Number e novo preço médio.</sub>

<br />

<img src="docs/assets/shot-05.svg" alt="Painel no celular, com os cartões de resumo empilhados, e carteira no celular, com cada ativo em um cartão" width="100%" />
<br />
<sub><b>No celular</b>: o layout se adapta à tela.</sub>

</div>

<br />

<div align="center">

<img src="docs/assets/h-func.svg" alt="03 · FUNCIONALIDADES: O que dá para fazer" width="100%" />

</div>

<div align="center">

<img src="docs/assets/f-01.svg" alt="Operações: Lance compras e vendas. Cotas e preço médio saem delas, e comprar um ticker repetido soma à posição." width="49%" />
<img src="docs/assets/f-02.svg" alt="Resultado: Informe a cotação de cada fundo e veja valor atual e lucro ou prejuízo, em R$ e em %." width="49%" />
<br />
<img src="docs/assets/f-03.svg" alt="Proventos: O app confere quantas cotas você tinha na data e calcula renda mensal e yield on cost de 12 meses." width="49%" />
<img src="docs/assets/f-04.svg" alt="Meta de alocação: Defina quanto quer em papel e em tijolo e veja o aporte que falta para chegar lá." width="49%" />
<br />
<img src="docs/assets/f-05.svg" alt="Gráficos: Distribuição por ativo, tipo, segmento e indexador, mais a evolução dos aportes mês a mês." width="49%" />
<img src="docs/assets/f-06.svg" alt="Calculadoras: Magic Number e Preço Médio, já ligadas à sua carteira, com opção de registrar a compra simulada." width="49%" />
<br />
<img src="docs/assets/f-07.svg" alt="Backup: Exporte tudo em JSON, as operações em CSV, e importe quando precisar." width="49%" />
<img src="docs/assets/f-08.svg" alt="Tema e celular: Tema claro ou escuro, e uma tabela que vira cartões em telas pequenas." width="49%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-stack.svg" alt="04 · STACK: Stack" width="100%" />

</div>

<div align="center">

<img src="docs/assets/stack.svg" alt="Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Recharts, Phosphor Icons" width="100%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-run.svg" alt="05 · COMO RODAR: Rodando localmente" width="100%" />

</div>

Requer [Node.js](https://nodejs.org) e [pnpm](https://pnpm.io).

```bash
git clone https://github.com/diegonatalo/fiinance.git
cd fiinance
pnpm install
pnpm dev        # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento, também acessível pela rede local |
| `pnpm build` | Checa os tipos e gera o build de produção em `.next/` |
| `pnpm start` | Serve o build de produção |
| `pnpm lint` | Roda o ESLint |

### 🔑 Variáveis de ambiente

Há uma só, e é opcional. O modelo está em [`.env.example`](.env.example).

| Variável | Descrição | Se não for definida |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, sem barra final. | Usa `https://fiinance1.vercel.app` (valor padrão em `lib/site.ts`). |

<br />

<div align="center">

<img src="docs/assets/h-estrutura.svg" alt="06 · ESTRUTURA: Estrutura" width="100%" />

</div>

```text
├── app/          rotas do Next (App Router): layout, páginas, 404, robots e sitemap;
│                 a tela de cada rota fica ao lado do page.tsx (carteira-page.tsx…)
├── types/        tipos do domínio: Ativo, Transacao, Provento, Dados
├── lib/          lógica pura: posição, resumo, proventos, metas,
│                 calculadoras, validação e migração dos dados, exportação, contextos
├── hooks/        use-carteira (estado e ações), use-local-storage, use-theme
└── components/   interface (ui/: Button, Card, Modal, Field, Input), providers
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
4. Adicione o caminho em `ROTAS`, no `lib/site.ts`, para entrar no `sitemap.xml`.

### 🔒 Seus dados

Não há servidor nem conta. Tudo é salvo no `localStorage` do navegador, na chave `fiinance:dados`.

Limpar os dados do navegador apaga a carteira, então use **Carteira → Backup dos dados** de vez em quando.
Ao ler, o app valida o conteúdo, e um backup corrompido não derruba a tela.

Para buscar cotações, o app consulta a [brapi](https://brapi.dev), que exige um token para FIIs.
Sem ele a API responde 401, e dá para digitar a cotação à mão. O token fica só no navegador e não entra no backup.

### 🧠 Como funciona

O app guarda **operações**, e a posição de cada fundo é sempre derivada delas.

| Conceito | Regra |
|---|---|
| **Compra** | Soma as cotas e recalcula o preço médio ponderado. |
| **Venda** | Reduz as cotas e mantém o preço médio. Não deixa vender mais do que havia na data. |
| **Provento** | `valor por cota × cotas em carteira na data do pagamento`. |
| **Yield on cost (12m)** | Proventos dos últimos 12 meses ÷ total investido. |
| **Magic Number** | `⌈cotação ÷ dividendo por cota⌉`: cotas para os dividendos comprarem uma nova por mês. |
| **Aporte para a meta** | Menor compra em uma só classe que leva à proporção desejada: `(A + x) / (T + x) = alvo`. |

> Os valores servem para acompanhamento e não substituem a nota de corretagem nem o informe de
> rendimentos. O app não calcula imposto de renda.

### 🌐 Deploy

O app é publicado na [Vercel](https://vercel.com). A Vercel detecta o Next.js, então não há configuração extra. Atualizar a página em `/carteira`
funciona, e um endereço inexistente devolve a 404 do próprio app, com status 404.

Ao mudar de domínio, defina `NEXT_PUBLIC_SITE_URL` no build (ou altere o valor padrão em `lib/site.ts`). É ela que gera o `sitemap.xml`,
o `robots.txt` e as URLs absolutas de `og:image` e `twitter:image` usadas nos previews de links.

### 🧭 Próximos passos

- [ ] Testes automatizados e CI, que ainda não existem.
- [ ] Importar cotações e proventos sem token, o que pede um proxy próprio por causa do CORS.
- [ ] Lucro realizado e imposto de renda sobre vendas.
- [ ] Paginação do histórico de operações e de proventos, que cresce com o tempo.
- [ ] Sincronização entre dispositivos. Hoje o caminho é o backup em JSON.

### 📄 Créditos e licença

- Ícones do [Phosphor Icons](https://phosphoricons.com), gráficos com [Recharts](https://recharts.org)
e cotações opcionais pela [brapi](https://brapi.dev).
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

<img src="docs/assets/footer.svg" alt="© 2026 Diego Natalo. Feito com 💚 para quem investe em FIIs." width="100%" />

</div>
