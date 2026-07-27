"use client";

import { useState, useEffect } from "react";
import {
  getNavigationLinks,
  updateNavigationLink,
  updateNavigationLinkVisibility,
} from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PencilIcon, EyeIcon, EyeOffIcon } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

// Default links — used when table is empty
const DEFAULT_LINKS: Omit<NavLink, "is_visible">[] = [
  { href: "/", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", sort_order: 1 },
  { href: "/projects", label: "Projects", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", sort_order: 2 },
  { href: "/experience", label: "Experience", icon: "M2 7h20v14H2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", sort_order: 3 },
  { href: "/tools", label: "Tools", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", sort_order: 4 },
  { href: "/blog", label: "Thoughts", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", sort_order: 5 },
];

export function NavigationTab() {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<NavLink | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingHref, setUpdatingHref] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getNavigationLinks();
    const navLinks = data as NavLink[];
    setLinks(navLinks);
    setIsEmpty(navLinks.length === 0);
    setLoading(false);
  }

  async function handleSeedLinks() {
    setSeeding(true);
    try {
      const res = await fetch("/api/nav-seed", { method: "POST" });
      if (res.ok) {
        await load();
        toast.success("Navigation links created");
      } else {
        toast.error("Failed to seed links");
      }
    } catch {
      toast.error("Failed to seed links");
    }
    setSeeding(false);
  }

  function openEdit(link: NavLink) {
    setEditModal(link);
    setEditLabel(link.label);
  }

  async function handleSaveLabel() {
    if (!editModal) return;
    setSaving(true);
    const result = await updateNavigationLink(editModal.href, editLabel);
    if (result.success) {
      setLinks(prev => prev.map(l => l.href === editModal.href ? { ...l, label: editLabel } : l));
      toast.success("Label updated");
      setEditModal(null);
    } else {
      toast.error(result.error || "Failed to update");
    }
    setSaving(false);
  }

  async function handleToggleVisibility(href: string, current: boolean) {
    setUpdatingHref(href);
    const next = !current;
    setLinks(prev => prev.map(l => l.href === href ? { ...l, is_visible: next } : l));
    const result = await updateNavigationLinkVisibility(href, next);
    if (result.success) {
      toast.success(next ? "Link visible" : "Link hidden");
    } else {
      toast.error("Failed to update visibility");
      load();
    }
    setUpdatingHref(null);
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold font-heading">Navigation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Edit nav link labels and toggle visibility. Routes are fixed.
        </p>
      </div>

      <Separator />

      {/* Empty state — table not seeded yet */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <p className="text-sm text-muted-foreground">No navigation links found in the database.</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            This usually means the <code>navigation_links</code> table is empty.
            Click below to seed the default links.
          </p>
          <Button onClick={handleSeedLinks} disabled={seeding}>
            {seeding && <Spinner className="size-4 mr-2" />}
            Seed Default Links
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.href}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                link.is_visible ? "hover:bg-muted/50" : "opacity-50 bg-muted/20"
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 size-8 flex items-center justify-center rounded-lg bg-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-muted-foreground">
                  <path d={link.icon} />
                </svg>
              </div>

              {/* Route */}
              <code className="shrink-0 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {link.href}
              </code>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{link.label}</p>
              </div>

              {/* Visibility badge */}
              <Badge
                variant={link.is_visible ? "default" : "outline"}
                className="shrink-0"
              >
                {link.is_visible ? "Visible" : "Hidden"}
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {updatingHref === link.href ? (
                  <Spinner className="size-4" />
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEdit(link)}
                      title="Edit label"
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleToggleVisibility(link.href, link.is_visible)}
                      title={link.is_visible ? "Hide from nav" : "Show in nav"}
                    >
                      {link.is_visible ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <p className="text-xs text-muted-foreground">
        Hiding a link removes it from the nav bar but does not disable the route.
      </p>

      {/* Edit Label Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Navigation Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Route (fixed)</label>
              <code className="block text-sm bg-muted px-3 py-2 rounded-lg">{editModal?.href}</code>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Label</label>
              <Input
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveLabel()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleSaveLabel} disabled={saving || !editLabel.trim()}>
              {saving && <Spinner className="size-4 mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
