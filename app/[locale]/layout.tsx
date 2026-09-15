import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navigation } from "@/components/navigation";
import { AppShell } from "@/components/AppShell";
import { ViewportLogger } from "@/components/viewport-logger";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSession } from "@/lib/auth";
import { getSettings, getNavigationLinks, getTheme } from "@/app/actions/content";
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

  return {
    title: {
      default: "M. Revi Ramadhan — Software Engineer",
      template: "%s — M. Revi Ramadhan",
    },
    description: "Self-taught developer and student at SMAN 1 Bungo, Indonesia. Building web apps, Framer templates, and more.",
    metadataBase: new URL("https://www.revy.my.id"),
    alternates: {
      canonical: "https://www.revy.my.id",
      languages: { "x-default": "https://www.revy.my.id" },
    },
    openGraph: {
      type: "website",
      siteName: "M. Revi Ramadhan",
      locale: "en_US",
      images: [
        {
          url: "https://www.revy.my.id/og",
          width: 1200,
          height: 630,
          alt: "M. Revi Ramadhan — Software Engineer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["https://www.revy.my.id/og"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
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

  const [messages, user, rawSettings, navLinks, savedTheme] = await Promise.all([
    getMessages(),
    getSession(),
    getSettings(),
    getNavigationLinks(),
    getTheme(),
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
            <ThemeProvider theme={savedTheme} />
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
