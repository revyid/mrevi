"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UploadIcon, XIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  url: string;
  name: string;
}

interface UploadProgress {
  fileName: string;
  percent: number;
  status: "compressing" | "uploading" | "done" | "error";
}

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onUploadAll?: (urls: string[]) => void;
  currentImage?: string;
  multiple?: boolean;
  className?: string;
}

export function ImageUpload({ onUpload, onUploadAll, currentImage, multiple = true, className }: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(
    currentImage ? [{ url: currentImage, name: "Current image" }] : []
  );
  const [progressList, setProgressList] = useState<UploadProgress[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function updateProgress(fileName: string, update: Partial<UploadProgress>) {
    setProgressList((prev) => {
      const idx = prev.findIndex((p) => p.fileName === fileName);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...update };
        return next;
      }
      return [...prev, { fileName, percent: 0, status: "compressing", ...update }];
    });
  }

  function removeProgress(fileName: string) {
    setProgressList((prev) => prev.filter((p) => p.fileName !== fileName));
  }

  function uploadSingle(file: File): Promise<{ url: string; name: string } | null> {
    return new Promise((resolve) => {
      // Compress first
      updateProgress(file.name, { status: "compressing", percent: 0 });

      compressImage(file).then((compressed) => {
        updateProgress(file.name, { status: "uploading", percent: 10 });

        const formData = new FormData();
        formData.append("file", compressed);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            updateProgress(file.name, { percent });
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.error) {
              updateProgress(file.name, { status: "error", percent: 0 });
              resolve(null);
            } else {
              updateProgress(file.name, { status: "done", percent: 100 });
              resolve({ url: data.url, name: file.name });
            }
          } catch {
            updateProgress(file.name, { status: "error", percent: 0 });
            resolve(null);
          }
        };

        xhr.onerror = () => {
          updateProgress(file.name, { status: "error", percent: 0 });
          resolve(null);
        };

        xhr.send(formData);
      });
    });
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setError("No valid image files");
      return;
    }

    // Single file mode
    if (!multiple || imageFiles.length === 1) {
      const result = await uploadSingle(imageFiles[0]);
      if (result) {
        setFiles([result]);
        onUpload(result.url);
      } else {
        setError("Upload failed");
      }
      setProgressList([]);
      return;
    }

    // Multi-file: upload sequentially, only call callbacks at the end
    const results: UploadedFile[] = [];
    for (const file of imageFiles) {
      const result = await uploadSingle(file);
      if (result) {
        results.push(result);
      }
    }

    // Batch state update — one render at the end
    if (results.length > 0) {
      setFiles((prev) => {
        const allFiles = [...prev, ...results];
        // Fire callbacks after state settles (next microtask)
        queueMicrotask(() => {
          onUpload(results[results.length - 1].url);
          onUploadAll?.(allFiles.map((f) => f.url));
        });
        return allFiles;
      });
    }

    if (results.length < imageFiles.length) {
      setError(`${imageFiles.length - results.length} file(s) failed to upload`);
    }

    // Clear progress after a short delay
    setTimeout(() => setProgressList([]), 1500);
  }

  function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();

      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob!], file.name, { type: "image/jpeg", lastModified: Date.now() }));
          },
          "image/jpeg",
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleUpload(e.target.files);
    e.target.value = "";
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  }, []);

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onUpload(next.length > 0 ? next[next.length - 1].url : "");
      onUploadAll?.(next.map((f) => f.url));
      return next;
    });
  }

  const isUploading = progressList.length > 0;

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileRef}
        onChange={handleChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        className="hidden"
      />

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, i) => (
            <div key={file.url} className="flex items-center gap-3 p-2 rounded-lg border bg-background">
              <img src={file.url} alt={file.name} className="size-10 rounded object-cover shrink-0" />
              <span className="text-sm truncate flex-1">{file.name}</span>
              <Button variant="ghost" size="icon-xs" onClick={() => removeFile(i)}>
                <XIcon />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Progress list */}
      {isUploading && (
        <div className="flex flex-col gap-1.5">
          {progressList.map((p) => (
            <div key={p.fileName} className="flex items-center gap-2 text-xs text-muted-foreground">
              {p.status === "compressing" && <Spinner className="size-3 shrink-0" />}
              {p.status === "uploading" && (
                <div className="relative size-3 shrink-0">
                  <svg className="size-3 -rotate-90" viewBox="0 0 12 12">
                    <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-20" />
                    <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={`${p.percent * 0.314} 31.4`} />
                  </svg>
                </div>
              )}
              {p.status === "done" && <span className="size-3 shrink-0 text-green-500">&#10003;</span>}
              {p.status === "error" && <span className="size-3 shrink-0 text-destructive">&#10007;</span>}
              <span className="truncate flex-1">{p.fileName}</span>
              <span className="shrink-0 tabular-nums">
                {p.status === "compressing" ? "Compressing..." : p.status === "uploading" ? `${p.percent}%` : p.status === "done" ? "Done" : "Failed"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / Upload button */}
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border border-dashed transition-colors cursor-pointer",
          dragging ? "border-primary bg-primary/5" : "hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-60"
        )}
        onClick={() => !isUploading && fileRef.current?.click()}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          {isUploading ? <Spinner className="size-5" /> : <UploadIcon className="size-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : multiple ? "Drop images or click to upload" : "Drop image or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF (max 5MB per file)</p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
