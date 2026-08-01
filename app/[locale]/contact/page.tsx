import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact-form";

const BASE_URL = "https://www.revy.my.id";

export const metadata: Metadata = {
  title: "Contact — M. Revi Ramadhan",
  description: "Get in touch with M. Revi Ramadhan for project inquiries, collaborations, or just to say hello.",
  openGraph: {
    type: "website",
    url: `${BASE_URL}/en/contact`,
    title: "Contact — M. Revi Ramadhan",
    description: "Get in touch with M. Revi Ramadhan.",
    images: [
      { url: `${BASE_URL}/og`, width: 1200, height: 630, alt: "Contact — M. Revi Ramadhan" },
    ],
  },
  twitter: { card: "summary_large_image", title: "Contact — M. Revi Ramadhan", description: "Get in touch with M. Revi Ramadhan.", images: [`${BASE_URL}/og`] },
  alternates: { canonical: `${BASE_URL}/en/contact` },
};

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="space-y-24 w-full">
      <section className="pt-8 pb-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading">
          <span className="block">{t("title")}</span>
          <span className="block text-muted-foreground/20">{t("titleSub")}</span>
        </h1>
      </section>

      <section className="max-w-xl">
        <ContactForm />
      </section>
    </div>
  );
}
