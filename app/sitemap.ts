import type { MetadataRoute } from "next";
import { ROTAS, SITE_URL } from "@/lib/site";

/* Sem URL pública não há como gerar URLs absolutas: o sitemap sai vazio. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROTAS.map((rota) => ({ url: `${SITE_URL}${rota}` }));
}
