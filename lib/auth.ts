import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getDb, type User } from "./db";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Never sign or verify with an implicit "undefined" secret. api/lib/auth.ts
// uses the same fail-closed pattern.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  if (!process.env.JWT_SECRET) {
    console.error("[Auth] JWT_SECRET is not set — all tokens are being rejected");
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie?.value) return null;

    const payload = await verifyToken(sessionCookie.value);
    if (!payload?.userId || !payload?.token) return null;

    const db = getDb();
    if (!db) return null;

    // A missing/stale row means this cookie was revoked. Keep the historical
    // tolerance for deployments whose sessions table is not migrated yet.
    try {
      const { data: session, error: sessionError } = await db
        .from("sessions")
        .select("id")
        .eq("token", payload.token)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (sessionError && !sessionError.message?.includes("does not exist")) {
        console.warn("[Auth] Session query error:", sessionError.message);
      } else if (!sessionError && !session) {
        return null;
      }
    } catch {
      // sessions table might not exist — rely on JWT only
    }

    const { data: user, error: userError } = await db
      .from("users")
      .select("*")
      .eq("id", payload.userId)
      .single();

    if (userError || !user) {
      console.warn("[Auth] User not found:", payload.userId, userError?.message);
      return null;
    }

    return user as User | null;
  } catch (e) {
    console.error("[Auth] getSession error:", e);
    return null;
  }
}

export async function getCurrentSessionToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie?.value) return null;
    const payload = await verifyToken(sessionCookie.value);
    return (payload?.token as string) || null;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (sessionCookie?.value) {
      const payload = await verifyToken(sessionCookie.value);
      if (payload?.userId && payload?.token) {
        const db = getDb();
        if (db) {
          try {
            await db.from("sessions").delete().eq("user_id", payload.userId).eq("token", payload.token);
          } catch {
            // Ignore — table might not exist
          }
        }
      }
    }

    cookieStore.delete("session");
  } catch {
    // Ignore errors
  }
}

export async function deleteAccount(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    if (!db) return { success: false, error: "Database not available" };

    const { data: user, error: userError } = await db
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return { success: false, error: "User not found" };
    }

    if (user.provider === "credentials") {
      if (!user.password_hash) {
        return { success: false, error: "No password set" };
      }
      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        return { success: false, error: "Password incorrect" };
      }
    }

    const { error: deleteError } = await db
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    await deleteSession();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete account" };
  }
}
