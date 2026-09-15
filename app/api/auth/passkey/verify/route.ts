import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqUrl = new URL(request.url);
    const origin = reqUrl.origin;
    const rpID = reqUrl.hostname;

    const { credential, name, challenge } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: "No credential provided" }, { status: 400 });
    }

    // Pass base64url strings directly — @simplewebauthn/server handles decoding
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const regInfo = verification.registrationInfo!;
    const credInfo = regInfo.credential;

    const db = getDb();

    const { error } = await db.from("passkeys").insert({
      user_id: user.id,
      credential_id: credInfo.id,
      public_key: Buffer.from(credInfo.publicKey).toString("base64"),
      counter: credInfo.counter,
      device_type: "unknown",
      name: name || "Passkey",
    });

    if (error) {
      console.error("[Passkey] DB insert error:", error);
      return NextResponse.json({ error: "Failed to save passkey" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Passkey] Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
