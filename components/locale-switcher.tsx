"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALES = [
  { code: "en", label: "EN", name: "English" },
  { code: "id", label: "ID", name: "Bahasa Indonesia" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

export function useLocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: LocaleCode) {
    if (next === locale) return;
    router.replace((pathname as string) || "/", { locale: next });
  }

  return { locale, switchTo };
}

/** EN/ID entries to drop inside any DropdownMenuContent; active locale checked. */
export function LocaleMenuItems() {
  const { locale, switchTo } = useLocaleSwitch();
  return (
    <>
      {LOCALES.map(({ code, label, name }) => {
        const active = code === locale;
        return (
          <DropdownMenuItem
            key={code}
            onClick={() => switchTo(code)}
            aria-current={active ? "true" : undefined}
            className={active ? "font-semibold" : undefined}
          >
            {active && <CheckIcon className="size-4 mr-1" aria-hidden="true" />}
            <span className={active ? undefined : "ml-5"}>{label} — {name}</span>
          </DropdownMenuItem>
        );
      })}
    </>
  );
}

/** Standalone language dropdown for the not-logged-in nav state. */
export function LocaleDropdown() {
  const t = useTranslations("nav");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language")}
        className="flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-white/50 hover:text-white hover:bg-white/5 transition-colors outline-none"
      >
        <LanguagesIcon className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <LocaleMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
