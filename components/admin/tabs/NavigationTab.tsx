"use client";

import { useState, useEffect } from "react";
import {
  getNavigationLinks,
  updateNavigationLink,
  updateNavigationLinkVisibility,
  createNavigationLink,
  deleteNavigationLink,
  reorderNavigationLinks,
} from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PencilIcon, EyeIcon, EyeOffIcon, TrashIcon, PlusIcon, GripVerticalIcon } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

export function NavigationTab() {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<NavLink | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");
  const [newLink, setNewLink] = useState({ href: "", label: "", icon: "" });
  const [saving, setSaving] = useState(false);
  const [updatingHref, setUpdatingHref] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getNavigationLinks();
    setLinks(data as NavLink[]);
    setLoading(false);
  }

  function openEdit(link: NavLink) {
    setEditModal(link);
    setEditLabel(link.label);
    setEditHref(link.href);
  }

  async function handleSaveLabel() {
    if (!editModal) return;
    setSaving(true);
    const result = await updateNavigationLink(editModal.href, editLabel, editHref);
    if (result.success) {
      setLinks(prev => prev.map(l => l.href === editModal.href ? { ...l, label: editLabel, href: editHref } : l));
      toast.success("Navigation updated");
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
    if (result.success) toast.success(next ? "Link visible" : "Link hidden");
    else { toast.error("Failed to update visibility"); load(); }
    setUpdatingHref(null);
  }

  async function handleCreate() {
    if (!newLink.href.trim() || !newLink.label.trim()) {
      toast.error("Href and label are required");
      return;
    }
    setSaving(true);
    const result = await createNavigationLink({
      href: newLink.href.startsWith("/") ? newLink.href : `/${newLink.href}`,
      label: newLink.label,
      icon: newLink.icon || "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      sort_order: links.length + 1,
    });
    if (result.success) {
      toast.success("Link created");
      await load();
      setCreateModal(false);
      setNewLink({ href: "", label: "", icon: "" });
    } else {
      toast.error(result.error || "Failed to create");
    }
    setSaving(false);
  }

  async function handleDelete(href: string) {
    setDeleting(href);
    const result = await deleteNavigationLink(href);
    if (result.success) {
      toast.success("Link deleted");
      setLinks(prev => prev.filter(l => l.href !== href));
    } else {
      toast.error(result.error || "Failed to delete");
    }
    setDeleting(null);
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...links];
    const [dragged] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, dragged);
    setLinks(reordered);
    setDragIdx(idx);
  }

  async function handleDragEnd() {
    if (dragIdx === null) return;
    setDragIdx(null);
    const updated = links.map((l, i) => ({ href: l.href, sort_order: i + 1 }));
    await reorderNavigationLinks(updated);
    toast.success("Order saved");
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading">Navigation</h3>
          <p className="text-sm text-muted-foreground mt-1">Drag to reorder, toggle visibility, edit labels, or add custom links.</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <PlusIcon className="size-4 mr-2" />Add Link
        </Button>
      </div>
      <Separator />

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <p className="text-sm text-muted-foreground">No navigation links found.</p>
          <Button onClick={() => fetch("/api/nav-seed", { method: "POST" }).then(() => load())}>
            Seed Default Links
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div
              key={link.href}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none
                ${link.is_visible ? "hover:bg-muted/50" : "opacity-50 bg-muted/20"}
                ${dragIdx === idx ? "ring-2 ring-primary opacity-60" : ""}`}
            >
              <GripVerticalIcon className="size-4 text-muted-foreground shrink-0" />
              <div className="shrink-0 size-8 flex items-center justify-center rounded-lg bg-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-muted-foreground">
                  <path d={link.icon} />
                </svg>
              </div>
              <code className="shrink-0 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{link.href}</code>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{link.label}</p>
              </div>
              <Badge variant={link.is_visible ? "default" : "outline"} className="shrink-0">
                {link.is_visible ? "Visible" : "Hidden"}
              </Badge>
              <div className="flex items-center gap-1 shrink-0">
                {updatingHref === link.href ? <Spinner className="size-4" /> : (
                  <>
                    <Button variant="ghost" size="icon-xs" onClick={() => openEdit(link)} title="Edit label">
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleToggleVisibility(link.href, link.is_visible)}>
                      {link.is_visible ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                    </Button>
                    {deleting === link.href ? <Spinner className="size-4 mx-1" /> : (
                      <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(link.href)}
                        className="text-destructive hover:text-destructive">
                        <TrashIcon className="size-3.5" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">Drag rows to reorder. Hiding removes from nav but does not disable the route.</p>

      {/* Edit Label Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Navigation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Path</label>
              <Input value={editHref} onChange={e => setEditHref(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveLabel()} autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Label</label>
              <Input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveLabel()} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleSaveLabel} disabled={saving || !editLabel.trim() || !editHref.trim()}> {saving && <Spinner className="size-4 mr-2" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createModal} onOpenChange={() => setCreateModal(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Navigation Link</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Path</label>
              <Input value={newLink.href} onChange={e => setNewLink(p => ({ ...p, href: e.target.value }))} placeholder="/about" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input value={newLink.label} onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))} placeholder="About" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon SVG path <span className="text-muted-foreground">(optional)</span></label>
              <Input value={newLink.icon} onChange={e => setNewLink(p => ({ ...p, icon: e.target.value }))} placeholder="M12 2L2 7l10 5 10-5z" />
              <p className="text-xs text-muted-foreground">SVG d attribute for 24x24 viewBox. Leave blank for default home icon.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Spinner className="size-4 mr-2" />}Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
