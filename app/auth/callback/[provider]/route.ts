import { NextRequest, NextResponse } from "next/server";
import { loginWithOAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    let email = "";
    let name = "";
    let avatarUrl = "";

    if (provider === "google") {
      const callbackUri = `${origin}/api/auth/callback/google`;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: callbackUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        console.error("[OAuth] Google token error:", tokenData.error);
        return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
      }

      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = await userRes.json();
      email = userData.email || "";
      name = userData.name || "";
      avatarUrl = userData.picture || "";
    } else if (provider === "github") {
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

      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        console.error("[OAuth] GitHub token error:", tokenData.error);
        return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
      }

      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const userData = await userRes.json();
      email = userData.email || "";
      name = userData.name || userData.login || "";
      avatarUrl = userData.avatar_url || "";

      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        const emails = await emailsRes.json();
        const primary = emails.find((e: { primary: boolean; email: string }) => e.primary);
        email = primary?.email || emails[0]?.email || "";
      }
    }

    if (!email) {
      return NextResponse.redirect(`${origin}/login?error=no_email`);
    }

    const userAgent = request.headers.get("user-agent") || "";
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

    const result = await loginWithOAuth(provider, email, name, avatarUrl, {
      userAgent,
      ipAddress,
    });

    if (result.error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(result.error)}`);
    }

    const userRole = result.user?.role;
    return NextResponse.redirect(`${origin}${userRole === "admin" ? "/admin" : next}`);
  } catch (error) {
    console.error("[OAuth] Callback error:", error);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }
}
