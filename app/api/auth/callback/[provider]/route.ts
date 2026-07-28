import { NextRequest, NextResponse } from "next/server";
import { loginWithOAuth } from "@/lib/auth";

function log(label: string, data?: unknown) {
  console.log(`[OAuth Callback] ${label}`, data !== undefined ? JSON.stringify(data) : "");
}

function logError(label: string, err: unknown) {
  console.error(`[OAuth Callback ERROR] ${label}`);
  if (err instanceof Error) {
    console.error("  message:", err.message);
    console.error("  stack:", err.stack);
  } else {
    console.error("  raw:", JSON.stringify(err));
  }
}

async function getGoogleUser(code: string, redirectUri: string) {
  log("Google token exchange", { redirectUri, clientId: process.env.GOOGLE_CLIENT_ID?.slice(0, 10) + "..." });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  log("Google token response", {
    status: tokenRes.status,
    error: tokens.error,
    error_description: tokens.error_description,
    has_access_token: !!tokens.access_token,
  });

  if (tokens.error) {
    throw new Error(`Google token error: ${tokens.error} — ${tokens.error_description || "no description"}`);
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const user = await userRes.json();
  log("Google userinfo", { status: userRes.status, email: user.email, name: user.name, error: user.error?.message });

  if (user.error) {
    throw new Error(`Google userinfo error: ${user.error.message || JSON.stringify(user.error)}`);
  }

  return { email: user.email, name: user.name, avatarUrl: user.picture || "" };
}

async function getGitHubUser(code: string, redirectUri: string) {
  log("GitHub token exchange", { redirectUri, clientId: process.env.GITHUB_CLIENT_ID?.slice(0, 10) + "..." });

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokens = await tokenRes.json();
  log("GitHub token response", {
    status: tokenRes.status,
    error: tokens.error,
    error_description: tokens.error_description,
    has_access_token: !!tokens.access_token,
  });

  if (tokens.error) {
    throw new Error(`GitHub token error: ${tokens.error} — ${tokens.error_description || "no description"}`);
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokens.access_token}`, "User-Agent": "mrevi-app" },
  });

  const user = await userRes.json();
  log("GitHub user", { status: userRes.status, login: user.login, email: user.email, message: user.message });

  if (user.message) {
    throw new Error(`GitHub user error: ${user.message}`);
  }

  let email = user.email;
  if (!email) {
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokens.access_token}`, "User-Agent": "mrevi-app" },
    });
    const emails = await emailRes.json();
    log("GitHub emails", { status: emailRes.status, count: Array.isArray(emails) ? emails.length : emails });
    const primaryEmail = Array.isArray(emails)
      ? emails.find((e: { primary: boolean; email: string }) => e.primary)
      : null;
    email = primaryEmail?.email || "";
  }

  return { email, name: user.name || user.login || "", avatarUrl: user.avatar_url || "" };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthErrorDesc = searchParams.get("error_description");

  log("Callback received", { provider, hasCode: !!code, oauthError, oauthErrorDesc });

  // Provider already returned an error (e.g. user denied)
  if (oauthError) {
    const msg = oauthErrorDesc || oauthError;
    logError("Provider returned error", { oauthError, oauthErrorDesc });
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, request.url)
    );
  }

  if (!code) {
    log("No code received");
    return NextResponse.redirect(
      new URL("/login?error=No+authorization+code+received", request.url)
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;

    let userData;
    switch (provider) {
      case "google":
        userData = await getGoogleUser(code, redirectUri);
        break;
      case "github":
        userData = await getGitHubUser(code, redirectUri);
        break;
      default:
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent("Unsupported provider: " + provider)}`, request.url)
        );
    }

    log("User data", { email: userData.email, name: userData.name });

    if (!userData.email) {
      const msg = `No email returned from ${provider}. Make sure your email is public.`;
      log(msg);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(msg)}`, request.url)
      );
    }

    const result = await loginWithOAuth(provider, userData.email, userData.name, userData.avatarUrl);
    log("loginWithOAuth", { success: !result.error, error: result.error, role: result.user?.role });

    if (result.error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }

    const redirectUrl = result.user?.role === "admin" ? "/admin" : "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logError("Unhandled exception", error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, request.url)
    );
  }
}
