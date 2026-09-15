"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { getToken, clearToken, decodeToken, apiFetch } from "@/lib/api-client";
import { getBrowserSupabase } from "@/lib/supabase-client";
import { clearSessionCookie } from "@/app/actions/auth";

interface AuthUser {
  id: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Client-side auth state driven by the JWT in localStorage.
 * - user/token are derived from the token payload
 * - listens to Supabase Realtime DELETE on `sessions` for the current
 *   session token so a remote revoke (logout elsewhere / revoke-all)
 *   force-logs-out this device instantly
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = getToken();
    setTokenState(stored);
    const payload = stored ? decodeToken(stored) : null;
    setUser(payload?.userId ? { id: payload.userId, role: payload.role || "user" } : null);
    sessionTokenRef.current = payload?.token || null;
  }, []);

  const forceLogout = useCallback(async (reason: string) => {
    console.warn(`[Auth] Force logout: ${reason}`);
    clearToken();
    await clearSessionCookie();
    setTokenState(null);
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  // Realtime: session revoked on another device → log out here too
  useEffect(() => {
    if (!sessionTokenRef.current) return;

    const supabase = getBrowserSupabase();
    const channel = supabase
      .channel("auth-session-" + Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "sessions",
          filter: `token=eq.${sessionTokenRef.current}`,
        },
        () => {
          forceLogout("session revoked remotely");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [forceLogout]);

  const logout = useCallback(async () => {
    const current = getToken();
    try {
      if (current) {
        await apiFetch("/api/auth/logout", { method: "POST" });
      }
    } catch {
      // even if the API call fails, clear locally
    }
    clearToken();
    await clearSessionCookie();

    // Clear the SSO cookie on the auth domain via central logout, so the
    // next visit to /auth shows the login form instead of silently
    // signing in again. Lands on the app's login page, which redirects
    // to the auth domain.
    const authBase = process.env.NEXT_PUBLIC_AUTH_URL || "https://api.revy.my.id";
    const segments = window.location.pathname.split("/");
    const locale = segments[1] === "en" || segments[1] === "id" ? segments[1] : "";
    const loginUrl = `${window.location.origin}/${locale}/login`;
    window.location.href = `${authBase}/api/auth/logout?redirect_uri=${encodeURIComponent(loginUrl)}`;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
