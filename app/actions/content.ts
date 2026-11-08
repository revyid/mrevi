"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  normalizeLocale,
  hashText,
  contentKey,
  settingKey,
  getSettingsTranslations,
  overlayContent,
  scheduleContentAutoTranslate,
  scheduleSettingsAutoTranslate,
} from "@/lib/translations";

// Translatable (free-text) fields per base table. Non-text fields (href,
// image, icon, slug, dates) are never translated: for a non-en locale they
// are ignored on write and never overlaid on read.
const CONTENT_FIELDS: Record<string, string[]> = {
  projects: ["title", "subtitle"],
  journey: ["company", "description", "period"],
  tools: ["name", "category"],
  blog_posts: ["title", "excerpt", "content"],
  navigation_links: ["label"],
};

/** Write one translation row; source_hash pins the current en base value. */
async function upsertContentTranslation(
  table: string,
  rowId: string,
  field: string,
  value: string,
  locale: string,
  idKey: string = "id",
  idValue?: string
) {
  const db = getDb();
  const { data: base } = await db
    .from(table)
    .select(field)
    .eq(idKey, idValue ?? rowId)
    .maybeSingle();
  const enText = String((base as Record<string, unknown> | null)?.[field] ?? "");
  const { error } = await db.from("translations").upsert(
    {
      key: contentKey(table, rowId, field),
      locale,
      text: value,
      source_hash: hashText(enText),
      source_locale: "en",
      is_machine: false,
    },
    { onConflict: "key,locale" }
  );
  return error;
}

async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}

// ============================================================
// SITE SETTINGS
// ============================================================

export async function getSettings(locale: string = "en"): Promise<Record<string, string>> {
  const loc = normalizeLocale(locale);
  const db = getDb();
  const { data } = await db.from("site_settings").select("*");
  if (!data) return {};
  const base = Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]));
  if (loc === "en") return base;
  const overlay = await getSettingsTranslations(loc);
  const merged = { ...base, ...overlay };
  scheduleSettingsAutoTranslate(loc, base);
  return merged;
}

export async function updateSettings(settings: Record<string, string>, locale: string = "en") {
  await requireAdmin();
  const loc = normalizeLocale(locale);
  const db = getDb();
  if (loc !== "en") {
    // Non-en: write only translation rows, pinning source_hash to the en base.
    const keys = Object.keys(settings);
    const { data: baseRows } = await db.from("site_settings").select("key, value").in("key", keys);
    const enByKey = new Map(
      (baseRows || []).map((r: { key: string; value: string }) => [r.key, r.value])
    );
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await db.from("translations").upsert(
        {
          key: settingKey(key),
          locale: loc,
          text: value,
          source_hash: hashText(String(enByKey.get(key) ?? "")),
          source_locale: "en",
          is_machine: false,
        },
        { onConflict: "key,locale" }
      );
      if (error) return { success: false, error: error.message };
    }
    revalidatePath("/", "layout");
    return { success: true, error: undefined as string | undefined };
  }
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
  const { error } = await db.from("site_settings").upsert(rows, { onConflict: "key" });
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

// ============================================================
// DERIVED HELPERS (thin wrappers around getSettings)
// ============================================================

/** Returns social link hrefs keyed by platform name. */
export async function getSocialLinks(locale: string = "en"): Promise<{
  facebook: string;
  twitter: string;
  instagram: string;
  email: string;
  github: string;
  linkedin: string;
}> {
  const s = await getSettings(locale);
  return {
    facebook:  s.social_facebook  || "#",
    twitter:   s.social_twitter   || "#",
    instagram: s.social_instagram || "#",
    email:     s.social_email     || "#",
    github:    s.social_github    || "#",
    linkedin:  s.social_linkedin  || "#",
  };
}

/** Returns the two skill-card objects shown below the hero (only configured ones). */
export async function getSkillCards(locale: string = "en"): Promise<Array<{
  text: string;
  href: string;
  type: "accent" | "primary";
}>> {
  const s = await getSettings(locale);
  return [
    {
      text: s.skill_card_1_text || "",
      href: s.skill_card_1_href || "/journey",
      type: (s.skill_card_1_type as "accent" | "primary") || "accent",
    },
    {
      text: s.skill_card_2_text || "",
      href: s.skill_card_2_href || "/projects",
      type: (s.skill_card_2_type as "accent" | "primary") || "primary",
    },
  ].filter((card) => card.text.trim());
}

/** Returns the navigation link labels from the navigation_links table. */
export async function getNavigationLinks(locale: string = "en"): Promise<
  Array<{ href: string; label: string; icon: string; sort_order: number; is_visible: boolean }>
> {
  const loc = normalizeLocale(locale);
  const db = getDb();
  const { data } = await db
    .from("navigation_links")
    .select("*")
    .order("sort_order");
  const base = data || [];
  if (loc === "en") return base;
  scheduleContentAutoTranslate("navigation_links", loc, base, CONTENT_FIELDS.navigation_links, "href");
  return overlayContent("navigation_links", loc, base, CONTENT_FIELDS.navigation_links, "href");
}

export async function updateNavigationLink(href: string, label: string, newHref?: string, locale: string = "en") {
  await requireAdmin();
  const loc = normalizeLocale(locale);
  if (loc !== "en") {
    // href is the row identity — only the label is translatable.
    const error = await upsertContentTranslation("navigation_links", href, "label", label, loc, "href", href);
    if (!error) revalidatePath("/", "layout");
    return { success: !error, error: error?.message };
  }
  const db = getDb();
  const update: Record<string, string> = { label };
  if (newHref && newHref !== href) update.href = newHref;
  const { error } = await db.from("navigation_links").update(update).eq("href", href);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function updateNavigationLinkVisibility(href: string, is_visible: boolean) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("navigation_links").update({ is_visible }).eq("href", href);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function createNavigationLink(data: {
  href: string;
  label: string;
  icon: string;
  sort_order: number;
}) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("navigation_links").insert({ ...data, is_visible: true });
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function deleteNavigationLink(href: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("navigation_links").delete().eq("href", href);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function reorderNavigationLinks(items: { href: string; sort_order: number }[]) {
  await requireAdmin();
  const db = getDb();
  await Promise.all(
    items.map(({ href, sort_order }) =>
      db.from("navigation_links").update({ sort_order }).eq("href", href)
    )
  );
  revalidatePath("/", "layout");
  return { success: true };
}

// ============================================================
// THEME
// ============================================================

const THEME_KEYS = [
  "theme_primary",
  "theme_background",
  "theme_foreground",
  "theme_card",
  "theme_muted",
  "theme_accent",
  "theme_border",
  "theme_ring",
  "theme_destructive",
  "theme_radius",
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];

export async function getTheme(): Promise<Record<string, string>> {
  const db = getDb();
  const { data } = await db.from("site_settings").select("*").in("key", [...THEME_KEYS]);
  if (!data) return {};
  return Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]));
}

export async function updateTheme(theme: Record<string, string>) {
  await requireAdmin();
  const db = getDb();
  const rows = Object.entries(theme).map(([key, value]) => ({ key, value }));
  const { error } = await db.from("site_settings").upsert(rows, { onConflict: "key" });
  if (!error) { revalidatePath("/", "layout"); revalidatePath("/en"); }
  return { success: !error, error: error?.message };
}

// ============================================================
// CUSTOM PAGES
// ============================================================

export async function getCustomPages() {
  const db = getDb();
  const { data } = await db.from("custom_pages").select("*").order("sort_order");
  return data || [];
}

export async function createCustomPage(data: {
  title: string;
  slug: string;
  content: string;
  is_visible: boolean;
}) {
  await requireAdmin();
  const db = getDb();
  const { data: page, error } = await db
    .from("custom_pages")
    .insert({ ...data, sort_order: Date.now() })
    .select()
    .single();
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message, page };
}

export async function updateCustomPage(
  id: string,
  data: Partial<{ title: string; slug: string; content: string; is_visible: boolean }>
) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("custom_pages").update(data).eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function deleteCustomPage(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("custom_pages").delete().eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

// ============================================================
// PROJECTS
// ============================================================

export async function getProjects(locale: string = "en") {
  const loc = normalizeLocale(locale);
  const db = getDb();
  const { data } = await db.from("projects").select("*").order("sort_order");
  const base = data || [];
  if (loc === "en") return base;
  scheduleContentAutoTranslate("projects", loc, base, CONTENT_FIELDS.projects);
  return overlayContent("projects", loc, base, CONTENT_FIELDS.projects);
}

export async function createProject(data: {
  title: string;
  subtitle: string;
  href: string;
  image: string;
}) {
  await requireAdmin();
  const db = getDb();
  const { data: project, error } = await db
    .from("projects")
    .insert(data)
    .select()
    .single();
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message, project };
}

export async function updateProject(id: string, field: string, value: string, locale: string = "en") {
  await requireAdmin();
  const loc = normalizeLocale(locale);
  if (loc !== "en") {
    if (!CONTENT_FIELDS.projects.includes(field)) return { success: true, error: undefined as string | undefined };
    const error = await upsertContentTranslation("projects", id, field, value, loc);
    if (!error) revalidatePath("/", "layout");
    return { success: !error, error: error?.message };
  }
  const db = getDb();
  const { error } = await db
    .from("projects")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("projects").delete().eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

// ============================================================
// EXPERIENCES
// ============================================================

export async function getExperiences(locale: string = "en") {
  const loc = normalizeLocale(locale);
  const db = getDb();
  const { data } = await db.from("journey").select("*").order("sort_order");
  const base = data || [];
  if (loc === "en") return base;
  scheduleContentAutoTranslate("journey", loc, base, CONTENT_FIELDS.journey);
  return overlayContent("journey", loc, base, CONTENT_FIELDS.journey);
}

export async function createExperience(data: {
  company: string;
  description: string;
  period: string;
}) {
  await requireAdmin();
  const db = getDb();
  const { data: exp, error } = await db
    .from("journey")
    .insert(data)
    .select()
    .single();
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message, experience: exp };
}

export async function updateExperience(id: string, field: string, value: string, locale: string = "en") {
  await requireAdmin();
  const loc = normalizeLocale(locale);
  if (loc !== "en") {
    if (!CONTENT_FIELDS.journey.includes(field)) return { success: true, error: undefined as string | undefined };
    const error = await upsertContentTranslation("journey", id, field, value, loc);
    if (!error) revalidatePath("/", "layout");
    return { success: !error, error: error?.message };
  }
  const db = getDb();
  const { error } = await db
    .from("journey")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("journey").delete().eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

// ============================================================
// TOOLS
// ============================================================

export async function getTools(locale: string = "en") {
  const loc = normalizeLocale(locale);
  const db = getDb();
  const { data } = await db.from("tools").select("*").order("sort_order");
  const base = data || [];
  if (loc === "en") return base;
  scheduleContentAutoTranslate("tools", loc, base, CONTENT_FIELDS.tools);
  return overlayContent("tools", loc, base, CONTENT_FIELDS.tools);
}

export async function createTool(data: {
  name: string;
  category: string;
  href: string;
  icon: string;
}) {
  await requireAdmin();
  const db = getDb();
  const { data: tool, error } = await db
    .from("tools")
    .insert(data)
    .select()
    .single();
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message, tool };
}

export async function updateTool(id: string, field: string, value: string, locale: string = "en") {
  await requireAdmin();
  const loc = normalizeLocale(locale);
  if (loc !== "en") {
    if (!CONTENT_FIELDS.tools.includes(field)) return { success: true, error: undefined as string | undefined };
    const error = await upsertContentTranslation("tools", id, field, value, loc);
    if (!error) revalidatePath("/", "layout");
    return { success: !error, error: error?.message };
  }
  const db = getDb();
  const { error } = await db
    .from("tools")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

export async function deleteTool(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("tools").delete().eq("id", id);
  if (!error) revalidatePath("/", "layout");
  return { success: !error, error: error?.message };
}

// ============================================================
// BLOG POSTS
// ============================================================

export async function getBlogPosts(locale: string = "en") {
  const loc = normalizeLocale(locale);
  const db = getDb();
  const { data } = await db.from("blog_posts").select("*").order("sort_order");
  const base = data || [];
  if (loc === "en") return base;
  scheduleContentAutoTranslate("blog_posts", loc, base, CONTENT_FIELDS.blog_posts);
  return overlayContent("blog_posts", loc, base, CONTENT_FIELDS.blog_posts);
}

export async function getBlogPost(slug: string, locale: string = "en") {
  const loc = normalizeLocale(locale);
  const db = getDb();
  const { data } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!data || loc === "en") return data;
  scheduleContentAutoTranslate("blog_posts", loc, [data], CONTENT_FIELDS.blog_posts);
  const [overlaid] = await overlayContent("blog_posts", loc, [data], CONTENT_FIELDS.blog_posts);
  return overlaid;
}

export async function createBlogPost(data: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  read_time: string;
}) {
  await requireAdmin();
  const db = getDb();
  const { data: post, error } = await db
    .from("blog_posts")
    .insert(data)
    .select()
    .single();
  if (!error) {
    revalidatePath("/", "layout");
    revalidatePath("/blog", "layout");
  }
  return { success: !error, error: error?.message, post };
}

export async function updateBlogPost(id: string, field: string, value: string, locale: string = "en") {
  await requireAdmin();
  const loc = normalizeLocale(locale);
  if (loc !== "en") {
    if (!CONTENT_FIELDS.blog_posts.includes(field)) return { success: true, error: undefined as string | undefined };
    const error = await upsertContentTranslation("blog_posts", id, field, value, loc);
    if (!error) {
      revalidatePath("/", "layout");
      revalidatePath("/blog", "layout");
    }
    return { success: !error, error: error?.message };
  }
  const db = getDb();
  const { error } = await db
    .from("blog_posts")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) {
    revalidatePath("/", "layout");
    revalidatePath("/blog", "layout");
  }
  return { success: !error, error: error?.message };
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (!error) {
    revalidatePath("/", "layout");
    revalidatePath("/blog", "layout");
  }
  return { success: !error, error: error?.message };
}


// ============================================================
// PAGE SETTINGS
// ============================================================

export interface PageSetting {
  id: string;
  path: string;
  label: string;
  status: "live" | "maintenance" | "coming_soon" | "hidden";
  access_role: "public" | "user" | "admin";
}

export async function getPageSettings(): Promise<PageSetting[]> {
  await requireAdmin();
  const db = getDb();
  const { data } = await db.from("page_settings").select("*").order("path");
  return (data || []) as PageSetting[];
}

export async function upsertPageSetting(
  path: string,
  label: string,
  status: PageSetting["status"],
  access_role: PageSetting["access_role"]
) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db
    .from("page_settings")
    .upsert({ path, label, status, access_role }, { onConflict: "path" });
  return { success: !error, error: error?.message };
}

export async function deletePageSetting(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("page_settings").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  budget: string;
  message: string;
  website?: string; // honeypot — hidden from humans, only bots fill it
}) {
  // Honeypot: silently accept so bots don't adapt and retry.
  if (data.website) return { success: true };

  const name = (data.name || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  const message = (data.message || "").trim();
  if (
    !name || !email || !message ||
    name.length > 200 || email.length > 200 || message.length > 5000 ||
    !/^\S+@\S+\.\S+$/.test(email)
  ) {
    return { success: false, error: "Invalid submission." };
  }

  const db = getDb();
  // Per-email throttle: max 2 messages per 10 minutes (contacts.created_at).
  const { count } = await db
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());
  if ((count ?? 0) >= 2) {
    return { success: false, error: "Too many messages. Please try again later." };
  }

  const { error } = await db.from("contacts").insert({
    name,
    email,
    budget: (data.budget || "").slice(0, 50),
    message,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
