import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";

/* Sem URL pública não há como gerar URLs absolutas: o sitemap sai vazio. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: `${SITE_URL}${route}` }));
}
