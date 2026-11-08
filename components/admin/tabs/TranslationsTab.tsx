"use client";

import { useState, useEffect, useMemo } from "react";
import {
  upsertTranslation,
  listTranslations,
  autoTranslateMissing,
} from "@/app/actions/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SparklesIcon } from "lucide-react";

// Row shape from listTranslations() (DB `translations` table). Status is
// derived client-side: missing / stale = hash drift vs en / machine / ok.
interface Row {
  key: string;
  locale: string;
  text: string | null;
  source_hash: string | null;
  source_locale: string;
  is_machine: boolean;
}

type Status = "ok" | "missing" | "stale" | "machine-translated";

const LOCALES = [
  { code: "en", label: "English (EN)" },
  { code: "id", label: "Indonesia (ID)" },
] as const;

const STATUS_VARIANT: Record<Status, "default" | "destructive" | "secondary" | "outline"> = {
  ok: "default",
  missing: "destructive",
  stale: "secondary",
  "machine-translated": "outline",
};

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface Entry {
  key: string;
  text: string;
  status: Status;
  sourceText?: string;
}

export function TranslationsTab() {
  const [locale, setLocale] = useState<string>("id");
  const [rows, setRows] = useState<Row[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [autoTranslating, setAutoTranslating] = useState(false);

  async function load() {
    setLoading(true);
    const all = (await listTranslations()) as unknown as Row[];
    const safe = Array.isArray(all) ? all : [];
    setRows(safe);
    setDrafts(
      Object.fromEntries(
        safe
          .filter((r) => r.locale === locale)
          .map((r) => [`${locale}:${r.key}`, r.text ?? ""])
      )
    );
    setLoading(false);
  }

  const draftKey = (key: string) => `${locale}:${key}`;

  useEffect(() => {
    load();
  }, []);

  // Derive per-locale entries (incl. en keys missing in this locale) + statuses.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const enRows = rows.filter((r) => r.locale === "en");
      const enByKey = new Map(enRows.map((r) => [r.key, r.text ?? ""]));
      const locByKey = new Map(rows.filter((r) => r.locale === locale).map((r) => [r.key, r]));
      const next: Record<string, Status> = {};
      await Promise.all(
        [...enByKey.keys()].map(async (key) => {
          const row = locByKey.get(key);
          if (locale === "en") {
            next[key] = row?.text ? "ok" : "missing";
          } else if (!row?.text) {
            next[key] = "missing";
          } else if (row.source_hash !== (await sha256(enByKey.get(key) ?? ""))) {
            next[key] = "stale";
          } else if (row.is_machine) {
            next[key] = "machine-translated";
          } else {
            next[key] = "ok";
          }
        })
      );
      if (!cancelled) setStatuses(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [rows, locale]);

  const entries = useMemo<Entry[]>(() => {
    const enByKey = new Map(rows.filter((r) => r.locale === "en").map((r) => [r.key, r.text ?? ""]));
    const locByKey = new Map(rows.filter((r) => r.locale === locale).map((r) => [r.key, r]));
    return [...enByKey.keys()].map((key) => ({
      key,
      text: locByKey.get(key)?.text ?? "",
      status: statuses[key] ?? "missing",
      sourceText: locale === "en" ? undefined : enByKey.get(key),
    }));
  }, [rows, locale, statuses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.key.toLowerCase().includes(q) || e.text.toLowerCase().includes(q)
    );
  }, [entries, query]);

  async function handleSave(key: string) {
    const text = (drafts[draftKey(key)] ?? "").trim();
    if (!text) {
      toast.error("Text is required");
      return;
    }
    setSaving(key);
    const result = await upsertTranslation(key, locale, text);
    if (result.success) {
      toast.success("Translation saved");
      await load();
    } else {
      toast.error(result.error || "Failed to save");
    }
    setSaving(null);
  }

  async function handleAutoTranslate() {
    setAutoTranslating(true);
    const result = await autoTranslateMissing(locale);
    if (result.success) {
      toast.success("Auto-translate finished");
      await load();
    } else {
      toast.error(result.error || "Auto-translate failed");
    }
    setAutoTranslating(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-heading">Translations</h3>
          <p className="text-sm text-muted-foreground mt-1">Edit per-locale strings, or fill the gaps with machine translation.</p>
        </div>
        <Button onClick={handleAutoTranslate} disabled={autoTranslating || locale === "en"}>
          {autoTranslating ? <Spinner className="size-4 mr-2" /> : <SparklesIcon className="size-4 mr-2" />}
          Auto-translate missing
        </Button>
      </div>
      <Separator />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div role="group" aria-label="Locale" className="flex items-center gap-1 shrink-0">
          {LOCALES.map(({ code, label }) => (
            <Button
              key={code}
              variant={code === locale ? "default" : "outline"}
              size="sm"
              onClick={() => setLocale(code)}
              aria-pressed={code === locale}
            >
              {label}
            </Button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search keys or text…"
          aria-label="Search translations"
          className="sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No translations found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div
              key={entry.key}
              className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
            >
              <div className="shrink-0 md:w-56 min-w-0">
                <code className="block text-xs text-muted-foreground bg-muted px-2 py-1 rounded truncate">{entry.key}</code>
                {entry.sourceText && (
                  <p className="text-xs text-muted-foreground mt-1.5 truncate" title={entry.sourceText}>{entry.sourceText}</p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  value={drafts[draftKey(entry.key)] ?? entry.text}
                  onChange={(e) => setDrafts((p) => ({ ...p, [draftKey(entry.key)]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSave(entry.key)}
                  placeholder="Missing translation — type to add"
                  aria-label={`Text for ${entry.key}`}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANT[entry.status]} className="shrink-0">
                  {entry.status}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handleSave(entry.key)}
                  disabled={saving === entry.key || !(drafts[draftKey(entry.key)] ?? entry.text).trim()}
                >
                  {saving === entry.key && <Spinner className="size-4 mr-1.5" />}
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">Machine-translated rows are marked so you can review them. Editing a row resets its status to ok.</p>
    </div>
  );
}
