"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ensureTranslations, hashText } from "@/lib/translations";

async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}

export async function upsertTranslation(key: string, locale: string, text: string) {
  await requireAdmin();
  const db = getDb();
  const { data: enRow } = await db
    .from("translations")
    .select("text")
    .eq("key", key)
    .eq("locale", "en")
    .maybeSingle();
  const source_hash = enRow?.text ? hashText(enRow.text as string) : null;
  const { error } = await db.from("translations").upsert(
    { key, locale, text, source_hash, source_locale: "en", is_machine: false },
    { onConflict: "key,locale" }
  );
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function listTranslations(locale?: string) {
  await requireAdmin();
  const db = getDb();
  const target = locale ?? "id";
  const [{ data: rows }, { data: enRows }] = await Promise.all([
    db.from("translations").select("*").eq("locale", target).order("key"),
    db.from("translations").select("key, text").eq("locale", "en"),
  ]);
  const enByKey = new Map(
    ((enRows as Array<{ key: string; text: string }>) || []).map((r) => [r.key, r.text])
  );
  const all = new Map<string, Record<string, unknown>>();
  for (const r of (rows as Array<Record<string, unknown>>) || []) {
    const enText = enByKey.get(r.key as string) ?? "";
    const stale = !!enText && r.source_hash !== hashText(enText);
    all.set(r.key as string, {
      ...r,
      source_text: enText,
      status: !r.text ? "missing" : stale ? "stale" : r.is_machine ? "machine-translated" : "ok",
    });
  }
  // Keys present in English but missing entirely in target locale.
  for (const [key, enText] of enByKey) {
    if (!all.has(key)) all.set(key, { key, locale: target, text: null, source_text: enText, status: "missing" });
  }
  return [...all.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
}

export async function autoTranslateMissing(locale: string) {
  await requireAdmin();
  const count = await ensureTranslations(locale);
  if (count > 0) revalidatePath("/", "layout");
  return { success: true, count, error: undefined as string | undefined };
}
