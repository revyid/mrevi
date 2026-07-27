"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locales = {
  en: { label: "English", flag: "🇬🇧" },
  id: { label: "Indonesia", flag: "🇮🇩" },
} as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleLocaleChange(newLocale: "en" | "id") {
    router.replace(pathname, { locale: newLocale });
  }

  const current = locales[locale as keyof typeof locales] ?? locales.en;

  return (
    <DropdownMenu>
      {/* Base UI Trigger renders its own <button> — don't wrap in <Button> */}
      <DropdownMenuTrigger
        className="size-9 rounded-full inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors outline-none"
      >
        <span className="text-base leading-none">{current.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(locales).map(([key, { label, flag }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleLocaleChange(key as "en" | "id")}
            className={locale === key ? "bg-accent text-accent-foreground" : ""}
          >
            <span className="mr-2">{flag}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
