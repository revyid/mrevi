import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const db = getDb();
    const { data: tables, error: tablesError } = await db
      .from("users")
      .select("count")
      .limit(1);

    // Get current session
    const user = await getSession();

    return NextResponse.json({
      dbConnected: !tablesError,
      dbError: tablesError?.message || null,
      sessionExists: !!user,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      } : null,
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasJwtSecret: !!process.env.JWT_SECRET,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
