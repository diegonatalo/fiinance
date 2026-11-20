### 🌐 Deploy

O app é publicado na [Vercel](https://vercel.com). A Vercel detecta o Next.js, então não há configuração extra. A landing fica em `/` e o app em `/app` (`/app/carteira`, `/app/proventos`, `/app/calculadoras`); os endereços antigos sem `/app` redirecionam com 308 (`lib/redirects.ts`). Atualizar a página em `/app/carteira`
funciona, e um endereço inexistente devolve a 404 do próprio app, com status 404.

Ao mudar de domínio, defina `NEXT_PUBLIC_SITE_URL` no build (ou altere o valor padrão em `lib/site.ts`). É ela que gera o `sitemap.xml`,
o `robots.txt` e as URLs absolutas de `og:image` e `twitter:image` usadas nos previews de links.
