import { NextRequest, NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";

function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

function getGitHubAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/github`,
    scope: "read:user user:email",
  });
  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  switch (provider) {
    case "google":
      return NextResponse.redirect(getGoogleAuthUrl());
    case "github":
      return NextResponse.redirect(getGitHubAuthUrl());
    default:
      return NextResponse.redirect(
        new URL("/login?error=unsupported_provider", request.url)
      );
  }
}
