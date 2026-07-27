"use client";

import { useState, useEffect } from "react";
import { getTools, createTool, updateTool, deleteTool } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  category: string;
  href: string;
  icon: string;
  sort_order: number;
}

export function ToolsTab() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState<Tool | null>(null);
  const [deleteModal, setDeleteModal] = useState<Tool | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", href: "", icon: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getTools();
    setTools(data as Tool[]);
    setLoading(false);
  }

  function openEdit(t: Tool) {
    setEditModal(t);
    setForm({ name: t.name, category: t.category, href: t.href, icon: t.icon });
  }

  async function handleSave() {
    if (!editModal) return;
    setSaving(true);
    const fields = ["name", "category", "href", "icon"] as const;
    for (const f of fields) {
      if (form[f] !== (editModal as unknown as Record<string, string>)[f]) {
        const r = await updateTool(editModal.id, f, form[f]);
        if (!r.success) { toast.error(r.error || `Failed to update ${f}`); setSaving(false); return; }
      }
    }
    setTools(prev => prev.map(t => t.id === editModal.id ? { ...t, ...form } : t));
    toast.success("Tool updated");
    setEditModal(null);
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteModal) return;
    await deleteTool(deleteModal.id);
    setTools(prev => prev.filter(t => t.id !== deleteModal.id));
    toast.success("Tool deleted");
    setDeleteModal(null);
  }

  async function handleAdd(data: { name: string; category: string; href: string; icon: string }) {
    const result = await createTool(data);
    if (result.tool) setTools(prev => [...prev, result.tool as Tool]);
    setShowAdd(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-heading">Tools ({tools.length})</h3>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <PlusIcon data-icon="inline-start" /> Add Tool
        </Button>
      </div>

      <div className="space-y-3">
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
              {tool.icon
                ? <img src={tool.icon} alt="" className="w-full h-full object-contain" />
                : <span className="text-xs text-muted-foreground">?</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{tool.name}</p>
              <p className="text-xs text-muted-foreground">{tool.category}</p>
              <p className="text-xs text-muted-foreground/60 truncate">{tool.href}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon-xs" onClick={() => openEdit(tool)}>
                <PencilIcon />
              </Button>
              <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" onClick={() => setDeleteModal(tool)}>
                <TrashIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Tool</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Category</label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Design Tool" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Link URL</label><Input value={form.href} onChange={e => setForm(p => ({ ...p, href: e.target.value }))} placeholder="https://..." /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Icon URL</label><Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="https://..." /></div>
            {form.icon && (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <img src={form.icon} alt="Preview" className="w-10 h-10 object-contain rounded" />
                <span className="text-sm text-muted-foreground">Icon preview</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Spinner className="size-4 mr-2" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteModal?.name}</strong>? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Modal */}
      {showAdd && <AddToolModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}

function AddToolModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: { name: string; category: string; href: string; icon: string }) => void }) {
  const [form, setForm] = useState({ name: "", category: "", href: "", icon: "" });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Tool</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Tool name" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Category</label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Design Tool" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Link URL</label><Input value={form.href} onChange={e => setForm(p => ({ ...p, href: e.target.value }))} placeholder="https://..." /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Icon URL</label><Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="https://..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onAdd(form)} disabled={!form.name}>Add Tool</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
