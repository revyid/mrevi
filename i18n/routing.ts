import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "always",
  // TODO(i18n): messages/id.json already exists and AppShell strips /id, so an
  // "id" locale is plausible — but SEO canonicals, hreflang alternates, and the
  // completeness of id.json translations need an audit first. Keep en-only
  // until then so canonical URLs don't fan out into duplicate content.
});
