"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  provider: string;
  created_at: string;
}

// Get all users (admin only)
export async function getUsers(): Promise<{ users: User[]; error?: string }> {
  try {
    const currentUser = await getSession();
    if (!currentUser || currentUser.role !== "admin") {
      return { users: [], error: "Unauthorized" };
    }
    const db = getDb();
    const { data, error } = await db.from("users").select("*").order("created_at", { ascending: false });
    if (error) return { users: [], error: error.message };
    return { users: (data as User[]) || [] };
  } catch (err) {
    return { users: [], error: "Failed to fetch users" };
  }
}

// Create user (admin only)
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: string = "user"
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const currentUser = await getSession();
    if (!currentUser || currentUser.role !== "admin") return { success: false, error: "Unauthorized" };

    const db = getDb();
    const { data: existing } = await db.from("users").select("id").eq("email", email).single();
    if (existing) return { success: false, error: "Email already exists" };

    const passwordHash = await hashPassword(password);
    const { data: user, error } = await db.from("users").insert({ name, email, password_hash: passwordHash, role, provider: "credentials" }).select().single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin");
    return { success: true, user };
  } catch (err) {
    return { success: false, error: "Failed to create user" };
  }
}

// Update user (admin only)
export async function updateUser(userId: string, field: string, value: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getSession();
    if (!currentUser || currentUser.role !== "admin") return { success: false, error: "Unauthorized" };

    const db = getDb();
    const { error } = await db.from("users").update({ [field]: value }).eq("id", userId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to update user" };
  }
}

// Delete user (admin only)
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getSession();
    if (!currentUser || currentUser.role !== "admin") return { success: false, error: "Unauthorized" };
    if (currentUser.id === userId) return { success: false, error: "Cannot delete yourself" };

    const db = getDb();
    const { error } = await db.from("users").delete().eq("id", userId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to delete user" };
  }
}

// Get stats — all counts run in parallel (no N+1)
export async function getAdminStats() {
  try {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { count: totalUsers },
      { count: adminCount },
      { count: todayCount },
      { count: googleUsers },
      { count: githubUsers },
      { count: credentialUsers },
    ] = await Promise.all([
      db.from("users").select("*", { count: "exact", head: true }),
      db.from("users").select("*", { count: "exact", head: true }).eq("role", "admin"),
      db.from("users").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      db.from("users").select("*", { count: "exact", head: true }).eq("provider", "google"),
      db.from("users").select("*", { count: "exact", head: true }).eq("provider", "github"),
      db.from("users").select("*", { count: "exact", head: true }).eq("provider", "credentials"),
    ]);

    return {
      totalUsers: totalUsers || 0,
      adminCount: adminCount || 0,
      regularUsers: (totalUsers || 0) - (adminCount || 0),
      todayCount: todayCount || 0,
      googleUsers: googleUsers || 0,
      githubUsers: githubUsers || 0,
      credentialUsers: credentialUsers || 0,
    };
  } catch {
    return { totalUsers: 0, adminCount: 0, regularUsers: 0, todayCount: 0 };
  }
}
