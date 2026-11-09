### 🌐 Deploy

O app é publicado na [Vercel](https://vercel.com). A Vercel detecta o Next.js, então não há configuração extra. Atualizar a página em `/carteira`
funciona, e um endereço inexistente devolve a 404 do próprio app, com status 404.

Ao mudar de domínio, defina `NEXT_PUBLIC_SITE_URL` no build (ou altere o valor padrão em `lib/site.ts`). É ela que gera o `sitemap.xml`,
o `robots.txt` e as URLs absolutas de `og:image` e `twitter:image` usadas nos previews de links.
