"use client";

import { useState, useEffect } from "react";
import { getPageSettings, upsertPageSetting, deletePageSetting, type PageSetting } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "live", label: "Live", color: "bg-green-500", description: "Accessible normally" },
  { value: "maintenance", label: "Maintenance", color: "bg-yellow-500", description: "Shows maintenance page" },
  { value: "coming_soon", label: "Coming Soon", color: "bg-blue-500", description: "Shows coming soon page" },
  { value: "hidden", label: "Hidden (404)", color: "bg-red-500", description: "Returns 404" },
] as const;

const ROLE_OPTIONS = [
  { value: "public", label: "Public", description: "Anyone can access" },
  { value: "user", label: "Users only", description: "Must be logged in" },
  { value: "admin", label: "Admin only", description: "Admin role required" },
] as const;

function StatusBadge({ status }: { status: PageSetting["status"] }) {
  const s = STATUS_OPTIONS.find(o => o.value === status);
  if (!s) return null;
  const variants: Record<string, string> = {
    live: "bg-green-500/10 text-green-400 border-green-500/20",
    maintenance: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    coming_soon: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    hidden: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${variants[status]}`}>
      <span className={`size-1.5 rounded-full ${s.color}`} />
      {s.label}
    </span>
  );
}

function RoleBadge({ role }: { role: PageSetting["access_role"] }) {
  const colors: Record<string, string> = {
    public: "bg-muted text-muted-foreground",
    user: "bg-primary/10 text-primary",
    admin: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
      {role === "public" ? "🌍 Public" : role === "user" ? "👤 Users" : "🔒 Admin"}
    </span>
  );
}

const EMPTY_FORM = { path: "", label: "", status: "live" as PageSetting["status"], access_role: "public" as PageSetting["access_role"] };

export function PagesTab() {
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<PageSetting | "new" | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getPageSettings();
    setPages(data);
    setLoading(false);
  }

  function openEdit(page: PageSetting) {
    setForm({ path: page.path, label: page.label, status: page.status, access_role: page.access_role });
    setModal(page);
  }

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setModal("new");
  }

  async function handleSave() {
    if (!form.path.trim() || !form.label.trim()) {
      toast.error("Path and label required");
      return;
    }
    setSaving(true);
    const result = await upsertPageSetting(
      form.path.startsWith("/") ? form.path : `/${form.path}`,
      form.label,
      form.status,
      form.access_role
    );
    if (result.success) {
      toast.success("Page settings saved");
      await load();
      setModal(null);
    } else {
      toast.error(result.error || "Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deletePageSetting(id);
    if (result.success) {
      toast.success("Page removed");
      setPages(prev => prev.filter(p => p.id !== id));
    } else {
      toast.error(result.error || "Failed to delete");
    }
    setDeleting(null);
  }

  // Inline quick-update for status
  async function quickUpdateStatus(page: PageSetting, status: PageSetting["status"]) {
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, status } : p));
    const result = await upsertPageSetting(page.path, page.label, status, page.access_role);
    if (!result.success) { toast.error(result.error || "Failed"); load(); }
    else toast.success(`${page.label} → ${status}`);
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading">Page Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control status and access per page. Enforced by proxy on every request.
          </p>
        </div>
        <Button onClick={openNew} size="sm">
          <PlusIcon className="size-4 mr-2" />Add Page
        </Button>
      </div>
      <Separator />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {STATUS_OPTIONS.map(s => (
          <span key={s.value} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${s.color}`} />
            <strong>{s.label}</strong> — {s.description}
          </span>
        ))}
      </div>

      <Separator />

      {/* Table */}
      <div className="space-y-2">
        {pages.map(page => (
          <div key={page.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/20 transition-colors">
            {/* Path */}
            <code className="shrink-0 text-xs bg-muted px-2 py-1 rounded min-w-[100px]">{page.path}</code>

            {/* Label */}
            <span className="text-sm font-medium flex-1 min-w-0 truncate">{page.label}</span>

            {/* Role */}
            <RoleBadge role={page.access_role} />

            {/* Status quick-select */}
            <div className="flex items-center gap-1 shrink-0">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  title={s.label}
                  onClick={() => quickUpdateStatus(page, s.value)}
                  className={`size-5 rounded-full border-2 transition-all ${page.status === s.value ? "border-foreground scale-110" : "border-transparent opacity-40 hover:opacity-70"} ${s.color}`}
                />
              ))}
            </div>

            {/* Status badge */}
            <StatusBadge status={page.status} />

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon-xs" onClick={() => openEdit(page)}>
                <PencilIcon className="size-3.5" />
              </Button>
              {deleting === page.id ? <Spinner className="size-4 mx-1" /> : (
                <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(page.id)}
                  className="text-destructive hover:text-destructive">
                  <TrashIcon className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No pages configured. Run the SQL migration first, or add pages manually.
        </div>
      )}

      {/* Edit / Create Modal */}
      <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal === "new" ? "Add Page" : `Edit — ${modal && typeof modal === "object" ? modal.path : ""}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Path</label>
                <Input value={form.path} onChange={e => setForm(p => ({ ...p, path: e.target.value }))}
                  placeholder="/about" disabled={modal !== "new"} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="About" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setForm(p => ({ ...p, status: s.value }))}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${form.status === s.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <span className={`size-3 rounded-full shrink-0 ${s.color}`} />
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Access Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map(r => (
                  <button key={r.value} onClick={() => setForm(p => ({ ...p, access_role: r.value }))}
                    className={`flex flex-col p-3 rounded-lg border text-left transition-colors ${form.access_role === r.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Spinner className="size-4 mr-2" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
