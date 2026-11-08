"use client";

import { Button } from "@/components/ui/button";

export const LOCALES = [
  { code: "en", label: "English (EN)" },
  { code: "id", label: "Indonesia (ID)" },
] as const;

/** Minimal locale toggle (same pattern as TranslationsTab). */
export function LocaleToggle({
  locale,
  onChange,
}: {
  locale: string;
  onChange: (locale: string) => void;
}) {
  return (
    <div role="group" aria-label="Locale" className="flex items-center gap-1 shrink-0">
      {LOCALES.map(({ code, label }) => (
        <Button
          key={code}
          variant={code === locale ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(code)}
          aria-pressed={code === locale}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
