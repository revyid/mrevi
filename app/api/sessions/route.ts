import { NextRequest, NextResponse } from "next/server";
import { getSession, getCurrentSessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

// GET - List user sessions
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const { data: sessions, error } = await db
      .from("sessions")
      .select("id, token, created_at, expires_at, user_agent, ip_address")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ sessions: [] });
    }

    // Get current session token to identify current device
    const currentToken = await getCurrentSessionToken();

    const enriched = (sessions || []).map((s) => ({
      ...s,
      is_current: s.token === currentToken,
    }));

    return NextResponse.json({ sessions: enriched });
  } catch {
    return NextResponse.json({ sessions: [] });
  }
}

// DELETE - Delete a specific session or all sessions
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();

    if (body.all) {
      const currentToken = await getCurrentSessionToken();

      if (currentToken) {
        await db
          .from("sessions")
          .delete()
          .eq("user_id", user.id)
          .neq("token", currentToken);
      }

      return NextResponse.json({ success: true });
    }

    if (body.session_id) {
      await db
        .from("sessions")
        .delete()
        .eq("id", body.session_id)
        .eq("user_id", user.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "session_id or all required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
