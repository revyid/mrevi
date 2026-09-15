"use client";

import { useState, useEffect } from "react";
import {
  getBizProducts,
  createBizProduct,
  updateBizProduct,
  deleteBizProduct,
  getBizSettings,
  updateBizSettings,
  type BizProduct,
} from "@/app/actions/biz";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, TrashIcon, PackageIcon, ImageIcon } from "lucide-react";

export function BizTab() {
  const [products, setProducts] = useState<BizProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit sheet
  const [editing, setEditing] = useState<BizProduct | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState<BizProduct | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editTag, setEditTag] = useState("");

  // Settings
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  async function loadProducts() {
    const data = await getBizProducts();
    setProducts(data);
    setLoading(false);
  }

  async function loadSettings() {
    const data = await getBizSettings();
    setSettings(data);
  }

  function openEdit(product: BizProduct) {
    setEditing(product);
    setEditName(product.name);
    setEditDesc(product.desc);
    setEditPrice(product.price);
    setEditImage(product.image);
    setEditTag(product.tag);
    setSheetOpen(true);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    await updateBizProduct(editing.id, "name", editName);
    await updateBizProduct(editing.id, "desc", editDesc);
    await updateBizProduct(editing.id, "price", editPrice);
    await updateBizProduct(editing.id, "image", editImage);
    await updateBizProduct(editing.id, "tag", editTag);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editing.id
          ? { ...p, name: editName, desc: editDesc, price: editPrice, image: editImage, tag: editTag }
          : p
      )
    );
    setSheetOpen(false);
    setSaving(false);
  }

  async function handleAdd() {
    setSaving(true);
    const result = await createBizProduct({
      name: editName,
      desc: editDesc,
      price: editPrice,
      image: editImage,
      tag: editTag,
    });
    if (result.success) {
      await loadProducts();
      setShowAdd(false);
      setEditName("");
      setEditDesc("");
      setEditPrice("");
      setEditImage("");
      setEditTag("");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setUpdatingId(id);
    await deleteBizProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteModal(null);
    setUpdatingId(null);
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    await updateBizSettings(settings);
    setSettingsSaving(false);
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setEditName("");
    setEditDesc("");
    setEditPrice("");
    setEditImage("");
    setEditTag("Product");
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* ─── Products ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading">Products ({products.length})</h3>
          <Button
            onClick={() => {
              resetForm();
              setShowAdd(true);
            }}
          >
            <PlusIcon className="size-4 mr-2" />
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No products yet. Add your first product.</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => openEdit(product)}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover border shrink-0"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                    <PackageIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{product.name}</p>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{product.tag}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.desc}</p>
                </div>
                <p className="text-sm font-semibold shrink-0">{product.price}</p>
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {updatingId === product.id && <Spinner className="size-4" />}
                  <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteModal(product)}>
                    <TrashIcon className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* ─── Settings ─── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading">Biz Settings</h3>
        <div className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero Title Line 1</label>
              <Input value={settings.biz_hero_title_1 || ""} onChange={(e) => updateSetting("biz_hero_title_1", e.target.value)} placeholder="PREMIUM" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero Title Line 2</label>
              <Input value={settings.biz_hero_title_2 || ""} onChange={(e) => updateSetting("biz_hero_title_2", e.target.value)} placeholder="PRODUCTS" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Description</label>
            <Textarea value={settings.biz_hero_description || ""} onChange={(e) => updateSetting("biz_hero_description", e.target.value)} rows={3} placeholder="High-quality digital products and templates..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Email</label>
            <Input value={settings.biz_contact_email || ""} onChange={(e) => updateSetting("biz_contact_email", e.target.value)} placeholder="hello@revy.biz.id" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Footer Text</label>
            <Input value={settings.biz_footer_text || ""} onChange={(e) => updateSetting("biz_footer_text", e.target.value)} placeholder="Revy Biz" />
          </div>
          <Button onClick={handleSaveSettings} disabled={settingsSaving}>
            <Spinner className={`size-4 mr-2 ${settingsSaving ? "" : "hidden"}`} />
            Save Settings
          </Button>
        </div>
      </div>

      {/* ─── Edit Sheet ─── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Product</SheetTitle>
            <SheetDescription>Update the product details</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload multiple={false} currentImage={editImage} onUpload={setEditImage} />
              {!editImage && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="size-3" /> No image — the landing page shows an icon fallback.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="$49" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                <Input value={editTag} onChange={(e) => setEditTag(e.target.value)} placeholder="Template" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Spinner className={`size-4 mr-2 ${saving ? "" : "hidden"}`} />
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Add Modal ─── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Create a new product for the biz landing page</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload multiple={false} currentImage={editImage} onUpload={setEditImage} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="TechFlow SaaS" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} placeholder="Modern SaaS landing page template" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="$49" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                <Input value={editTag} onChange={(e) => setEditTag(e.target.value)} placeholder="Template" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>
              <Spinner className={`size-4 mr-2 ${saving ? "" : "hidden"}`} />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ─── */}
      <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>This product will be permanently deleted from the landing page.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteModal && handleDelete(deleteModal.id)}
              disabled={updatingId === deleteModal?.id}
            >
              {updatingId === deleteModal?.id && <Spinner className="size-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
