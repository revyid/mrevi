import type { MetadataRoute } from "next";

const BASE_URL = "https://www.revy.my.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/en/admin", "/id/admin",
          "/en/profile", "/id/profile",
          "/en/login", "/id/login", "/en/register", "/id/register",
          "/coming-soon", "/maintenance", "/sandbox",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
