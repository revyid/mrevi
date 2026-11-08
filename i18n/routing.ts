import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "id", "fr", "es", "de"],
  defaultLocale: "en",
  localePrefix: "always",
});
