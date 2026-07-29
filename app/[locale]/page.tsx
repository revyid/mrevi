import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContactForm } from "@/components/contact-form";
import { getDb } from "@/lib/db";
import { getSettings } from "@/app/actions/content";

const BASE_URL = "https://revy.my.id";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings.profile_name || "M. Revi Ramadhan";
  const title = settings.profile_title || "Software Engineer";
  const bio = settings.profile_bio || "Software Engineer with 4 years of experience. Student at SMAN 1 Bungo, Indonesia.";
  const avatar = settings.profile_avatar || "";

  return {
    title: `${name} — ${title}`,
    description: bio,
    authors: [{ name, url: BASE_URL }],
    keywords: [
      "M. Revi Ramadhan", "Revi", "Muhammad Revi Ramadhan",
      "software engineer", "web developer", "portfolio",
      "SMAN 1 Bungo", "Indonesia", "Framer", "Next.js",
    ],
    openGraph: {
      type: "website",
      url: BASE_URL,
      title: `${name} — ${title}`,
      description: bio,
      siteName: name,
      images: avatar ? [{ url: avatar, width: 400, height: 400, alt: name }] : [],
    },
    twitter: {
      card: "summary",
      title: `${name} — ${title}`,
      description: bio,
      images: avatar ? [avatar] : [],
    },
    alternates: {
      canonical: BASE_URL,
      languages: { "x-default": BASE_URL },
    },
  };
}

async function getData() {
  const db = getDb();
  const [projectsRes, experiencesRes, toolsRes, blogRes] = await Promise.all([
    db.from("projects").select("*").order("sort_order"),
    db.from("journey").select("*").order("sort_order"),
    db.from("tools").select("*").order("sort_order"),
    db.from("blog_posts").select("*").order("sort_order"),
  ]);
  const settings = await getSettings();
  return {
    projects: projectsRes.data || [],
    experiences: experiencesRes.data || [],
    tools: toolsRes.data || [],
    blogPosts: blogRes.data || [],
    settings,
  };
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#f46c38" className="transform -rotate-45">
      <path d="M15 5l-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z" />
    </svg>
  );
}

function SectionTitle({ lines }: { lines: [string, string] }) {
  return (
    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading text-center sm:text-left">
      {lines[0]}<br />
      <span style={{ color: "rgba(182, 180, 189, 0.2)" }}>{lines[1]}</span>
    </h2>
  );
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const { projects, experiences, tools, blogPosts, settings } = await getData();

  const name    = settings.profile_name   || "M. Revi Ramadhan";
  const title   = settings.profile_title  || "Software Engineer";
  const bio     = settings.profile_bio    || "Self-taught developer and student at SMAN 1 Bungo, Indonesia.";
  const avatar  = settings.profile_avatar || "";

  // JSON-LD: Person schema for rich search results
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: "Revi",
    description: bio,
    url: "https://revy.my.id",
    image: avatar,
    jobTitle: title,
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "SMAN 1 Bungo",
      address: { "@type": "PostalAddress", addressCountry: "ID" },
    },
    address: { "@type": "PostalAddress", addressCountry: "ID" },
    sameAs: [
      settings.social_github    || "",
      settings.social_twitter   || "",
      settings.social_linkedin  || "",
      settings.social_instagram || "",
    ].filter((s) => s && s !== "#"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    <div className="space-y-24 w-full">
      {/* Hero */}
      <section className="pt-8 pb-4 flex flex-col justify-center text-center sm:text-left">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight mb-6 font-heading text-center sm:text-left">
          <span className="block">{settings.hero_title_1 || "SOFTWARE"}</span>
          <span className="block" style={{ color: "rgba(182, 180, 189, 0.2)" }}>{settings.hero_title_2 || "ENGINEER"}</span>
        </h1>
        <p className="text-muted-foreground text-[16px] max-w-xl leading-relaxed mb-10 mx-auto sm:mx-0">
          {settings.hero_description || t("heroDescription")}
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto sm:mx-0 text-center sm:text-left">
          {[
            { num: settings.stat_1_num || "+12", lines: (settings.stat_1_label || "YEARS OF\nEXPERIENCE").split("\n") },
            { num: settings.stat_2_num || "+46", lines: (settings.stat_2_label || "PROJECTS\nCOMPLETED").split("\n") },
            { num: settings.stat_3_num || "+20", lines: (settings.stat_3_label || "WORLDWIDE\nCLIENTS").split("\n") },
          ].map((stat) => (
            <div key={stat.num} className="space-y-1">
              <p className="text-3xl sm:text-5xl md:text-6xl font-semibold leading-none tracking-tight font-heading">{stat.num}</p>
              {stat.lines.map((line) => (
                <p key={line} className="text-muted-foreground text-[9px] sm:text-xs font-medium tracking-wider">{line}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Skill Cards */}
      <section className="grid sm:grid-cols-2 gap-4">
        {[
          {
            text: settings.skill_card_1_text || "DYNAMIC ANIMATION, MOTION DESIGN",
            href: settings.skill_card_1_href || "/journey",
            type: (settings.skill_card_1_type as "accent" | "primary") || "accent",
          },
          {
            text: settings.skill_card_2_text || "FRAMER, FIGMA, WORDPRESS, REACTJS",
            href: settings.skill_card_2_href || "/projects",
            type: (settings.skill_card_2_type as "accent" | "primary") || "primary",
          },
        ].map((card) => {
          const isAccent = card.type === "accent";
          return (
            <div key={card.type} className={`relative flex flex-col justify-between gap-12 overflow-hidden rounded-2xl px-6 py-6 text-white ${isAccent ? "bg-gradient-to-br from-orange-500 to-orange-600" : "bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10"}`}>
              <svg className="absolute -right-4 top-6 h-24 w-40 opacity-20" viewBox="0 0 200 100" fill="none">
                <path d={isAccent ? "M 0 60 C 40 10, 80 90, 130 30 S 220 20, 250 5" : "M 0 20 C 40 80, 80 5, 130 55 S 220 60, 250 90"} stroke={isAccent ? "white" : "currentColor"} strokeWidth="3" />
              </svg>
              {isAccent ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="relative opacity-80">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative opacity-80">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              )}
              <div className="flex items-end justify-between gap-3 relative z-10">
                <p className="text-[16px] font-medium leading-[120%] max-w-[70%]">{card.text}</p>
                <Link href={card.href as any} className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-all ${isAccent ? "border-white/30 bg-white/10 hover:bg-white hover:text-accent" : "border-primary-foreground/30 bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary"}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15 5l-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z" /></svg>
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {/* Projects */}
      <section className="space-y-8">
        <SectionTitle lines={[settings.section_projects_line1 || t("recentProjects"), settings.section_projects_line2 || t("recentProjectsSub")]} />
        <div className="divide-y divide-border">
          {projects.map((p: Record<string, unknown>) => (
            <a key={p.id as string} href={p.href as string} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-6 py-5 first:pt-0 last:pb-0 transition-all hover:bg-white/[0.02] rounded-lg">
              <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"><ArrowIcon /></div>
              <div className="shrink-0 w-[110px] h-[80px] sm:w-[130px] sm:h-[90px] rounded-xl overflow-hidden bg-muted border border-border">
                <img src={p.image as string} alt={p.title as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[24px] group-hover:text-primary transition-colors font-heading">{p.title as string}</h3>
                <p className="text-muted-foreground text-[16px] mt-0.5">{p.subtitle as string}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-8">
        <SectionTitle lines={[settings.section_experience_line1 || t("experienceTitle"), settings.section_experience_line2 || t("experienceSub")]} />
        <div className="divide-y divide-border">
          {experiences.map((e: Record<string, unknown>) => (
            <div key={e.id as string} className="group flex flex-col sm:flex-row sm:items-center gap-4 py-6 first:pt-0 last:pb-0">
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-[24px] text-foreground font-heading">{e.company as string}</h3>
                <p className="text-muted-foreground text-[16px] leading-relaxed max-w-2xl">{e.description as string}</p>
              </div>
              <p className="text-muted-foreground text-[16px] shrink-0 sm:text-right">{e.period as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-8">
        <SectionTitle lines={[settings.section_tools_line1 || t("premiumTools"), settings.section_tools_line2 || t("premiumToolsSub")]} />
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          {tools.map((tool: Record<string, unknown>) => (
            <a key={tool.id as string} href={tool.href as string} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-4 rounded-lg hover:bg-white/[0.03] transition-all">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <img src={tool.icon as string} alt={tool.name as string} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div>
                <h3 className="font-semibold text-[16px] group-hover:text-primary transition-colors font-heading">{tool.name as string}</h3>
                <p className="text-muted-foreground text-[14px] mt-0.5">{tool.category as string}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="space-y-8">
        <SectionTitle lines={[settings.section_blog_line1 || t("designThoughts"), settings.section_blog_line2 || t("designThoughtsSub")]} />
        <div className="divide-y divide-border">
          {blogPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t("noPosts")}</p>
          ) : (
            blogPosts.map((p: Record<string, unknown>) => (
              <Link key={p.id as string} href={`/blog/${p.slug as string}` as any} className="group flex items-start sm:items-center gap-6 py-6 first:pt-0 last:pb-0 transition-all hover:bg-white/[0.02] rounded-lg">
                <div className="shrink-0 mt-1 sm:mt-0 opacity-40 group-hover:opacity-100 transition-opacity"><ArrowIcon /></div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-[24px] group-hover:text-primary transition-colors font-heading">{p.title as string}</h3>
                  <p className="text-muted-foreground text-[16px] line-clamp-2 max-w-2xl">{p.excerpt as string}</p>
                </div>
                <div className="shrink-0 text-right hidden sm:block pl-4">
                  <p className="text-foreground text-[16px] font-medium">{p.date as string}</p>
                  <p className="text-muted-foreground text-[16px] mt-0.5">{p.read_time as string}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-8">
        <SectionTitle lines={[settings.section_contact_line1 || t("letsWork"), settings.section_contact_line2 || t("letsWorkSub")]} />
        <div className="max-w-xl mx-auto sm:mx-0">
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-border">
        <p className="text-muted-foreground text-[16px]">
          {settings.footer_credit_1_label && settings.footer_credit_1_href ? (
            <>
              Made by{" "}
              <a href={settings.footer_credit_1_href} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">{settings.footer_credit_1_label}</a>
              {settings.footer_credit_2_label && settings.footer_credit_2_href && (
                <> | Powered by <a href={settings.footer_credit_2_href} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">{settings.footer_credit_2_label}</a></>
              )}
            </>
          ) : (
            settings.footer_text || "Made by Templyo | Powered by Framer"
          )}
        </p>
      </footer>
    </div>
    </>
  );
}
