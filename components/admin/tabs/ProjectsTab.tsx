"use client";

import { useState, useEffect } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  sort_order: number;
}

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState<Project | null>(null);
  const [deleteModal, setDeleteModal] = useState<Project | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", href: "", image: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getProjects();
    setProjects(data as Project[]);
    setLoading(false);
  }

  function openEdit(p: Project) {
    setEditModal(p);
    setForm({ title: p.title, subtitle: p.subtitle, href: p.href, image: p.image });
  }

  async function handleSave() {
    if (!editModal) return;
    setSaving(true);
    const fields = ["title", "subtitle", "href", "image"] as const;
    for (const f of fields) {
      if (form[f] !== (editModal as unknown as Record<string, string>)[f]) {
        const r = await updateProject(editModal.id, f, form[f]);
        if (!r.success) { toast.error(r.error || `Failed to update ${f}`); setSaving(false); return; }
      }
    }
    setProjects(prev => prev.map(p => p.id === editModal.id ? { ...p, ...form } : p));
    toast.success("Project updated");
    setEditModal(null);
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteModal) return;
    await deleteProject(deleteModal.id);
    setProjects(prev => prev.filter(p => p.id !== deleteModal.id));
    toast.success("Project deleted");
    setDeleteModal(null);
  }

  async function handleAdd(data: { title: string; subtitle: string; href: string; image: string }) {
    const result = await createProject(data);
    if (result.project) setProjects(prev => [...prev, result.project as Project]);
    setShowAdd(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-heading">Projects ({projects.length})</h3>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <PlusIcon data-icon="inline-start" /> Add Project
        </Button>
      </div>

      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors">
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
              {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground truncate">{p.subtitle}</p>
              <p className="text-xs text-muted-foreground/60 truncate">{p.href}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon-xs" onClick={() => openEdit(p)}>
                <PencilIcon />
              </Button>
              <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" onClick={() => setDeleteModal(p)}>
                <TrashIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Subtitle</label><Input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Link URL</label><Input value={form.href} onChange={e => setForm(p => ({ ...p, href: e.target.value }))} placeholder="https://..." /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Image URL</label><Input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." /></div>
            {form.image && <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />}
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteModal?.title}</strong>? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Modal */}
      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}

function AddProjectModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: { title: string; subtitle: string; href: string; image: string }) => void }) {
  const [form, setForm] = useState({ title: "", subtitle: "", href: "", image: "" });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Project name" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Subtitle</label><Input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Short description" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Link URL</label><Input value={form.href} onChange={e => setForm(p => ({ ...p, href: e.target.value }))} placeholder="https://..." /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Image URL</label><Input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onAdd(form)} disabled={!form.title}>Add Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
