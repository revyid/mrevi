import { ImageResponse } from "next/og";
import { getDb } from "@/lib/db";
import { OgCard } from "@/components/og/og-card";
import { poppinsFonts } from "@/components/og/fonts";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let title = "";
  let excerpt = "";
  try {
    const db = getDb();
    const { data } = await db
      .from("blog_posts")
      .select("title, excerpt")
      .eq("slug", slug)
      .single();
    if (data) {
      title = String(data.title || "");
      excerpt = String(data.excerpt || "").slice(0, 140);
    }
  } catch {
    // DB unavailable — fall back to a generic card
  }

  return new ImageResponse(
    <OgCard
      title={title || "Revy's Blog"}
      subtitle={excerpt || "A post on the revy.my.id blog."}
      footer={`revy.my.id/blog/${slug}`}
    />,
    {
      width: 1200,
      height: 630,
      fonts: await poppinsFonts(),
    }
  );
}
