"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "../ImageUpload";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CopyIcon, TrashIcon, UploadIcon, ImageIcon } from "lucide-react";

interface Asset {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileName(publicId: string) {
  const parts = publicId.split("/");
  return parts[parts.length - 1];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AssetsTab() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchAssets = useCallback(async (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({ max_results: "30" });
      if (cursor) params.set("next_cursor", cursor);

      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (cursor) {
        setAssets((prev) => [...prev, ...data.assets]);
      } else {
        setAssets(data.assets);
      }
      setNextCursor(data.next_cursor);
    } catch {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.public_id);
    try {
      const res = await fetch("/api/assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: deleteTarget.public_id }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAssets((prev) => prev.filter((a) => a.public_id !== deleteTarget.public_id));
      toast.success("Asset deleted");
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  }

  function handleUploadComplete(url: string) {
    // Don't hide form here â€” let the user see all uploads finish
    // Form hides when user clicks the Upload button again or we call after all done
  }

  function handleUploadAllComplete(urls: string[]) {
    toast.success(`${urls.length} file(s) uploaded`);
    fetchAssets();
    setShowUpload(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading">Assets</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Cloudinary images ({assets.length} assets)
          </p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} size="sm">
          <UploadIcon data-icon="inline-start" />
          Upload
        </Button>
      </div>

      {showUpload && (
        <div className="border rounded-lg p-4">
          <ImageUpload onUpload={handleUploadComplete} onUploadAll={handleUploadAllComplete} multiple />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageIcon className="size-10 mb-3" />
          <p className="text-sm">No assets yet</p>
          <p className="text-xs mt-1">Upload images to get started</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.public_id}>
                  <TableCell>
                    <img
                      src={asset.secure_url}
                      alt={getFileName(asset.public_id)}
                      className="w-10 h-10 rounded object-cover"
                      loading="lazy"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm truncate max-w-[200px] block">
                      {getFileName(asset.public_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs uppercase text-muted-foreground">
                      {asset.format}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatBytes(asset.bytes)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {asset.width}Ã—{asset.height}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(asset.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleCopyUrl(asset.secure_url)}
                        aria-label="Copy URL"
                      >
                        <CopyIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(asset)}
                        disabled={deleting === asset.public_id}
                        aria-label={`Delete ${getFileName(asset.public_id)}`}
                      >
                        {deleting === asset.public_id ? (
                          <Spinner className="size-3" />
                        ) : (
                          <TrashIcon />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAssets(nextCursor)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Spinner className="size-4 mr-2" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <strong>{deleteTarget && getFileName(deleteTarget.public_id)}</strong> from Cloudinary?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Spinner className="size-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
