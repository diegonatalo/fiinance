/**
 * Endereço público do site, sem barra final. Usado em metadados, robots e sitemap.
 * Para publicar em outro domínio, defina NEXT_PUBLIC_SITE_URL no build.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fiinance1.vercel.app"
).replace(/\/+$/, "");

/** Rotas públicas do app (mantenha em sincronia com app). */
export const ROUTES = ["/", "/carteira", "/proventos", "/calculadoras"];
