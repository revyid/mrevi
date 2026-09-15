import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getDb } from "@/lib/db";

const RP_NAME = "mrevi";

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origin = new URL(request.url).origin;
    const rpID = new URL(origin).hostname;

    const db = getDb();

    const { data: existingPasskeys } = await db
      .from("passkeys")
      .select("credential_id")
      .eq("user_id", user.id);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email,
      userDisplayName: user.name || user.email,
      excludeCredentials: (existingPasskeys || []).map((pk) => ({
        id: pk.credential_id,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    return NextResponse.json({
      options,
      challenge: options.challenge,
    });
  } catch (error) {
    console.error("[Passkey] Generate error:", error);
    return NextResponse.json({ error: "Failed to generate options" }, { status: 500 });
  }
}
