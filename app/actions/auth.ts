"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import {
  register as authRegister,
  login as authLogin,
  deleteSession,
  deleteAccount as authDeleteAccount,
  hashPassword,
  comparePassword,
} from "@/lib/auth";
import { getDb } from "@/lib/db";

interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

const DEBUG = process.env.NODE_ENV !== "production" || process.env.AUTH_DEBUG === "true";

function serverAuthLog(label: string, data?: unknown) {
  if (DEBUG) console.log(`[Auth Server] ${label}`, data !== undefined ? data : "");
}

function serverAuthError(label: string, err: unknown) {
  console.error(`[Auth Server Error] ${label}`, err);
  if (DEBUG && err instanceof Error) {
    console.error("  message:", err.message);
    console.error("  stack:", err.stack);
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
  locale: string = "en"
): Promise<{ success: boolean; error?: string }> {
  serverAuthLog("registerAction called", { name, email });
  try {
    const result = await authRegister(name, email, password);
    if (result.error) {
      serverAuthError("registerAction failed", result.error);
      return { success: false, error: result.error };
    }
    serverAuthLog("registerAction success");
    return { success: true };
  } catch (e) {
    serverAuthError("registerAction exception", e);
    return { success: false, error: e instanceof Error ? e.message : "Registration failed" };
  }
}

export async function loginAction(
  email: string,
  password: string,
  meta?: SessionMeta,
  locale: string = "en"
): Promise<{ success: boolean; error?: string; role?: string }> {
  serverAuthLog("loginAction called", { email, userAgent: meta?.userAgent?.slice(0, 60) });
  try {
    const result = await authLogin(email, password, meta);
    if (result.error) {
      serverAuthError("loginAction failed", result.error);
      return { success: false, error: result.error };
    }
    serverAuthLog("loginAction success", { role: result.user?.role });
    return { success: true, role: result.user?.role };
  } catch (e) {
    serverAuthError("loginAction exception", e);
    return { success: false, error: e instanceof Error ? e.message : "Login failed" };
  }
}

export async function logoutAction() {
  await deleteSession();
}

export async function updateProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string; bio?: string; website?: string; dob?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const updateData: Record<string, string> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.dob !== undefined) updateData.dob = data.dob;

    const { error } = await db.from("users").update(updateData).eq("id", userId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/en/profile");
    revalidatePath("/id/profile");
    revalidatePath("/en");
    revalidatePath("/id");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { getSession } = await import("@/lib/auth");
    const user = await getSession();
    if (!user) return { success: false, error: "Not authenticated" };

    const db = getDb();
    const { data: userData, error: fetchError } = await db
      .from("users")
      .select("password_hash")
      .eq("id", user.id)
      .single();

    if (fetchError || !userData) return { success: false, error: "User not found" };

    if (userData.password_hash) {
      const isValid = await comparePassword(currentPassword, userData.password_hash);
      if (!isValid) return { success: false, error: "Current password is incorrect" };
    }

    const newHash = await hashPassword(newPassword);
    const { error } = await db.from("users").update({ password_hash: newHash }).eq("id", user.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to change password" };
  }
}

export async function deleteAccount(
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { getSession } = await import("@/lib/auth");
    const user = await getSession();
    if (!user) return { success: false, error: "Not authenticated" };
    return await authDeleteAccount(user.id, password);
  } catch {
    return { success: false, error: "Failed to delete account" };
  }
}

export async function getOrCreateApiKeyAction(): Promise<{
  success: boolean;
  error?: string;
  key?: string;
  id?: string;
  keyPrefix?: string;
  rateLimit?: number;
  isActive?: boolean;
  createdAt?: string;
  lastUsedAt?: string | null;
}> {
  try {
    const { getSession } = await import("@/lib/auth");
    const user = await getSession();
    if (!user) return { success: false, error: "Not authenticated" };

    const db = getDb();
    
    const { data: existingKey, error: fetchError } = await db
      .from("api_keys")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      if (fetchError.message.includes("does not exist")) {
        return {
          success: false,
          error: "API Keys table does not exist. Please run migration 003_add_api_keys.sql in Supabase SQL editor first."
        };
      }
      return { success: false, error: fetchError.message };
    }

    if (existingKey) {
      return {
        success: true,
        id: existingKey.id,
        keyPrefix: existingKey.key_prefix,
        rateLimit: existingKey.rate_limit,
        isActive: existingKey.is_active,
        createdAt: existingKey.created_at,
        lastUsedAt: existingKey.last_used_at,
      };
    }

    const rawKey = "mr_" + crypto.randomBytes(24).toString("hex");
    const keyPrefix = rawKey.substring(0, 11);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const { data: newKey, error: insertError } = await db
      .from("api_keys")
      .insert({
        user_id: user.id,
        name: "Default Key",
        key_hash: keyHash,
        key_prefix: keyPrefix,
        rate_limit: 100,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) return { success: false, error: insertError.message };

    return {
      success: true,
      key: rawKey,
      id: newKey.id,
      keyPrefix: newKey.key_prefix,
      rateLimit: newKey.rate_limit,
      isActive: newKey.is_active,
      createdAt: newKey.created_at,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to get or create API key" };
  }
}

export async function regenerateApiKeyAction(): Promise<{
  success: boolean;
  error?: string;
  key?: string;
  id?: string;
  keyPrefix?: string;
  rateLimit?: number;
  isActive?: boolean;
  createdAt?: string;
}> {
  try {
    const { getSession } = await import("@/lib/auth");
    const user = await getSession();
    if (!user) return { success: false, error: "Not authenticated" };

    const db = getDb();

    const { error: deleteError } = await db
      .from("api_keys")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      if (deleteError.message.includes("does not exist")) {
        return {
          success: false,
          error: "API Keys table does not exist. Please run migration 003_add_api_keys.sql in Supabase SQL editor first."
        };
      }
      return { success: false, error: deleteError.message };
    }

    const rawKey = "mr_" + crypto.randomBytes(24).toString("hex");
    const keyPrefix = rawKey.substring(0, 11);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const { data: newKey, error: insertError } = await db
      .from("api_keys")
      .insert({
        user_id: user.id,
        name: "Default Key",
        key_hash: keyHash,
        key_prefix: keyPrefix,
        rate_limit: 100,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) return { success: false, error: insertError.message };

    return {
      success: true,
      key: rawKey,
      id: newKey.id,
      keyPrefix: newKey.key_prefix,
      rateLimit: newKey.rate_limit,
      isActive: newKey.is_active,
      createdAt: newKey.created_at,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to regenerate API key" };
  }
}
