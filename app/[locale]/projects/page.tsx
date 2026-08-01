import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDb } from "@/lib/db";

const BASE_URL = "https://www.revy.my.id";

export const metadata: Metadata = {
  title: "Projects — M. Revi Ramadhan",
  description: "Projects by M. Revi Ramadhan — Framer templates, web apps, and design work.",
  openGraph: {
    type: "website",
    url: `${BASE_URL}/en/projects`,
    title: "Projects — M. Revi Ramadhan",
    description: "Framer templates, web apps, and design work by M. Revi Ramadhan.",
  },
  twitter: { card: "summary", title: "Projects — M. Revi Ramadhan", description: "Selected projects by M. Revi Ramadhan." },
  alternates: { canonical: `${BASE_URL}/en/projects` },
};

async function getProjects() {
  const db = getDb();
  const { data } = await db.from("projects").select("*").order("sort_order");
  return data || [];
}

export default async function ProjectsPage() {
  const t = await getTranslations("projects");
  const projects = await getProjects();

  return (
    <div className="space-y-16 lg:space-y-24 w-full">
      <section className="pt-8 pb-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading text-center lg:text-left">
          <span className="block">{t("title")}</span>
          <span className="block text-muted-foreground/20">{t("titleSub")}</span>
        </h1>
      </section>

      <section className="divide-y divide-border">
        {projects.map((p: Record<string, unknown>) => (
          <a key={p.id as string} href={p.href as string} target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-4 sm:gap-6 py-5 first:pt-0 last:pb-0 transition-all hover:bg-white/[0.02] rounded-lg">
            <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#f46c38" className="transform -rotate-45">
                <path d="M15 5l-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z" />
              </svg>
            </div>
            <div className="shrink-0 w-[90px] h-[65px] sm:w-[130px] sm:h-[90px] rounded-xl overflow-hidden bg-muted border border-border">
              {(p.image as string) && (
                <img src={p.image as string} alt={p.title as string}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[18px] sm:text-[24px] group-hover:text-primary transition-colors font-heading truncate">{p.title as string}</h3>
              <p className="text-muted-foreground text-[14px] sm:text-[16px] mt-0.5 line-clamp-2">{p.subtitle as string}</p>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
