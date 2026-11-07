import { getTranslations, setRequestLocale } from "next-intl/server";

// Shared renderer for the standing legal pages (/privasi, /syarat, /tentang).
// Section copy lives in messages/<locale>.json under legal.<ns> as h1..hN / p1..pN
// pairs; para content is rendered as-is for the draft review.
export async function LegalPage({ locale, ns }: { locale: string; ns: "privasi" | "syarat" | "tentang" }) {
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
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tCommon("draftNotice")}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight font-heading">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{tCommon("contactIntro")}</p>
      </header>
      {sections.map((s) => (
        <section key={s.h} className="space-y-2">
          <h2 className="font-semibold text-lg font-heading">{s.h}</h2>
          {s.p.split("\n").map((line, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
