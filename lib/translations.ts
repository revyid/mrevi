/**
 * DB-backed translations (table: translations, see database/migrations/007_translations.sql).
 *
 * Key schemes:
 * - UI chrome: dotted keys from messages/en.json (e.g. `home.title`), seeded
 *   into `translations` as en source rows by scripts/seed-translations.mjs.
 * - DB content: `content:<table>:<rowId>:<field>` (e.g. content:projects:42:title).
 *   The en source is the base row in its own table (projects, journey, tools,
 *   blog_posts, navigation_links, ...); non-en locales live ONLY in
 *   `translations`. No en rows are seeded for content — stale detection hashes
 *   the current en base value directly.
 * - Site settings: `setting:<site_settings.key>` (e.g. setting:profile_name).
 *   Same rule: site_settings holds the en source, other locales overlay.
 *
 * A translation row is stale when source_hash !== hashText(en base text);
 * missing rows are stale too. Stale/missing content is machine-translated in
 * the background via after() on read-miss (see scheduleContentAutoTranslate).
 */
import "server-only";

import { createHash } from "node:crypto";
import { after } from "next/server";
import { getDb } from "@/lib/db";

export function hashText(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export const SUPPORTED_LOCALES = ["en", "id", "fr", "es", "de"] as const;

export function normalizeLocale(locale?: string | null): string {
  return locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)
    ? locale
    : "en";
}

export function contentKey(table: string, rowId: string, field: string): string {
  return `content:${table}:${rowId}:${field}`;
}

export function settingKey(setting: string): string {
  return `setting:${setting}`;
}

/**
 * Settings whose base value is not free text: structured JSON blobs
 * (showcase_demos, biz_products, ...), URLs/anchors, mail/phone, counters,
 * asset paths. Machine-translating them corrupts the value (MyMemory error
 * text once got stored as `setting:showcase_demos`), so they never overlay
 * and never queue for auto-translate.
 */
export function isTranslatableSetting(key: string, value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("#") || v.startsWith("mailto:") || v.startsWith("tel:") || v.startsWith("data:")) return false;
  if (/^\/[\w.-]+/.test(v) && !/\s/.test(v)) return false;
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(v)) return false;
  if (/^\+?\d+$/.test(v) || /^[\d\s()+.-]{7,}$/.test(v)) return false;
  if (/\.(png|jpe?g|webp|svg|gif|avif|css|js|html?)(\?\S*)?$/i.test(v)) return false;
  if (/_href|_url|_link|_image|_avatar|_email|_number|_count/.test(key)) return false;
  if (v[0] === "{" || v[0] === "[") {
    try {
      const p = JSON.parse(v);
      if (p && typeof p === "object") return false;
    } catch { /* not JSON — treat as text */ }
  }
  return true;
}

/** Parse `content:<table>:<rowId>:<field>` rows for one locale into Map<rowId, {field: text}>. */
export async function getContentTranslations(
  table: string,
  locale: string
): Promise<Map<string, Record<string, string>>> {
  const map = new Map<string, Record<string, string>>();
  if (locale === "en") return map;
  const prefix = `content:${table}:`;
  for (const r of await fetchRows(locale)) {
    if (!r.key.startsWith(prefix)) continue;
    const rest = r.key.slice(prefix.length);
    const idx = rest.lastIndexOf(":");
    if (idx <= 0) continue;
    const rowId = rest.slice(0, idx);
    const field = rest.slice(idx + 1);
    const rec = map.get(rowId) ?? {};
    rec[field] = r.text;
    map.set(rowId, rec);
  }
  return map;
}

/** Parse `setting:*` rows for one locale into {settingKey: text}. */
export async function getSettingsTranslations(
  locale: string
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (locale === "en") return out;
  for (const r of await fetchRows(locale)) {
    if (r.key.startsWith("setting:")) out[r.key.slice("setting:".length)] = r.text;
  }
  return out;
}

/** Stale `setting:*` keys: missing row or source_hash != hashText(en value). */
export async function getSettingsStale(
  locale: string,
  base: Record<string, string>
): Promise<string[]> {
  if (locale === "en") return [];
  const rows = await fetchRows(locale);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return Object.entries(base)
    .filter(([key, enText]) => {
      if (!enText || !isTranslatableSetting(key, enText)) return false;
      const cur = byKey.get(settingKey(key));
      return !cur || cur.source_hash !== hashText(enText);
    })
    .map(([key]) => key);
}

export async function ensureSettingsTranslations(
  locale: string,
  base: Record<string, string>
): Promise<number> {
  if (locale === "en") return 0;
  const stale = await getSettingsStale(locale, base);
  const db = getDb();
  let done = 0;
  for (const key of stale) {
    const enText = base[key];
    if (!enText) continue;
    const translated = await translateText(enText, "en", locale);
    if (!translated) continue;
    const { error } = await db.from("translations").upsert(
      {
        key: settingKey(key),
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

export function scheduleSettingsAutoTranslate(
  locale: string,
  base: Record<string, string>
): void {
  if (locale === "en") return;
  getSettingsStale(locale, base)
    .then((stale) => {
      if (stale.length === 0) return;
      try {
        after(async () => {
          await ensureSettingsTranslations(locale, base);
        });
      } catch {
        // after() unavailable outside request scope — skip.
      }
    })
    .catch(() => {});
}

type BaseRow = Record<string, unknown> & { id?: unknown; href?: unknown };

/**
 * Stale content keys for `table`/`locale`: a field is stale when the stored
 * row is missing or its source_hash differs from hashText(current en base).
 * `idKey` is the row identity field ("id", or "href" for navigation_links).
 */
export async function getContentStale(
  table: string,
  locale: string,
  baseRows: BaseRow[],
  fields: string[],
  idKey: string = "id"
): Promise<string[]> {
  if (locale === "en") return [];
  const rows = await fetchRows(locale);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const stale: string[] = [];
  for (const row of baseRows) {
    const rowId = String(row[idKey] ?? "");
    for (const field of fields) {
      const enText = String(row[field] ?? "");
      if (!enText) continue;
      const key = contentKey(table, rowId, field);
      const cur = byKey.get(key);
      if (!cur || cur.source_hash !== hashText(enText)) stale.push(key);
    }
  }
  return stale;
}

export async function ensureContentTranslations(
  table: string,
  locale: string,
  baseRows: BaseRow[],
  fields: string[],
  idKey: string = "id"
): Promise<number> {
  if (locale === "en") return 0;
  const stale = await getContentStale(table, locale, baseRows, fields, idKey);
  if (stale.length === 0) return 0;
  const enByKey = new Map<string, string>();
  for (const row of baseRows) {
    const rowId = String(row[idKey] ?? "");
    for (const field of fields) {
      enByKey.set(contentKey(table, rowId, field), String(row[field] ?? ""));
    }
  }
  const db = getDb();
  let done = 0;
  for (const key of stale) {
    const enText = enByKey.get(key);
    if (!enText) continue;
    const translated = await translateText(enText, "en", locale);
    if (!translated) continue;
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

/** Queue background auto-translate for stale content (no-op for en / fresh). */
export function scheduleContentAutoTranslate(
  table: string,
  locale: string,
  baseRows: BaseRow[],
  fields: string[],
  idKey: string = "id"
): void {
  if (locale === "en") return;
  getContentStale(table, locale, baseRows, fields, idKey)
    .then((stale) => {
      if (stale.length === 0) return;
      try {
        after(async () => {
          await ensureContentTranslations(table, locale, baseRows, fields, idKey);
        });
      } catch {
        // after() unavailable outside request scope — skip.
      }
    })
    .catch(() => {});
}

/** Overlay translated fields onto en base rows (returns new array). */
export async function overlayContent<T extends BaseRow>(
  table: string,
  locale: string,
  baseRows: T[],
  fields: string[],
  idKey: string = "id"
): Promise<T[]> {
  if (locale === "en") return baseRows;
  const map = await getContentTranslations(table, locale);
  return baseRows.map((row) => {
    const tr = map.get(String(row[idKey] ?? ""));
    if (!tr) return row;
    const out = { ...row } as Record<string, unknown>;
    for (const f of fields) if (tr[f] != null) out[f] = tr[f];
    return out as T;
  });
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
