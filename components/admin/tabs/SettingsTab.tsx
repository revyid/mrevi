"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const result = await updateSettings(settings);
    if (result.success) toast.success("Settings saved");
    else toast.error(result.error || "Failed to save");
    setSaving(false);
  }

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading">Site Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">Hero section, stats, and footer</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner className="size-4 mr-2" />Saving...</> : "Save All"}
        </Button>
      </div>

      <Separator />

      {/* Hero */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold">Hero Section</h4>
          <p className="text-xs text-muted-foreground">The large heading and description on the home page</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title Line 1</label>
            <Input value={settings.hero_title_1 || ""} onChange={(e) => update("hero_title_1", e.target.value)} placeholder="SOFTWARE" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title Line 2</label>
            <Input value={settings.hero_title_2 || ""} onChange={(e) => update("hero_title_2", e.target.value)} placeholder="ENGINEER" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hero Description</label>
          <Textarea value={settings.hero_description || ""} onChange={(e) => update("hero_description", e.target.value)} placeholder="Short description about yourself..." rows={3} />
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold">Stats</h4>
          <p className="text-xs text-muted-foreground">The three numbers shown below the hero description</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Stat 1</p>
            <Input value={settings.stat_1_num || ""} onChange={(e) => update("stat_1_num", e.target.value)} placeholder="+12" />
            <Input value={settings.stat_1_label || ""} onChange={(e) => update("stat_1_label", e.target.value)} placeholder="YEARS OF EXPERIENCE" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Stat 2</p>
            <Input value={settings.stat_2_num || ""} onChange={(e) => update("stat_2_num", e.target.value)} placeholder="+46" />
            <Input value={settings.stat_2_label || ""} onChange={(e) => update("stat_2_label", e.target.value)} placeholder="PROJECTS COMPLETED" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Stat 3</p>
            <Input value={settings.stat_3_num || ""} onChange={(e) => update("stat_3_num", e.target.value)} placeholder="+20" />
            <Input value={settings.stat_3_label || ""} onChange={(e) => update("stat_3_label", e.target.value)} placeholder="WORLDWIDE CLIENTS" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Section Titles */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold">Section Headings</h4>
          <p className="text-xs text-muted-foreground">The two-line headings for each section on the home page</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Projects", key1: "section_projects_line1", key2: "section_projects_line2" },
            { label: "Experience", key1: "section_experience_line1", key2: "section_experience_line2" },
            { label: "Tools", key1: "section_tools_line1", key2: "section_tools_line2" },
            { label: "Blog", key1: "section_blog_line1", key2: "section_blog_line2" },
            { label: "Contact", key1: "section_contact_line1", key2: "section_contact_line2" },
          ].map(({ label, key1, key2 }) => (
            <div key={label} className="space-y-2 p-3 rounded-lg border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
              <Input value={settings[key1] || ""} onChange={(e) => update(key1, e.target.value)} placeholder="Line 1 (solid)" />
              <Input value={settings[key2] || ""} onChange={(e) => update(key2, e.target.value)} placeholder="Line 2 (faded)" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Footer */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold">Footer</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Credit 1 — Label</label>
            <Input value={settings.footer_credit_1_label || ""} onChange={(e) => update("footer_credit_1_label", e.target.value)} placeholder="Templyo" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Credit 1 — URL</label>
            <Input value={settings.footer_credit_1_href || ""} onChange={(e) => update("footer_credit_1_href", e.target.value)} placeholder="https://templyo.io" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Credit 2 — Label</label>
            <Input value={settings.footer_credit_2_label || ""} onChange={(e) => update("footer_credit_2_label", e.target.value)} placeholder="Framer" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Credit 2 — URL</label>
            <Input value={settings.footer_credit_2_href || ""} onChange={(e) => update("footer_credit_2_href", e.target.value)} placeholder="https://framer.com" />
          </div>
        </div>
      </div>
    </div>
  );
}
