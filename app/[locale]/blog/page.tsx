import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDb } from "@/lib/db";

async function getBlogPosts() {
  const db = getDb();
  const { data } = await db.from("blog_posts").select("*").order("sort_order");
  return data || [];
}

export default async function BlogPage() {
  const t = await getTranslations("blog");
  const posts = await getBlogPosts();

  return (
    <div className="space-y-24 w-full">
      <section className="pt-8 pb-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading">
          <span className="block">{t("title")}</span>
          <span className="block text-muted-foreground/20">{t("titleSub")}</span>
        </h1>
      </section>

      <section className="divide-y divide-border">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">{t("noPosts")}</p>
        ) : (
          posts.map((post: Record<string, unknown>) => (
            <Link
              key={post.id as string}
              href={`/blog/${post.slug as string}` as any}
              className="group flex items-start sm:items-center gap-6 py-6 first:pt-0 last:pb-0 transition-all hover:bg-white/[0.02] rounded-lg"
            >
              <div className="shrink-0 mt-1 sm:mt-0 opacity-40 group-hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-45 text-accent">
                  <path d="M15 5l-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-[24px] group-hover:text-accent transition-colors font-heading">
                  {post.title as string}
                </h3>
                <p className="text-muted-foreground text-[16px] line-clamp-2 max-w-2xl">
                  {post.excerpt as string}
                </p>
              </div>
              <div className="shrink-0 text-right hidden sm:block pl-4">
                <p className="text-foreground text-[16px] font-medium">{post.date as string}</p>
                <p className="text-muted-foreground text-[16px] mt-0.5">{post.read_time as string}</p>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
