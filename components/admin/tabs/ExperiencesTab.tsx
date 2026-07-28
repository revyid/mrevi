"use client";

import { useState, useEffect } from "react";
import { getExperiences, createExperience, updateExperience, deleteExperience } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react";

interface Experience {
  id: string;
  company: string;
  description: string;
  period: string;
  sort_order: number;
}

export function ExperiencesTab() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState<Experience | null>(null);
  const [deleteModal, setDeleteModal] = useState<Experience | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company: "", description: "", period: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getExperiences();
    setExperiences(data as Experience[]);
    setLoading(false);
  }

  function openEdit(e: Experience) {
    setEditModal(e);
    setForm({ company: e.company, description: e.description, period: e.period });
  }

  async function handleSave() {
    if (!editModal) return;
    setSaving(true);
    const fields = ["company", "description", "period"] as const;
    for (const f of fields) {
      if (form[f] !== (editModal as unknown as Record<string, string>)[f]) {
        const r = await updateExperience(editModal.id, f, form[f]);
        if (!r.success) { toast.error(r.error || `Failed to update ${f}`); setSaving(false); return; }
      }
    }
    setExperiences(prev => prev.map(e => e.id === editModal.id ? { ...e, ...form } : e));
    toast.success("Journey entry updated");
    setEditModal(null);
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteModal) return;
    await deleteExperience(deleteModal.id);
    setExperiences(prev => prev.filter(e => e.id !== deleteModal.id));
    toast.success("Journey entry deleted");
    setDeleteModal(null);
  }

  async function handleAdd(data: { company: string; description: string; period: string }) {
    const result = await createExperience(data);
    if (result.experience) setExperiences(prev => [...prev, result.experience as Experience]);
    setShowAdd(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-heading">Journey ({experiences.length})</h3>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <PlusIcon data-icon="inline-start" /> Add Entry
        </Button>
      </div>

      <div className="space-y-3">
        {experiences.map((exp) => (
          <div key={exp.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{exp.company}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{exp.description}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{exp.period}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon-xs" onClick={() => openEdit(exp)}>
                <PencilIcon />
              </Button>
              <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" onClick={() => setDeleteModal(exp)}>
                <TrashIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Journey Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Company</label><Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Period</label><Input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="Jan 2020 - Present" /></div>
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
            <AlertDialogTitle>Delete Journey Entry</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteModal?.company}</strong>? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Modal */}
      {showAdd && <AddExperienceModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}

function AddExperienceModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: { company: string; description: string; period: string }) => void }) {
  const [form, setForm] = useState({ company: "", description: "", period: "" });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Journey Entry</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Company / Place</label><Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="School, organization, project..." /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="What did you do / learn?" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Period</label><Input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="Jan 2020 - Present" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onAdd(form)} disabled={!form.company}>Add Entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
