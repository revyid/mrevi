import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
const apiKey = process.env.CLOUDINARY_API_KEY!;
const apiSecret = process.env.CLOUDINARY_API_SECRET!;

function getAuth() {
  return "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
}

// GET - List assets from Cloudinary folder
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "mrevi";
    const maxResults = searchParams.get("max_results") || "30";
    const nextCursor = searchParams.get("next_cursor") || undefined;

    const body: Record<string, string> = {
      expression: `folder:${folder}`,
      max_results: maxResults,
    };
    if (nextCursor) {
      body.next_cursor = nextCursor;
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuth(),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (data.error) {
      console.error("[Assets] Cloudinary error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const assets = (data.resources || []).map(
      (r: Record<string, unknown>) => ({
        public_id: r.public_id,
        secure_url: r.secure_url,
        format: r.format,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        created_at: r.created_at,
        resource_type: r.resource_type,
      })
    );

    return NextResponse.json({
      assets,
      total_count: data.total_count,
      next_cursor: data.next_cursor || null,
    });
  } catch (error) {
    console.error("[Assets GET]", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

// DELETE - Delete an asset from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json({ error: "public_id is required" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuth(),
        },
        body: JSON.stringify({ public_id }),
      }
    );

    const data = await res.json();

    if (data.error) {
      console.error("[Assets] Cloudinary delete error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data.result, public_id });
  } catch (error) {
    console.error("[Assets DELETE]", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
