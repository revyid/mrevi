import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/og-card";
import { poppinsFonts } from "@/components/og/fonts";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    <OgCard
      title="M. Revi Ramadhan"
      subtitle="Self-taught developer building web apps, tools, and templates — one line of code at a time."
      footer="revy.my.id"
    />,
    {
      width: 1200,
      height: 630,
      fonts: await poppinsFonts(),
    }
  );
}
