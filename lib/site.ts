/**
 * Endereço público do site, sem barra final. Usado em metadados, robots e sitemap.
 * Para publicar em outro domínio, defina NEXT_PUBLIC_SITE_URL no build.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fiinance1.vercel.app"
).replace(/\/+$/, "");

/** Rotas públicas, usadas pelo sitemap (mantenha em sincronia com app). */
export const ROUTES = ["/", "/app", "/app/carteira", "/app/proventos", "/app/calculadoras", "/privacidade", "/termos"];

/**
 * Contato para pedidos sobre dados pessoais (LGPD, art. 18), mostrado em `/privacidade`.
 * TODO: trocar pelo e-mail definitivo; o standard-kit avisa enquanto este for o provisório.
 */
export const PRIVACY_EMAIL = "contato@exemplo.com.br";

/** Repositório público, no rodapé. */
export const SOURCE_URL = "https://github.com/diegonatalo/fiinance";

export const SITE_NAME = "FIInance";

/** Cor da barra do navegador em cada tema (o fundo da página). */
export const THEME_COLORS = { light: "#f5f4f0", dark: "#0b0d10" } as const;
export const SITE_DESCRIPTION =
  "Gerencie sua carteira de Fundos Imobiliários (FIIs) com gráficos e cálculos de alocação.";
