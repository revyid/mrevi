import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const { data: passkeys, error } = await db
      .from("passkeys")
      .select("id, name, device_type, created_at, last_used_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ passkeys: [] });
    }

    return NextResponse.json({ passkeys: passkeys || [] });
  } catch {
    return NextResponse.json({ passkeys: [] });
  }
}
