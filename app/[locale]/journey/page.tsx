import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDb } from "@/lib/db";

const BASE_URL = "https://revy.my.id";

export const metadata: Metadata = {
  title: "Journey — M. Revi Ramadhan",
  description: "My learning journey as a student and self-taught developer — M. Revi Ramadhan, SMAN 1 Bungo, Indonesia.",
  openGraph: {
    type: "website",
    url: `${BASE_URL}/en/journey`,
    title: "Journey — M. Revi Ramadhan",
    description: "My learning journey as a student and self-taught developer.",
  },
  twitter: { card: "summary", title: "Journey — M. Revi Ramadhan", description: "My learning journey as a student and self-taught developer." },
  alternates: { canonical: `${BASE_URL}/en/journey` },
};

async function getExperiences() {
  const db = getDb();
  const { data } = await db.from("journey").select("*").order("sort_order");
  return data || [];
}

export default async function JourneyPage() {
  const t = await getTranslations("journey");
  const experiences = await getExperiences();

  return (
    <div className="space-y-24 w-full">
      <section className="pt-8 pb-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading text-center sm:text-left">
          <span className="block">{t("title")}</span>
          <span className="block text-muted-foreground/20">{t("titleSub")}</span>
        </h1>
      </section>

      <section className="divide-y divide-border">
        {experiences.map((e: Record<string, unknown>) => (
          <div key={e.id as string} className="group flex flex-col gap-3 py-6 first:pt-0 last:pb-0 transition-all hover:bg-white/[0.02] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity mt-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f46c38" className="transform -rotate-45">
                  <path d="M15 5l-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="font-semibold text-[22px] sm:text-[24px] text-foreground font-heading">{e.company as string}</h3>
                  <p className="text-muted-foreground text-[14px] sm:text-[16px] shrink-0">{e.period as string}</p>
                </div>
                <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-relaxed">{e.description as string}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
