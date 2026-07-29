"use client";

import { usePathname } from "next/navigation";
import { ProfileCard, type ProfileCardSettings } from "@/components/profile-card";

// These segment suffixes hide the sidebar regardless of locale prefix
const NO_SIDEBAR_SEGMENTS = ["/admin", "/login", "/register", "/profile"];

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
      <div className="max-w-[1200px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8">
        {/* Single ProfileCard — positioned via grid. Mobile: row 1, Desktop: col 1 */}
        <div className="min-w-0 xl:sticky xl:top-24 xl:h-[calc(100vh-6rem)] xl:overflow-y-auto scrollbar-none">
          <ProfileCard settings={profileSettings} />
        </div>
        <main className="min-w-0 pb-12">{children}</main>
      </div>
    </div>
  );
}
