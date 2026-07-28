"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "@/app/actions/content";
import { ImageUpload } from "../ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pill editor for comma-separated profile_roles
// ---------------------------------------------------------------------------

function PillEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [input, setInput] = useState("");
  const roles = value
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  function add() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const next = [...roles, trimmed].join(", ");
    onChange(next);
    setInput("");
  }

  function remove(idx: number) {
    const next = roles.filter((_, i) => i !== idx).join(", ");
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {/* Current pills */}
      <div className="flex flex-wrap gap-2 min-h-8">
        {roles.map((role, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
          >
            {role}
            <button
              type="button"
              className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              onClick={() => remove(idx)}
              aria-label={`Remove ${role}`}
            >
              Ã—
            </button>
          </span>
        ))}
        {roles.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No roles added yet</p>
        )}
      </div>
      {/* Add input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Add a role labelâ€¦"
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Stored as: <code className="text-xs bg-muted px-1 rounded">{value || "(empty)"}</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill Card Preview
// ---------------------------------------------------------------------------

function SkillCardPreview({
  text,
  cardType,
}: {
  text: string;
  cardType: "accent" | "primary";
}) {
  const isAccent = cardType === "accent";
  return (
    <div
      className={`relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl px-4 py-4 text-white text-xs ${
        isAccent ? "bg-accent" : "bg-primary"
      }`}
    >
      <div className="w-4 h-4 opacity-60">
        {isAccent ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        )}
      </div>
      <p className="font-medium leading-tight">{text || "Card text hereâ€¦"}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarTab
// ---------------------------------------------------------------------------

export function SidebarTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateSettings(settings);
    if (result.success) {
      toast.success("Sidebar settings saved");
    } else {
      toast.error(result.error || "Failed to save");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading">Sidebar &amp; Cards</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Edit profile card, rotating role pills, social links, and skill cards
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Spinner className="size-4 mr-2" />
              Savingâ€¦
            </>
          ) : (
            "Save All"
          )}
        </Button>
      </div>

      <Separator />

      {/* â”€â”€ Profile Card â”€â”€ */}
      <SectionHeader
        title="Profile Card"
        desc="Name, bio, and avatar shown in the sidebar"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Display Name">
          <Input
            value={settings.profile_name || ""}
            onChange={(e) => update("profile_name", e.target.value)}
            placeholder="M. Revi Ramadhan"
          />
        </Field>
        <Field label="Title (unused â€” replaced by rotating pills)">
          <Input
            value={settings.profile_title || ""}
            onChange={(e) => update("profile_title", e.target.value)}
            placeholder="Software Engineer"
          />
        </Field>
      </div>

      <Field label="Bio">
        <Textarea
          value={settings.profile_bio || ""}
          onChange={(e) => update("profile_bio", e.target.value)}
          placeholder="Short bio shown in the sidebarâ€¦"
          rows={3}
        />
      </Field>

      <Field label="Profile Avatar">
        <ImageUpload
          onUpload={(url) => update("profile_avatar", url)}
          currentImage={settings.profile_avatar}
        />
      </Field>

      <Separator />

      {/* â”€â”€ Rotating Role Pills â”€â”€ */}
      <SectionHeader
        title="Rotating Role Pills"
        desc="Labels that animate in the pill badge under the name"
      />
      <PillEditor
        value={settings.profile_roles || ""}
        onChange={(v) => update("profile_roles", v)}
      />

      <Separator />

      {/* â”€â”€ Social Links â”€â”€ */}
      <SectionHeader
        title="Social Links"
        desc="URLs for the social icons at the bottom of the profile card"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Facebook">
          <Input
            value={settings.social_facebook || ""}
            onChange={(e) => update("social_facebook", e.target.value)}
            placeholder="https://facebook.com/username"
          />
        </Field>
        <Field label="Twitter / X">
          <Input
            value={settings.social_twitter || ""}
            onChange={(e) => update("social_twitter", e.target.value)}
            placeholder="https://x.com/username"
          />
        </Field>
        <Field label="Instagram">
          <Input
            value={settings.social_instagram || ""}
            onChange={(e) => update("social_instagram", e.target.value)}
            placeholder="https://instagram.com/username"
          />
        </Field>
        <Field label="Email">
          <Input
            value={settings.social_email || ""}
            onChange={(e) => update("social_email", e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="GitHub">
          <Input
            value={settings.social_github || ""}
            onChange={(e) => update("social_github", e.target.value)}
            placeholder="https://github.com/username"
          />
        </Field>
        <Field label="LinkedIn">
          <Input
            value={settings.social_linkedin || ""}
            onChange={(e) => update("social_linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </Field>
      </div>

      <Separator />

      {/* â”€â”€ Skill Cards â”€â”€ */}
      <SectionHeader
        title="Skill Cards"
        desc='The two coloured cards shown below the hero section on the home page'
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="space-y-3 p-4 rounded-xl border">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Card 1</Badge>
            <span className="text-xs text-muted-foreground">Dark / Accent</span>
          </div>
          <SkillCardPreview
            text={settings.skill_card_1_text || ""}
            cardType={(settings.skill_card_1_type as "accent" | "primary") || "accent"}
          />
          <Field label="Card Text">
            <Input
              value={settings.skill_card_1_text || ""}
              onChange={(e) => update("skill_card_1_text", e.target.value)}
              placeholder="DYNAMIC ANIMATION, MOTION DESIGN"
            />
          </Field>
          <Field label="Link URL" hint="Where the arrow button takes the user">
            <Input
              value={settings.skill_card_1_href || ""}
              onChange={(e) => update("skill_card_1_href", e.target.value)}
              placeholder="/journey"
            />
          </Field>
          <Field label="Card Style">
            <div className="flex gap-2">
              {(["accent", "primary"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("skill_card_1_type", t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    (settings.skill_card_1_type || "accent") === t
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Card 2 */}
        <div className="space-y-3 p-4 rounded-xl border">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Card 2</Badge>
            <span className="text-xs text-muted-foreground">Primary</span>
          </div>
          <SkillCardPreview
            text={settings.skill_card_2_text || ""}
            cardType={(settings.skill_card_2_type as "accent" | "primary") || "primary"}
          />
          <Field label="Card Text">
            <Input
              value={settings.skill_card_2_text || ""}
              onChange={(e) => update("skill_card_2_text", e.target.value)}
              placeholder="FRAMER, FIGMA, WORDPRESS, REACTJS"
            />
          </Field>
          <Field label="Link URL" hint="Where the arrow button takes the user">
            <Input
              value={settings.skill_card_2_href || ""}
              onChange={(e) => update("skill_card_2_href", e.target.value)}
              placeholder="/projects"
            />
          </Field>
          <Field label="Card Style">
            <div className="flex gap-2">
              {(["accent", "primary"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("skill_card_2_type", t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    (settings.skill_card_2_type || "primary") === t
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
