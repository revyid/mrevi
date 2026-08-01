import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { jwtVerify } from "jose";

const intlMiddleware = createMiddleware(routing);

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Paths that bypass page-settings checks entirely
const BYPASS_PREFIXES = [
  "/api/",
  "/_next/",
  "/maintenance",
  "/coming-soon",
  "/favicon",
  "/robots",
  "/sitemap",
];

async function getUserFromRequest(request: NextRequest): Promise<{ role: string } | null> {
  try {
    const session = request.cookies.get("session")?.value;
    if (!session) return null;
    const { payload } = await jwtVerify(session, JWT_SECRET);
    return { role: (payload.role as string) || "user" };
  } catch {
    return null;
  }
}

// Fetch page settings from Supabase with 30s cache
async function fetchPageSettings(): Promise<Record<string, { status: string; access_role: string }>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_settings?select=path,status,access_role`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        next: { revalidate: 30 },
      }
    );
    if (!res.ok) return {};
    const data: { path: string; status: string; access_role: string }[] = await res.json();
    return Object.fromEntries(data.map((p) => [p.path, { status: p.status, access_role: p.access_role }]));
  } catch {
    return {};
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass system paths
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return intlMiddleware(request);
  }

  // Strip locale prefix to get base path: /en/blog → /blog, /en → /
  const localeMatch = pathname.match(/^\/(en|id)(\/.*)?$/);
  const basePath = localeMatch ? (localeMatch[2] || "/") : pathname;
  const locale = localeMatch?.[1] || "en";

  // Skip login/register from access checks
  const authPaths = ["/login", "/register"];
  if (!authPaths.includes(basePath)) {
    const settings = await fetchPageSettings();
    const pageSetting = settings[basePath];

    if (pageSetting) {
      const { status, access_role } = pageSetting;

      // Status checks
      if (status === "hidden") {
        return NextResponse.rewrite(new URL(`/${locale}/not-found`, request.url));
      }
      if (status === "maintenance") {
        return NextResponse.rewrite(new URL("/maintenance", request.url));
      }
      if (status === "coming_soon") {
        return NextResponse.rewrite(new URL("/coming-soon", request.url));
      }

      // Role checks (only for live pages)
      if (status === "live" && access_role !== "public") {
        const user = await getUserFromRequest(request);

        if (!user) {
          const loginUrl = new URL(`/${locale}/login`, request.url);
          loginUrl.searchParams.set("redirect", pathname);
          return NextResponse.redirect(loginUrl);
        }

        if (access_role === "admin" && user.role !== "admin") {
          return NextResponse.rewrite(new URL(`/${locale}/not-found`, request.url));
        }
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon|apple-icon|opengraph-image|twitter-image).*)",
  ],
};
