"use client";

import { useState, useEffect } from "react";
import { getCustomPages, createCustomPage, updateCustomPage, deleteCustomPage } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PencilIcon, TrashIcon, EyeIcon, EyeOffIcon, PlusIcon } from "lucide-react";

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_visible: boolean;
  sort_order: number;
}

const EMPTY: Omit<CustomPage, "id" | "sort_order"> = {
  title: "",
  slug: "",
  content: "",
  is_visible: true,
};

export function PagesTab() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | CustomPage | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getCustomPages();
    setPages(data as CustomPage[]);
    setLoading(false);
  }

  function openCreate() {
    setForm({ ...EMPTY });
    setModal("create");
  }

  function openEdit(page: CustomPage) {
    setForm({ title: page.title, slug: page.slug, content: page.content, is_visible: page.is_visible });
    setModal(page);
  }

  function slugify(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "title" && modal === "create" ? { slug: slugify(value as string) } : {}),
    }));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    if (modal === "create") {
      const result = await createCustomPage(form);
      if (result.success) {
        toast.success("Page created");
        await load();
        setModal(null);
      } else {
        toast.error(result.error || "Failed to create page");
      }
    } else if (modal && typeof modal === "object") {
      const result = await updateCustomPage(modal.id, form);
      if (result.success) {
        toast.success("Page updated");
        await load();
        setModal(null);
      } else {
        toast.error(result.error || "Failed to update page");
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deleteCustomPage(id);
    if (result.success) {
      toast.success("Page deleted");
      setPages((prev) => prev.filter((p) => p.id !== id));
    } else {
      toast.error(result.error || "Failed to delete");
    }
    setDeleting(null);
  }

  async function handleToggleVisibility(page: CustomPage) {
    const next = !page.is_visible;
    setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, is_visible: next } : p));
    const result = await updateCustomPage(page.id, { is_visible: next });
    if (result.success) toast.success(next ? "Page visible" : "Page hidden");
    else { toast.error("Failed"); load(); }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading">Custom Pages</h3>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, or hide custom pages. Accessible at <code>/[locale]/[slug]</code>.</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4 mr-2" />
          Add Page
        </Button>
      </div>
      <Separator />

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-muted-foreground text-sm">No custom pages yet.</p>
          <Button variant="outline" onClick={openCreate}>Create your first page</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${!page.is_visible ? "opacity-50 bg-muted/20" : "hover:bg-muted/30"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{page.title}</p>
                <code className="text-xs text-muted-foreground">/{page.slug}</code>
              </div>
              <Badge variant={page.is_visible ? "default" : "outline"} className="shrink-0">
                {page.is_visible ? "Visible" : "Hidden"}
              </Badge>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon-xs" onClick={() => openEdit(page)} title="Edit">
                  <PencilIcon className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => handleToggleVisibility(page)} title={page.is_visible ? "Hide" : "Show"}>
                  {page.is_visible ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                </Button>
                {deleting === page.id ? (
                  <Spinner className="size-4 mx-1" />
                ) : (
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(page.id)} title="Delete"
                    className="text-destructive hover:text-destructive">
                    <TrashIcon className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modal === "create" ? "Create Page" : "Edit Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="About Me" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="about-me" />
                <p className="text-xs text-muted-foreground">URL: /{form.slug || "slug"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content (Markdown supported)</label>
              <Textarea value={form.content} onChange={(e) => updateField("content", e.target.value)}
                placeholder="# About Me&#10;&#10;Write your page content here..." rows={10} className="font-mono text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="page-visible" checked={form.is_visible}
                onChange={(e) => updateField("is_visible", e.target.checked)}
                className="rounded" />
              <label htmlFor="page-visible" className="text-sm">Visible (show in site)</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Spinner className="size-4 mr-2" />}
              {modal === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
