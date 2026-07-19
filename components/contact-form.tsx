"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const budgetOptions = [
  { value: "<$3k", label: "<$3k" },
  { value: "$3k-$5k", label: "$3k - $5k" },
  { value: "$5k-$10k", label: "$5k - $10k" },
  { value: ">$10k", label: ">$10k" },
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // Wire this up to your form backend of choice (Resend, Formspree, etc.)
    setTimeout(() => setStatus("sent"), 600);
  }

  if (status === "sent") {
    return (
      <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
        <p className="font-poppins text-lg font-semibold text-foreground">
          Thanks — message sent.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          I&apos;ll get back to you as soon as I can.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-left">
          <Label htmlFor="name" className="text-xs font-medium text-[rgb(136,136,136)]">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Your Name"
            className="h-11 rounded-lg border-0 bg-white/[0.08] text-foreground placeholder:text-[rgb(153,153,153)]"
          />
        </div>
        <div className="space-y-2 text-left">
          <Label htmlFor="email" className="text-xs font-medium text-[rgb(136,136,136)]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Your@email.com"
            className="h-11 rounded-lg border-0 bg-white/[0.08] text-foreground placeholder:text-[rgb(153,153,153)]"
          />
        </div>
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="budget" className="text-xs font-medium text-[rgb(136,136,136)]">
          Budget
        </Label>
        <Select name="budget" required>
          <SelectTrigger
            id="budget"
            className="h-11 w-full rounded-lg border-0 bg-white/[0.08] text-foreground data-[placeholder]:text-[rgb(153,153,153)]"
          >
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {budgetOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="message" className="text-xs text-muted-foreground">
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Message"
          rows={5}
          className="rounded-lg border-0 bg-white/[0.08] text-foreground placeholder:text-[rgb(153,153,153)]"
        />
      </div>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-11 w-full rounded-lg bg-accent text-sm font-semibold text-white hover:bg-accent/90"
      >
        {status === "submitting" ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}
