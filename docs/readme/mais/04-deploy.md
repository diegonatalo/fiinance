### 🌐 Deploy

O app é publicado na [Vercel](https://vercel.com). O `vercel.json` redireciona qualquer rota para o
`index.html`, porque o app usa `BrowserRouter`. Em outro host, configure o mesmo *SPA fallback*;
sem ele, atualizar a página em `/carteira` retorna 404.

Ao mudar de domínio, atualize `VITE_SITE_URL` em `.env.production`. É ela que gera o `sitemap.xml`,
o `robots.txt` e as URLs absolutas de `og:image` e `twitter:image` usadas nos previews de links.
