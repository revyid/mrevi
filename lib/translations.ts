import "server-only";

import { createHash } from "node:crypto";
import { after } from "next/server";
import { getDb } from "@/lib/db";

export function hashText(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

type Row = {
  key: string;
  locale: string;
  text: string;
  source_hash: string | null;
  source_locale: string;
  is_machine: boolean;
};

async function fetchRows(locale: string): Promise<Row[]> {
  const db = getDb();
  const { data, error } = await db
    .from("translations")
    .select("key, locale, text, source_hash, source_locale, is_machine")
    .eq("locale", locale);
  if (error || !data) return [];
  return data as Row[];
}

function unflatten(flat: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [dotted, value] of Object.entries(flat)) {
    const parts = dotted.split(".");
    let node = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (typeof node[p] !== "object" || node[p] === null) node[p] = {};
      node = node[p] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
  return out;
}

async function fallbackJson(
  locale: string
): Promise<Record<string, unknown>> {
  try {
    return (await import(`../messages/${locale}.json`)).default;
  } catch {
    return (await import(`../messages/en.json`)).default;
  }
}

export async function getStaleKeys(locale: string): Promise<string[]> {
  if (locale === "en") return [];
  const [enRows, localeRows] = await Promise.all([
    fetchRows("en"),
    fetchRows(locale),
  ]);
  const byKey = new Map(localeRows.map((r) => [r.key, r]));
  return enRows
    .filter((r) => {
      const cur = byKey.get(r.key);
      return !cur || cur.source_hash !== hashText(r.text);
    })
    .map((r) => r.key);
}

export async function getTranslations(
  locale: string
): Promise<Record<string, unknown>> {
  try {
    const enRows = await fetchRows("en");
    // DB not seeded yet -> keep JSON behaviour, never crash.
    if (enRows.length === 0) return fallbackJson(locale);

    const enFlat: Record<string, string> = Object.fromEntries(
      enRows.map((r) => [r.key, r.text])
    );
    const flat: Record<string, string> = { ...enFlat };

    if (locale !== "en") {
      const rows = await fetchRows(locale);
      for (const r of rows) flat[r.key] = r.text;

      // Auto-translate after response so the user never waits on the API.
      const stale = enRows
        .filter((r) => {
          const cur = rows.find((x) => x.key === r.key);
          return !cur || cur.source_hash !== hashText(r.text);
        })
        .map((r) => r.key);
      if (stale.length > 0) {
        try {
          after(async () => {
            await ensureTranslations(locale);
          });
        } catch {
          // after() unavailable (e.g. outside request scope) — skip.
        }
      }
    }

    return unflatten(flat);
  } catch {
    return fallbackJson(locale);
  }
}

export async function translateText(
  text: string,
  from: string,
  to: string
): Promise<string | null> {
  try {
    const base =
      process.env.TRANSLATE_API_URL ??
      "https://api.mymemory.translated.net/get";
    const url = `${base}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(
      `${from.toUpperCase()}|${to.toUpperCase()}`
    )}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      responseData?: { translatedText?: string };
    };
    const out = json.responseData?.translatedText;
    return out && out.trim() ? out : null;
  } catch {
    return null;
  }
}

export async function ensureTranslations(locale: string): Promise<number> {
  if (locale === "en") return 0;
  const enRows = await fetchRows("en");
  const stale = await getStaleKeys(locale);
  if (stale.length === 0) return 0;

  const byKey = new Map(enRows.map((r) => [r.key, r.text]));
  const db = getDb();
  let done = 0;
  for (const key of stale) {
    const enText = byKey.get(key);
    if (!enText) continue;
    const translated = await translateText(enText, "en", locale);
    if (!translated) continue; // graceful: leave missing, English fallback stays
    const { error } = await db.from("translations").upsert(
      {
        key,
        locale,
        text: translated,
        source_hash: hashText(enText),
        source_locale: "en",
        is_machine: true,
      },
      { onConflict: "key,locale" }
    );
    if (!error) done++;
  }
  return done;
}
