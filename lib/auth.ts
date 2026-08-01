import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getDb, type User } from "./db";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================
// JWT Helpers
// ============================================================

export async function createToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ============================================================
// Password Helpers
// ============================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// Session Helpers
// ============================================================

interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

export async function createSession(userId: string, meta?: SessionMeta): Promise<string> {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured in environment");
    }

    const db = getDb();

    // Generate random token
    const token = crypto.randomUUID() + "-" + Date.now().toString(36);

    // Fetch user role to include in JWT
    const { data: userData } = await db.from("users").select("role").eq("id", userId).single();
    const role = userData?.role || "user";

    // Create JWT with role included so proxy can check without a DB call
    const jwtToken = await createToken({ userId, token, role });

    // Set expiry
    const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

    // Save session to database (best effort — don't block login if table is missing)
    try {
      await db.from("sessions").insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt,
        user_agent: meta?.userAgent || "",
        ip_address: meta?.ipAddress || "",
      });
    } catch (e) {
      console.warn("[Auth] Could not save session to DB:", e);
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
      path: "/",
    });

    return jwtToken;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to create session: ${msg}`);
  }
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return null;
    }

    // Verify JWT
    const payload = await verifyToken(sessionCookie.value);
    if (!payload?.userId) {
      return null;
    }

    const db = getDb();

    // Validate session from DB by the SPECIFIC token in the JWT.
    // This ensures revoked sessions are truly invalidated, even if
    // the user has other active sessions on other devices.
    try {
      const { data: session, error: sessionError } = await db
        .from("sessions")
        .select("id")
        .eq("token", payload.token)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      // If table exists but no session matches this token, cookie is stale/revoked
      if (sessionError && !sessionError.message?.includes("does not exist")) {
        console.warn("[Auth] Session query error:", sessionError.message);
      } else if (!sessionError && !session) {
        return null;
      }
    } catch {
      // sessions table might not exist — that's OK, rely on JWT only
    }

    // Get user
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
        try {
          await db.from("sessions").delete().eq("user_id", payload.userId).eq("token", payload.token);
        } catch {
          // Ignore — table might not exist
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

    // Get user
    const { data: user, error: userError } = await db
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return { success: false, error: "User not found" };
    }

    // Verify password for credentials users
    if (user.provider === "credentials") {
      if (!user.password_hash) {
        return { success: false, error: "No password set" };
      }
      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        return { success: false, error: "Password incorrect" };
      }
    }

    // Delete user (cascade will delete sessions and passkeys)
    const { error: deleteError } = await db
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Clear cookie
    await deleteSession();

    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete account" };
  }
}

// ============================================================
// Auth Actions
// ============================================================

export async function register(name: string, email: string, password: string, meta?: SessionMeta) {
  try {
    const db = getDb();

    // Check if user exists
    const { data: existingUser, error: checkError } = await db
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows, which is what we want
      return { error: `Database error: ${checkError.message}` };
    }

    if (existingUser) {
      return { error: "Email already registered" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error } = await db
      .from("users")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        provider: "credentials",
      })
      .select()
      .single();

    if (error) {
      return { error: `Failed to create user: ${error.message}` };
    }

    // Create session
    await createSession(user.id, meta);

    return { user };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Registration failed: ${msg}` };
  }
}

export async function login(email: string, password: string, meta?: SessionMeta) {
  try {
    const db = getDb();

    // Get user
    const { data: user, error: userError } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError) {
      console.warn("[Auth] Login failed: DB error", email, userError.message);
      if (userError.code === "PGRST116") {
        return { error: "Invalid email or password" };
      }
      return { error: `Database error: ${userError.message}` };
    }

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Check password
    if (!user.password_hash) {
      return { error: "Please login with OAuth provider" };
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    // Create session with device info
    await createSession(user.id, meta);

    return { user };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Login failed: ${msg}` };
  }
}

export async function loginWithOAuth(
  provider: string,
  email: string,
  name: string,
  avatarUrl: string,
  meta?: SessionMeta
) {
  try {
    const db = getDb();

    // Check if user exists with this provider
    const { data: existingUser, error: existError } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("provider", provider)
      .single();

    if (existError && existError.code !== "PGRST116") {
      return { error: `Database error: ${existError.message}` };
    }

    if (existingUser) {
      // Update avatar if changed
      if (avatarUrl && existingUser.avatar_url !== avatarUrl) {
        await db
          .from("users")
          .update({ avatar_url: avatarUrl })
          .eq("id", existingUser.id);
      }

      // Create session
      await createSession(existingUser.id, meta);
      return { user: existingUser };
    }

    // Check if email exists with different provider
    const { data: userWithEmail } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userWithEmail) {
      // User exists with different provider, create session for existing user
      await createSession(userWithEmail.id, meta);
      return { user: userWithEmail };
    }

    // Create new user
    const { data: newUser, error } = await db
      .from("users")
      .insert({
        name,
        email,
        password_hash: null,
        provider,
        avatar_url: avatarUrl,
      })
      .select()
      .single();

    if (error) {
      return { error: `Failed to create user: ${error.message}` };
    }

    // Create session
    await createSession(newUser.id, meta);

    return { user: newUser };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `OAuth login failed: ${msg}` };
  }
}
