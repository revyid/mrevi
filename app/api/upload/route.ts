import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
const apiKey = process.env.CLOUDINARY_API_KEY!;
const apiSecret = process.env.CLOUDINARY_API_SECRET!;

async function uploadSingle(file: File): Promise<{ url: string; public_id: string; width: number; height: number } | { error: string }> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { error: `${file.name}: Invalid file type` };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: `${file.name}: File too large (max 5MB)` };
  }

  const auth = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("folder", "mrevi");

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      headers: { Authorization: auth },
      body: uploadFormData,
    }
  );

  const uploadData = await uploadRes.json();

  if (uploadData.error) {
    return { error: uploadData.error.message };
  }

  return {
    url: uploadData.secure_url,
    public_id: uploadData.public_id,
    width: uploadData.width,
    height: uploadData.height,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Support both single "file" and multiple "files"
    const singleFile = formData.get("file") as File | null;
    const multiFiles = formData.getAll("files") as File[];

    const files = multiFiles.length > 0 ? multiFiles : singleFile ? [singleFile] : [];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Upload all files in parallel
    const results = await Promise.all(files.map((f) => uploadSingle(f)));

    const errors = results.filter((r): r is { error: string } => "error" in r);
    const successes = results.filter((r): r is { url: string; public_id: string; width: number; height: number } => !("error" in r));

    if (successes.length === 0 && errors.length > 0) {
      return NextResponse.json({ error: errors.map((e) => e.error).join(", ") }, { status: 500 });
    }

    // Single file backward compatible
    if (successes.length === 1 && files.length === 1) {
      return NextResponse.json(successes[0]);
    }

    return NextResponse.json({ urls: successes.map((s) => s.url), files: successes });
  } catch (error) {
    console.error("[Upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
