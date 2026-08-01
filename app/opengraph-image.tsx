import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/og-card";
import { poppinsFonts } from "@/components/og/fonts";

export const alt = "M. Revi Ramadhan — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgCard
      title="M. Revi Ramadhan"
      subtitle="Self-taught developer building web apps, tools, and templates — one line of code at a time."
      footer="revy.my.id"
    />,
    {
      ...size,
      fonts: await poppinsFonts(),
    }
  );
}
