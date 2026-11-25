### 🌐 Deploy

O app é publicado na [Vercel](https://vercel.com). O banco é o Postgres do Neon, ligado pela integração da Vercel, que cria a `DATABASE_URL` e a `DATABASE_URL_UNPOOLED`. Falta só o `BETTER_AUTH_SECRET` de produção. O script `vercel-build` aplica as migrações (`drizzle-kit migrate`) antes do `next build`, só na `main`. A landing fica em `/` e o app, que pede login, em `/app` (`/app/carteira`, `/app/proventos`, `/app/calculadoras`, `/app/conta`); os endereços antigos sem `/app` redirecionam com 308 (`lib/redirects.ts`). Atualizar a página em `/app/carteira`
funciona, e um endereço inexistente devolve a 404 do próprio app, com status 404.

Ao mudar de domínio, defina `NEXT_PUBLIC_SITE_URL` no build (ou altere o valor padrão em `lib/site.ts`). É ela que gera o `sitemap.xml`,
o `robots.txt` e as URLs absolutas de `og:image` e `twitter:image` usadas nos previews de links.
