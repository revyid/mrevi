"use client";

import { useCallback, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useLocale, useTranslations } from "next-intl";

const KEY = "analytics-consent";
const OPEN_EVENT = "revy:open-consent";

type Choice = "accepted" | "declined";

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

// Renders <Analytics> only after an explicit opt-in; shows the banner until a choice is made.
export function ConsentBanner() {
  const t = useTranslations("consent");
  const locale = useLocale();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = readChoice();
    setChoice(saved);
    if (!saved) setOpen(true);
    const reopen = () => {
      setChoice(null);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = useCallback((value: Choice) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* private mode — choice simply won't persist */
    }
    setChoice(value);
    setOpen(false);
  }, []);

  return (
    <>
      {choice === "accepted" && <Analytics />}
      {open && (
        <div
          role="region"
          aria-label={t("title")}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-popover text-popover-foreground"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-10">
            <p className="text-sm text-muted-foreground">
              <span className="font-heading font-semibold text-foreground">{t("title")}. </span>
              {t("description")}{" "}
              <a href={`/${locale}/privasi`} className="underline underline-offset-2 hover:text-foreground">
                {t("privacyLink")}
              </a>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose("declined")}
                className="min-h-11 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("decline")}
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                autoFocus
                className="min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Footer link to re-open the banner after a choice was made.
export function ConsentReopen() {
  const t = useTranslations("consent");
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="min-h-11 px-1 hover:text-foreground transition-colors"
    >
      {t("changeChoice")}
    </button>
  );
}
