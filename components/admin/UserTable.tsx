"use client";

import { useState } from "react";
import { updateUser, deleteUser } from "@/app/actions/admin";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PencilIcon, TrashIcon } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  provider: string;
  created_at: string;
}

interface UserTableProps {
  users: User[];
  currentUserId: string;
}

export function UserTable({ users: initialUsers, currentUserId }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [editModal, setEditModal] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", avatar_url: "" });

  function openEdit(user: User) {
    setEditModal(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    });
  }

  async function handleUpdateAll() {
    if (!editModal) return;
    setUpdatingId(editModal.id);

    const fields = [
      { field: "name", value: editForm.name },
      { field: "email", value: editForm.email },
      { field: "role", value: editForm.role },
      { field: "avatar_url", value: editForm.avatar_url },
    ];

    let success = true;
    for (const { field, value } of fields) {
      if (value !== (editModal as unknown as Record<string, string>)[field]) {
        const result = await updateUser(editModal.id, field, value);
        if (!result.success) {
          toast.error(result.error || `Failed to update ${field}`);
          success = false;
          break;
        }
      }
    }

    if (success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editModal.id
            ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role, avatar_url: editForm.avatar_url }
            : u
        )
      );
      toast.success("User updated");
    }

    setEditModal(null);
    setUpdatingId(null);
  }

  async function handleDelete(id: string) {
    setUpdatingId(id);
    const result = await deleteUser(id);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
    } else {
      toast.error(result.error || "Failed to delete");
    }
    setDeleteModal(null);
    setUpdatingId(null);
  }

  return (
    <>
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <svg className="size-12 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={user.avatar_url} alt="" />
                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline">{user.provider}</Badge></TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(user.created_at)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" onClick={() => openEdit(user)} aria-label="Edit user">
                        <PencilIcon />
                      </Button>
                      {user.id !== currentUserId && (
                        <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" onClick={() => setDeleteModal(user)} aria-label="Delete user">
                          <TrashIcon />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editForm.role} onValueChange={(v: string | null) => v && setEditForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input value={editForm.avatar_url} onChange={(e) => setEditForm((p) => ({ ...p, avatar_url: e.target.value }))} placeholder="https://..." />
            </div>
            {editForm.avatar_url && (
              <div className="flex justify-center">
                <img src={editForm.avatar_url} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleUpdateAll} disabled={updatingId === editModal?.id}>
              {updatingId === editModal?.id && <Spinner className="size-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteModal?.name || deleteModal?.email}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteModal && handleDelete(deleteModal.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {updatingId === deleteModal?.id ? <Spinner className="size-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
