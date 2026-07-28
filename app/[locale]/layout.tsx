import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navigation } from "@/components/navigation";
import { AppShell } from "@/components/AppShell";
import { ViewportLogger } from "@/components/viewport-logger";
import { Providers } from "@/components/providers";
import { getSession } from "@/lib/auth";
import { getSettings, getNavigationLinks } from "@/app/actions/content";
import type { ProfileCardSettings } from "@/components/profile-card";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  return {
    title: locale === "id" ? "Sawad - Software Engineer" : "Sawad - Software Engineer",
    description:
      locale === "id"
        ? "Seorang Software Engineer yang telah mengembangkan banyak solusi inovatif."
        : "A Software Engineer who has developed countless innovative solutions.",
    alternates: {
      languages: { en: "/en", id: "/id" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate — notFound if not a supported locale
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // Must be called before any other next-intl server function
  setRequestLocale(locale);

  const [messages, user, rawSettings, navLinks] = await Promise.all([
    getMessages(),
    getSession(),
    getSettings(),
    getNavigationLinks(),
  ]);

  const profileSettings: ProfileCardSettings = {
    profile_name:     rawSettings.profile_name,
    profile_title:    rawSettings.profile_title,
    profile_bio:      rawSettings.profile_bio,
    profile_avatar:   rawSettings.profile_avatar,
    profile_roles:    rawSettings.profile_roles,
    social_facebook:  rawSettings.social_facebook,
    social_twitter:   rawSettings.social_twitter,
    social_instagram: rawSettings.social_instagram,
    social_email:     rawSettings.social_email,
    social_github:    rawSettings.social_github,
    social_linkedin:  rawSettings.social_linkedin,
  };

  return (
    <html lang={locale} className={`${inter.variable} ${poppins.variable} dark h-full antialiased`}>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ViewportLogger />
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-5">
              <Navigation
                user={user ? { id: user.id, name: user.name, role: user.role, avatar_url: user.avatar_url } : null}
                locale={locale}
                navLinks={navLinks}
              />
            </div>
            <AppShell profileSettings={profileSettings} locale={locale}>
              {children}
            </AppShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
