import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privasi" });
  return {
    title: t("title"),
    description: t("desc"),
    alternates: { canonical: "https://www.revy.my.id/en/privasi" },
  };
}

// Draft copy lives in messages/<locale>.json under legal.privasi.
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} ns="privasi" />;
}

