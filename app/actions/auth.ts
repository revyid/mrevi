"use server";

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

export async function registerAction(
  name: string,
  email: string,
  password: string,
  locale: string = "en"
): Promise<{ success: boolean; error?: string }> {
  const result = await authRegister(name, email, password);
  if (result.error) return { success: false, error: result.error };
  return { success: true };
}

export async function loginAction(
  email: string,
  password: string,
  meta?: SessionMeta,
  locale: string = "en"
): Promise<{ success: boolean; error?: string; role?: string }> {
  const result = await authLogin(email, password, meta);
  if (result.error) return { success: false, error: result.error };
  return { success: true, role: result.user?.role };
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
