import { NextRequest, NextResponse } from "next/server";
import { getSession, getCurrentSessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

// GET - List user sessions
export async function GET(request: NextRequest) {
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

    // Fill in missing metadata for current session from request headers
    if (currentToken) {
      const currentSession = (sessions || []).find((s) => s.token === currentToken);
      if (currentSession) {
        const updates: Record<string, string> = {};
        if (!currentSession.user_agent) {
          const ua = request.headers.get("user-agent") || "";
          if (ua) updates.user_agent = ua;
        }
        if (!currentSession.ip_address) {
          const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
          if (ip) updates.ip_address = ip;
        }
        if (Object.keys(updates).length > 0) {
          await db.from("sessions").update(updates).eq("token", currentToken).eq("user_id", user.id);
          // Update in-memory data for response
          if (updates.user_agent) currentSession.user_agent = updates.user_agent;
          if (updates.ip_address) currentSession.ip_address = updates.ip_address;
        }
      }
    }

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
