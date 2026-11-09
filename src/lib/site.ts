/**
 * URL pública do site, sem barra final. Usada no sitemap, no robots e nas URLs
 * absolutas das imagens Open Graph. `VITE_SITE_URL` (nome antigo) continua
 * valendo para não quebrar deploys já configurados.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VITE_SITE_URL ??
  ""
).replace(/\/+$/, "");

/** Rotas públicas do app (mantenha em sincronia com src/app). */
export const ROTAS = ["/", "/carteira", "/proventos", "/calculadoras"];
