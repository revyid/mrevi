"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "@/i18n/navigation";

const defaultNavLinks = [
  { href: "/", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", is_visible: true },
  { href: "/projects", label: "Projects", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", is_visible: true },
  { href: "/journey", label: "Journey", icon: "M2 7h20v14H2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", is_visible: true },
  { href: "/tools", label: "Tools", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", is_visible: true },
  { href: "/blog", label: "Thoughts", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", is_visible: true },
];

interface User {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
}

interface NavLinkItem {
  href: string;
  label: string;
  icon: string;
  is_visible?: boolean;
}

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Navigation({ user, locale, navLinks }: { user?: User | null; locale: string; navLinks?: NavLinkItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  const links = (navLinks && navLinks.length > 0 ? navLinks : defaultNavLinks).filter(l => l.is_visible !== false);

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-2 p-2 rounded-2xl backdrop-blur-md bg-white/5">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href as any}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-9 rounded-full",
                isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <path d={link.icon} />
              </svg>
            </Button>
          </Link>
        );
      })}

      <div className="size-px bg-white/10 mx-1" />

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-2xl hover:bg-white/5 transition-colors outline-none">
            <Avatar className="size-8">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="bg-white/10 text-white text-xs font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-white/50">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.role === "admin" ? t("administrator") : t("user")}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {t("profile")}
            </DropdownMenuItem>
            {user.role === "admin" && (
              <DropdownMenuItem onClick={() => router.push("/admin")}>
                <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                {t("admin")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login">
          <Button variant="ghost" className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {t("login")}
          </Button>
        </Link>
      )}
    </nav>
  );
}
