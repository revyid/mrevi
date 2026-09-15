import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://api.revy.my.id";

async function buildAuthUrl(locale: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "revy.my.id";
  const proto = h.get("x-forwarded-proto") || "https";
  const redirectUri = `${proto}://${host}/${locale}/callback`;
  return `${AUTH_URL}/auth?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(await buildAuthUrl(locale));
}
