import { getTranslations, setRequestLocale } from "next-intl/server";

// Shared renderer for the standing legal pages (/privacy, /terms, /about).
// Section copy lives in messages/<locale>.json under legal.<ns> as h1..hN / p1..pN
// pairs; para content is rendered as-is for the draft review.
export async function LegalPage({ locale, ns }: { locale: string; ns: "privacy" | "terms" | "about" }) {
  setRequestLocale(locale);
  const t = await getTranslations(`legal.${ns}`);
  const tCommon = await getTranslations("legal");

  const sections: { h: string; p: string }[] = [];
  for (let i = 1; t.has(`h${i}`) && t.has(`p${i}`); i++) {
    sections.push({ h: t(`h${i}`), p: t(`p${i}`) });
  }

  return (
    <article className="max-w-2xl mx-auto space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight font-heading">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{tCommon("contactIntro")}</p>
      </header>
      {sections.map((s) => {
        const slug = s.h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return (
          <section key={s.h} id={slug} className={`legal-section legal-section--${slug} space-y-2`}>
          <h2 className="font-semibold text-lg font-heading">{s.h}</h2>
          {s.p.split("\n").map((line, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>
          ))}
          </section>
        )
      })}
    </article>
  );
}
