import { NextRequest, NextResponse } from "next/server";
import { loginWithOAuth } from "@/lib/auth";

async function getGoogleUser(code: string) {
  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (tokens.error) {
    throw new Error(tokens.error_description || "Google auth failed");
  }

  // Get user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const user = await userRes.json();
  return {
    email: user.email,
    name: user.name,
    avatarUrl: user.picture || "",
  };
}

async function getGitHubUser(code: string) {
  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokens = await tokenRes.json();
  if (tokens.error) {
    throw new Error(tokens.error_description || "GitHub auth failed");
  }

  // Get user info
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "User-Agent": "Next.js Auth App",
    },
  });

  const user = await userRes.json();

  // Get email (might be private)
  let email = user.email;
  if (!email) {
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "User-Agent": "Next.js Auth App",
      },
    });
    const emails = await emailRes.json();
    const primaryEmail = emails.find(
      (e: { primary: boolean; email: string }) => e.primary
    );
    email = primaryEmail?.email || "";
  }

  return {
    email,
    name: user.name || user.login || "",
    avatarUrl: user.avatar_url || "",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=no_code", request.url)
    );
  }

  try {
    let userData;

    switch (provider) {
      case "google":
        userData = await getGoogleUser(code);
        break;
      case "github":
        userData = await getGitHubUser(code);
        break;
      default:
        return NextResponse.redirect(
          new URL("/login?error=unsupported_provider", request.url)
        );
    }

    if (!userData.email) {
      return NextResponse.redirect(
        new URL("/login?error=no_email", request.url)
      );
    }

    // Login or create user
    const result = await loginWithOAuth(
      provider,
      userData.email,
      userData.name,
      userData.avatarUrl
    );

    if (result.error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }

    // Redirect based on role
    const redirectUrl =
      result.user?.role === "admin" ? "/admin" : "/";

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("[OAuth Callback]", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
