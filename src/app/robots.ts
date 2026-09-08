import type { MetadataRoute } from "next";
import { appBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = appBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/cadastro",
        "/perfil",
        "/comprar",
        "/laboratorio",
        "/api/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
