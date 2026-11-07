import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDb } from "@/lib/db";
import sanitizeHtml from "sanitize-html";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const BASE_URL = "https://www.revy.my.id";

// blog_posts.content is written via service-role (mrevi admin app, admin
// backoffice, seed scripts), so it is untrusted at render time: drop
// interactive/form elements and all attributes except a safe allowlist.
// sanitize-html never allows on* event handlers unless explicitly listed.
const allowedTags = sanitizeHtml.defaults.allowedTags.filter(
  (t) => !["form", "input", "button", "textarea", "select", "option", "style", "template"].includes(t)
);
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags,
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "id"],
    a: [...(sanitizeHtml.defaults.allowedAttributes.a || []), "rel"],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

interface BlogPost {
  id: string; title: string; excerpt: string;
  content: string; slug: string; date: string; read_time: string;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const db = getDb();
  const { data } = await db.from("blog_posts").select("*").eq("slug", slug).single();
  return data as BlogPost | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  const url = `${BASE_URL}/en/blog/${slug}`;
  return {
    title: `${post.title} — M. Revi Ramadhan`,
    description: post.excerpt,
    authors: [{ name: "M. Revi Ramadhan", url: BASE_URL }],
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: ["M. Revi Ramadhan"],
      images: [
        {
          url: `${BASE_URL}/og/blog/${slug}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${BASE_URL}/og/blog/${slug}`],
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("blog");
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto py-8 space-y-8 px-1">
      <Link href="/blog">
        <Button variant="ghost" size="sm">
          <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5 M12 19l-7-7 7-7" />
          </svg>
          {t("backToBlog")}
        </Button>
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{post.date}</Badge>
          <span className="text-sm text-muted-foreground">{post.read_time}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-heading leading-tight">{post.title}</h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
      </div>

      <Separator />

      <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
        {post.content ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content, SANITIZE_OPTIONS) }} />
        ) : (
          <p className="text-muted-foreground text-lg leading-relaxed">{post.excerpt}</p>
        )}
      </div>

      <Separator />

      <div className="flex justify-center">
        <Link href="/blog">
          <Button variant="outline">
            <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5 M12 19l-7-7 7-7" />
            </svg>
            {t("backToAllPosts")}
          </Button>
        </Link>
      </div>
    </article>
  );
}
