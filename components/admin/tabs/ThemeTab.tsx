"use client";

import { useState, useEffect, useCallback } from "react";
import { getTheme, updateTheme } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const PRESETS = [
  {
    name: "Default Dark",
    values: { theme_background: "#0a0a0a", theme_foreground: "#fafafa", theme_card: "#141414", theme_primary: "#ebebeb", theme_muted: "#1e1e1e", theme_accent: "#f46c38", theme_border: "#282828", theme_ring: "#888888", theme_destructive: "#e53e3e", theme_radius: "0.625" },
  },
  {
    name: "Blue Dark",
    values: { theme_background: "#080c14", theme_foreground: "#e8f0fe", theme_card: "#0f1724", theme_primary: "#4a9eff", theme_muted: "#151e30", theme_accent: "#4a9eff", theme_border: "#1e2d48", theme_ring: "#4a9eff", theme_destructive: "#e53e3e", theme_radius: "0.625" },
  },
  {
    name: "Green Dark",
    values: { theme_background: "#080e0a", theme_foreground: "#e8f5ea", theme_card: "#0d1a10", theme_primary: "#4ade80", theme_muted: "#122016", theme_accent: "#4ade80", theme_border: "#1a3520", theme_ring: "#4ade80", theme_destructive: "#e53e3e", theme_radius: "0.625" },
  },
  {
    name: "Purple Dark",
    values: { theme_background: "#0a0810", theme_foreground: "#f0e8ff", theme_card: "#13101e", theme_primary: "#a855f7", theme_muted: "#1a1428", theme_accent: "#a855f7", theme_border: "#2a1e42", theme_ring: "#a855f7", theme_destructive: "#e53e3e", theme_radius: "0.625" },
  },
  {
    name: "Warm Light",
    values: { theme_background: "#fdf8f2", theme_foreground: "#1a1209", theme_card: "#fff9f0", theme_primary: "#c2410c", theme_muted: "#f5ede0", theme_accent: "#f46c38", theme_border: "#e8d5be", theme_ring: "#c2410c", theme_destructive: "#dc2626", theme_radius: "0.625" },
  },
];

const FIELDS: { key: string; label: string; description: string; type: "color" | "number" }[] = [
  { key: "theme_background", label: "Background", description: "Page background", type: "color" },
  { key: "theme_foreground", label: "Foreground", description: "Default text color", type: "color" },
  { key: "theme_card", label: "Card", description: "Card / surface background", type: "color" },
  { key: "theme_primary", label: "Primary", description: "Buttons, links, highlights", type: "color" },
  { key: "theme_muted", label: "Muted", description: "Subtle backgrounds", type: "color" },
  { key: "theme_accent", label: "Accent", description: "Accent color (pill, badges)", type: "color" },
  { key: "theme_border", label: "Border", description: "Borders and dividers", type: "color" },
  { key: "theme_ring", label: "Ring", description: "Focus ring", type: "color" },
  { key: "theme_destructive", label: "Destructive", description: "Error / delete actions", type: "color" },
  { key: "theme_radius", label: "Border Radius (rem)", description: "0.25 – 1.5", type: "number" },
];

function hexToOklch(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const L = Math.cbrt(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const a_ = (r - g) * 0.5 + (r + g - 2 * b) * 0.25;
  const b_ = (r - b) * 0.3;
  const C = Math.sqrt(a_ * a_ + b_ * b_) * 0.8;
  const H = ((Math.atan2(b_, a_) * 180) / Math.PI + 360) % 360;
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${Math.round(H)})`;
}

export function ThemeTab() {
  const [theme, setTheme] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTheme().then((data) => { setTheme(data); setLoading(false); });
  }, []);

  const applyPreview = useCallback((t: Record<string, string>) => {
    const root = document.documentElement;
    if (t.theme_background) root.style.setProperty("--background", hexToOklch(t.theme_background));
    if (t.theme_foreground) root.style.setProperty("--foreground", hexToOklch(t.theme_foreground));
    if (t.theme_card) { root.style.setProperty("--card", hexToOklch(t.theme_card)); root.style.setProperty("--popover", hexToOklch(t.theme_card)); }
    if (t.theme_primary) { root.style.setProperty("--primary", hexToOklch(t.theme_primary)); root.style.setProperty("--secondary-foreground", hexToOklch(t.theme_primary)); }
    if (t.theme_muted) { root.style.setProperty("--muted", hexToOklch(t.theme_muted)); root.style.setProperty("--secondary", hexToOklch(t.theme_muted)); root.style.setProperty("--accent", hexToOklch(t.theme_muted)); }
    if (t.theme_border) { root.style.setProperty("--border", hexToOklch(t.theme_border)); root.style.setProperty("--input", hexToOklch(t.theme_border)); }
    if (t.theme_ring) root.style.setProperty("--ring", hexToOklch(t.theme_ring));
    if (t.theme_destructive) root.style.setProperty("--destructive", hexToOklch(t.theme_destructive));
    if (t.theme_radius) root.style.setProperty("--radius", `${t.theme_radius}rem`);
  }, []);

  function update(key: string, value: string) {
    const next = { ...theme, [key]: value };
    setTheme(next);
    applyPreview(next);
  }

  function applyPreset(preset: (typeof PRESETS)[0]) {
    const next = { ...theme, ...preset.values };
    setTheme(next);
    applyPreview(next);
    toast.success(`Preset "${preset.name}" applied — click Save to persist`);
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateTheme(theme);
    if (result.success) toast.success("Theme saved");
    else toast.error(result.error || "Failed to save theme");
    setSaving(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading">Theme</h3>
          <p className="text-sm text-muted-foreground mt-1">Color palette and border radius. Changes preview live.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner className="size-4 mr-2" />Saving...</> : "Save Theme"}
        </Button>
      </div>
      <Separator />

      {/* Presets */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted transition-colors">
              <span className="size-3 rounded-full border" style={{ background: preset.values.theme_accent }} />
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      <Separator />

      {/* Color fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label, description, type }) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg border">
            {type === "color" ? (
              <input type="color" value={theme[key] || "#000000"} onChange={(e) => update(key, e.target.value)}
                className="size-10 rounded-md cursor-pointer border-0 p-0.5 bg-transparent shrink-0" />
            ) : (
              <div className="shrink-0 w-20">
                <Input type="number" step="0.125" min="0.25" max="2"
                  value={theme[key] || "0.625"} onChange={(e) => update(key, e.target.value)}
                  className="h-10 text-center text-sm" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {type === "color" && (
              <code className="text-xs text-muted-foreground font-mono shrink-0">{theme[key] || "—"}</code>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
