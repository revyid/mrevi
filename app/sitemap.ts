import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";

const BASE_URL = "https://revy.my.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/en`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/en/projects`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/en/experience`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/en/tools`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/en/blog`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/en/contact`,    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
  ];

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const db = getDb();
    const { data: posts } = await db
      .from("blog_posts")
      .select("slug, updated_at")
      .order("sort_order");

    if (posts) {
      blogPages = posts.map((post: { slug: string; updated_at: string }) => ({
        url: `${BASE_URL}/en/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // DB unavailable during build — skip dynamic pages
  }

  return [...staticPages, ...blogPages];
}
