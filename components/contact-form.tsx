"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactForm } from "@/app/actions/content";
import { useTranslations } from "next-intl";

type FieldErrors = Partial<Record<"name" | "email" | "message" | "server", string>>;

export function ContactForm() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Inline validation — errors render under each field, not toast-only.
    const next: FieldErrors = {};
    if (!name.trim()) next.name = t("errorRequired");
    if (!email.trim()) next.email = t("errorRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t("emailInvalid");
    if (!message.trim()) next.message = t("errorRequired");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const honeypot = new FormData(e.currentTarget).get("website");
    setSubmitting(true);
    const result = await submitContactForm({ name, email, budget, message, website: String(honeypot ?? "") });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setBudget("");
      setMessage("");
    } else {
      setErrors({ server: result.error || t("error") });
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-3" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="#f46c38" strokeWidth="2" aria-hidden="true" className="size-12 mx-auto">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-lg font-medium">{t("thankYou")}</p>
        <p className="text-sm text-muted-foreground">{t("sentDesc")}</p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>{t("sendAnother")}</Button>
      </div>
    );
  }

  const inputClass =
    "h-12 rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none";
  const labelClass = "block text-sm text-muted-foreground mb-1.5";
  const errorClass = "block text-sm text-red-500 mt-1.5";

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {errors.server && (
        <p role="alert" className="text-sm text-red-500 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
          {errors.server}
        </p>
      )}
      <div>
        <label className={labelClass} htmlFor="contact-name">{t("nameLabel")} *</label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder="Name *"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className={inputClass}
        />
        {errors.name && <span id="contact-name-error" className={errorClass}>{errors.name}</span>}
      </div>
      <div>
        <label className={labelClass} htmlFor="contact-email">{t("emailLabel")} *</label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email *"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        {errors.email && <span id="contact-email-error" className={errorClass}>{errors.email}</span>}
      </div>
      <div>
        <label className={labelClass} htmlFor="contact-budget">{t("budget")}</label>
        <Select value={budget} onValueChange={(v) => setBudget(v || "")}>
          <SelectTrigger id="contact-budget" className="h-12 w-full rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground">
            <SelectValue placeholder={t("budget")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-3k">{"< $3,000"}</SelectItem>
            <SelectItem value="3k-5k">$3,000 - $5,000</SelectItem>
            <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
            <SelectItem value="over-10k">{"> $10,000"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className={labelClass} htmlFor="contact-message">{t("messageLabel")} *</label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Message *"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={5}
          className={`rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none resize-none ${errors.message ? "border-destructive/60" : ""}`}
        />
        {errors.message && <span id="contact-message-error" className={errorClass}>{errors.message}</span>}
      </div>
      {/* Honeypot: hidden from humans, bots fill it */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-12 rounded-lg bg-accent text-white font-medium text-base hover:opacity-90 transition-opacity"
      >
        {submitting && <Spinner aria-hidden="true" className="size-4 mr-2" />}
        {submitting ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
