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
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Mobile hero — visible below xl */}
        <div className="xl:hidden mb-8">
          <ProfileCard settings={profileSettings} />
        </div>
        <div className="flex gap-8">
          {/* Desktop sidebar — visible on xl+ */}
          <aside className="hidden xl:block w-[280px] shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
            <ProfileCard settings={profileSettings} />
          </aside>
          <main className="flex-1 min-w-0 pb-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
