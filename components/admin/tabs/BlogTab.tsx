"use client";

import { useState, useEffect } from "react";
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/app/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  date: string;
  read_time: string;
  sort_order: number;
}

export function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<BlogPost | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editReadTime, setEditReadTime] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const data = await getBlogPosts();
    setPosts(data as BlogPost[]);
    setLoading(false);
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditExcerpt(post.excerpt);
    setEditContent(post.content || "");
    setEditSlug(post.slug);
    setEditDate(post.date);
    setEditReadTime(post.read_time);
    setSheetOpen(true);
  }

  async function handleSave() {
    if (!editingPost) return;
    setSaving(true);
    await updateBlogPost(editingPost.id, "title", editTitle);
    await updateBlogPost(editingPost.id, "excerpt", editExcerpt);
    await updateBlogPost(editingPost.id, "content", editContent);
    await updateBlogPost(editingPost.id, "slug", editSlug);
    await updateBlogPost(editingPost.id, "date", editDate);
    await updateBlogPost(editingPost.id, "read_time", editReadTime);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === editingPost.id
          ? { ...p, title: editTitle, excerpt: editExcerpt, content: editContent, slug: editSlug, date: editDate, read_time: editReadTime }
          : p
      )
    );
    setSheetOpen(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setUpdatingId(id);
    await deleteBlogPost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleteModal(null);
    setUpdatingId(null);
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Spinner className="size-6" /></div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading">Blog Posts ({posts.length})</h3>
          <Button onClick={() => setShowAdd(true)}>
            <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Post
          </Button>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
              onClick={() => openEdit(post)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{post.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>/{post.slug}</span>
                  <span>{post.date}</span>
                  <span>{post.read_time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {updatingId === post.id && <Spinner className="size-4" />}
                <Button variant="ghost" size="sm" onClick={() => openEdit(post)}>
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteModal(post)}>
                  <svg className="size-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Blog Post</SheetTitle>
            <SheetDescription>Update the blog post content</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={10} placeholder="Write your blog post content here..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Read Time</label>
                <Input value={editReadTime} onChange={(e) => setEditReadTime(e.target.value)} />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Spinner className="size-4 mr-2" />Saving...</> : "Save Changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteModal?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteModal && handleDelete(deleteModal.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Post Dialog */}
      {showAdd && <AddBlogModal onClose={() => setShowAdd(false)} onAdd={async (data) => {
        const result = await createBlogPost(data);
        if (result.post) setPosts((prev) => [...prev, result.post as BlogPost]);
        setShowAdd(false);
      }} />}
    </>
  );
}

function AddBlogModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: { title: string; excerpt: string; slug: string; date: string; read_time: string }) => void }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [readTime, setReadTime] = useState("5min read");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Blog Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="My Blog Post" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input placeholder="my-blog-post" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Excerpt</label>
            <Textarea placeholder="Brief description..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input placeholder="Apr 8, 2022" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Read Time</label>
              <Input placeholder="5min read" value={readTime} onChange={(e) => setReadTime(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onAdd({ title, excerpt, slug, date, read_time: readTime })} disabled={!title || !slug}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
