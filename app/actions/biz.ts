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
// BIZ PRODUCTS (stored as JSON in site_settings key "biz_products")
// ============================================================

export interface BizProduct {
  id: string;
  name: string;
  desc: string;
  price: string;
  image: string;
  tag: string;
  /** Optional external link (e.g. the live business site). Rows without it render without a link. */
  href?: string;
}

export async function getBizProducts(): Promise<BizProduct[]> {
  const db = getDb();
  const { data } = await db.from("site_settings").select("value").eq("key", "biz_products").maybeSingle();
  if (!data?.value) return [];
  try {
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? (parsed as BizProduct[]) : [];
  } catch {
    return [];
  }
}

export async function saveBizProducts(products: BizProduct[]) {
  await requireAdmin();
  const db = getDb();
  const { error } = await db
    .from("site_settings")
    .upsert({ key: "biz_products", value: JSON.stringify(products) }, { onConflict: "key" });
  if (!error) {
    revalidatePath("/");
    revalidatePath("/en/admin");
  }
  return { success: !error, error: error?.message };
}

export async function createBizProduct(data: { name: string; desc: string; price: string; image: string; tag: string }) {
  try {
    const products = await getBizProducts();
    const product: BizProduct = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      desc: data.desc.trim(),
      price: data.price.trim(),
      image: data.image.trim(),
      tag: data.tag.trim() || "Product",
    };
    products.push(product);
    return await saveBizProducts(products);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create product" };
  }
}

export async function updateBizProduct(id: string, field: keyof BizProduct, value: string) {
  try {
    const products = await getBizProducts();
    const next = products.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    return await saveBizProducts(next);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update product" };
  }
}

export async function deleteBizProduct(id: string) {
  try {
    const products = await getBizProducts();
    const next = products.filter((p) => p.id !== id);
    return await saveBizProducts(next);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete product" };
  }
}

// ============================================================
// BIZ SETTINGS (site_settings keys prefixed "biz_")
// ============================================================

const BIZ_SETTINGS_KEYS = [
  "biz_hero_title_1",
  "biz_hero_title_2",
  "biz_hero_description",
  "biz_contact_email",
  "biz_footer_text",
] as const;

export type BizSettingKey = (typeof BIZ_SETTINGS_KEYS)[number];

export async function getBizSettings(): Promise<Record<string, string>> {
  const db = getDb();
  const { data } = await db.from("site_settings").select("*").in("key", [...BIZ_SETTINGS_KEYS]);
  if (!data) return {};
  return Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]));
}

export async function updateBizSettings(settings: Record<string, string>) {
  try {
    await requireAdmin();
    const db = getDb();
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await db.from("site_settings").upsert(rows, { onConflict: "key" });
    if (!error) {
      revalidatePath("/");
      revalidatePath("/en/admin");
    }
    return { success: !error, error: error?.message };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update settings" };
  }
}
