"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}

// ============================================================
// SITE SETTINGS
// ============================================================

export async function getSettings(): Promise<Record<string, string>> {
  const db = getDb();
  const { data } = await db.from("site_settings").select("*");
  if (!data) return {};
  return Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]));
}

export async function updateSettings(settings: Record<string, string>) {
  await requireAdmin();
  const db = getDb();
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
  const { error } = await db.from("site_settings").upsert(rows, { onConflict: "key" });
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

// ============================================================
// DERIVED HELPERS (thin wrappers around getSettings)
// ============================================================

/** Returns social link hrefs keyed by platform name. */
export async function getSocialLinks(): Promise<{
  facebook: string;
  twitter: string;
  instagram: string;
  email: string;
  github: string;
  linkedin: string;
}> {
  const s = await getSettings();
  return {
    facebook:  s.social_facebook  || "#",
    twitter:   s.social_twitter   || "#",
    instagram: s.social_instagram || "#",
    email:     s.social_email     || "#",
    github:    s.social_github    || "#",
    linkedin:  s.social_linkedin  || "#",
  };
}

/** Returns the two skill-card objects shown below the hero. */
export async function getSkillCards(): Promise<Array<{
  text: string;
  href: string;
  type: "accent" | "primary";
}>> {
  const s = await getSettings();
  return [
    {
      text: s.skill_card_1_text || "DYNAMIC ANIMATION, MOTION DESIGN",
      href: s.skill_card_1_href || "/journey",
      type: (s.skill_card_1_type as "accent" | "primary") || "accent",
    },
    {
      text: s.skill_card_2_text || "FRAMER, FIGMA, WORDPRESS, REACTJS",
      href: s.skill_card_2_href || "/projects",
      type: (s.skill_card_2_type as "accent" | "primary") || "primary",
    },
  ];
}

/** Returns the navigation link labels from the navigation_links table. */
export async function getNavigationLinks(): Promise<
  Array<{ href: string; label: string; icon: string; sort_order: number; is_visible: boolean }>
> {
  const db = getDb();
  const { data } = await db
    .from("navigation_links")
    .select("*")
    .order("sort_order");
  return data || [];
}

export async function updateNavigationLink(href: string, label: string, newHref?: string) {
  await requireAdmin();
  const db = getDb();
  const update: Record<string, string> = { label };
  if (newHref && newHref !== href) update.href = newHref;
  const { error } = await db.from("navigation_links").update(update).eq("href", href);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

export async function updateNavigationLinkVisibility(href: string, is_visible: boolean) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("navigation_links").update({ is_visible }).eq("href", href);
  if (!error) revalidatePath("/");
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
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

export async function deleteNavigationLink(href: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("navigation_links").delete().eq("href", href);
  if (!error) revalidatePath("/");
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
  revalidatePath("/");
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
  if (!error) { revalidatePath("/"); revalidatePath("/en"); revalidatePath("/id"); }
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
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message, page };
}

export async function updateCustomPage(
  id: string,
  data: Partial<{ title: string; slug: string; content: string; is_visible: boolean }>
) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("custom_pages").update(data).eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

export async function deleteCustomPage(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("custom_pages").delete().eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

// ============================================================
// PROJECTS
// ============================================================

export async function getProjects() {
  const db = getDb();
  const { data } = await db.from("projects").select("*").order("sort_order");
  return data || [];
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
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message, project };
}

export async function updateProject(id: string, field: string, value: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db
    .from("projects")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("projects").delete().eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

// ============================================================
// EXPERIENCES
// ============================================================

export async function getExperiences() {
  const db = getDb();
  const { data } = await db.from("journey").select("*").order("sort_order");
  return data || [];
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
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message, experience: exp };
}

export async function updateExperience(id: string, field: string, value: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db
    .from("journey")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("journey").delete().eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

// ============================================================
// TOOLS
// ============================================================

export async function getTools() {
  const db = getDb();
  const { data } = await db.from("tools").select("*").order("sort_order");
  return data || [];
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
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message, tool };
}

export async function updateTool(id: string, field: string, value: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db
    .from("tools")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

export async function deleteTool(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("tools").delete().eq("id", id);
  if (!error) revalidatePath("/");
  return { success: !error, error: error?.message };
}

// ============================================================
// BLOG POSTS
// ============================================================

export async function getBlogPosts() {
  const db = getDb();
  const { data } = await db.from("blog_posts").select("*").order("sort_order");
  return data || [];
}

export async function getBlogPost(slug: string) {
  const db = getDb();
  const { data } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
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
    revalidatePath("/");
    revalidatePath("/blog");
  }
  return { success: !error, error: error?.message, post };
}

export async function updateBlogPost(id: string, field: string, value: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db
    .from("blog_posts")
    .update({ [field]: value })
    .eq("id", id);
  if (!error) {
    revalidatePath("/");
    revalidatePath("/blog");
  }
  return { success: !error, error: error?.message };
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (!error) {
    revalidatePath("/");
    revalidatePath("/blog");
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
