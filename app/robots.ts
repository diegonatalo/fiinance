import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // o app pede login e a API não é página
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
