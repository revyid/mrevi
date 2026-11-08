import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getTranslations } from "@/lib/translations";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (routing.locales as readonly string[]).includes(requested ?? "")
    ? (requested as string)
    : routing.defaultLocale;

  let messages: Record<string, unknown>;
  try {
    messages = await getTranslations(locale);
  } catch {
    messages = (await import(`../messages/${locale}.json`)).default;
  }

  return { locale, messages };
});
