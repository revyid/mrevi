"use client";

import { usePathname } from "next/navigation";
import { ProfileCard, type ProfileCardSettings } from "@/components/profile-card";

// These segment suffixes hide the sidebar regardless of locale prefix.
// Side card (ProfileCard) ONLY shows on root + content pages (projects, journey, tools, blog, contact, sandbox, blog/*).
// Bare layout for: admin, auth, account settings, user pages, OAuth callback, error/not-found.
const NO_SIDEBAR_SEGMENTS = [
  "/admin",
  "/login",
  "/register",
  "/profile",
  "/user",      // public user profile pages
  "/callback",  // OAuth token-exchange (session flow)
];

interface AppShellProps {
  children: React.ReactNode;
  profileSettings?: ProfileCardSettings;
  locale: string;
}

export function AppShell({ children, profileSettings = {}, locale }: AppShellProps) {
  const pathname = usePathname();

  // pathname will be like /en/admin or /id/profile — strip the locale prefix for matching
  const withoutLocale = pathname.replace(/^\/(en|id)/, "") || "/";
  const showSidebar = !NO_SIDEBAR_SEGMENTS.some((seg) => withoutLocale.startsWith(seg));

  if (!showSidebar) {
    return (
      <div className="min-h-screen pt-24 px-5 md:px-10 lg:px-16">
        <main className="max-w-6xl mx-auto pb-12">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-5 md:px-10 lg:px-16">
      <div className="max-w-[1200px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
        {/* Single ProfileCard — di mobile dibates width-nya biar gak lebar, di desktop sidebar penuh.
            Kolomnya `auto`, bukan 280px tetap, supaya pas card di-zoom kolomnya ikut
            mengecil (kalau tetap, card jadi 218px di kolom 280px = 62px ruang mati).
            566px = tinggi natural card; 9rem = top-24 sticky + sisanya ruang napas
            di bawah. Batas bawah 0.7 biar masih kebaca, di bawah itu page scroll. */}
        <div className="max-w-sm mx-auto w-full lg:w-[280px] lg:sticky lg:top-24 lg:self-start lg:[zoom:clamp(0.7,calc((100dvh-9rem)/566px),1)]">
          <ProfileCard settings={profileSettings} />
        </div>
        <main className="min-w-0 pb-12">{children}</main>
      </div>
    </div>
  );
}
