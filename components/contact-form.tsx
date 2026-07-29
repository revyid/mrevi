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
import { toast } from "sonner";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const result = await submitContactForm({ name, email, budget, message });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setBudget("");
      setMessage("");
      toast.success("Message sent! I'll get back to you soon.");
    } else {
      toast.error(result.error || "Failed to send message. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="#f46c38" strokeWidth="2" className="size-12 mx-auto">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-lg font-medium">Thank you!</p>
        <p className="text-sm text-muted-foreground">Your message has been sent. I'll reply as soon as possible.</p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>Send another message</Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <Input
          placeholder="Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="h-12 rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="h-12 rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50"
        />
      </div>
      <div>
        <Select value={budget} onValueChange={(v) => setBudget(v || "")}>
          <SelectTrigger className="h-12 w-full rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground">
            <SelectValue placeholder="Budget (optional)" />
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
        <Textarea
          placeholder="Message *"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={5}
          className="rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-12 rounded-lg bg-accent text-white font-medium text-base hover:opacity-90 transition-opacity"
      >
        {submitting && <Spinner className="size-4 mr-2" />}
        {submitting ? "Sending..." : "Submit"}
      </Button>
    </form>
  );
}
