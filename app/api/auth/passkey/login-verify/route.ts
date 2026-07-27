import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { createSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const reqUrl = new URL(request.url);
    const origin = reqUrl.origin;
    const rpID = reqUrl.hostname;

    const { credential, challenge } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: "No credential provided" }, { status: 400 });
    }

    const db = getDb();

    // Find the passkey by credential ID
    const { data: passkey, error: passkeyError } = await db
      .from("passkeys")
      .select("*")
      .eq("credential_id", credential.id)
      .single();

    if (passkeyError || !passkey) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credential_id,
        publicKey: Uint8Array.from(Buffer.from(passkey.public_key, "base64")),
        counter: passkey.counter,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    // Update counter and last_used_at
    await db
      .from("passkeys")
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", passkey.id);

    // Get the user
    const { data: user, error: userError } = await db
      .from("users")
      .select("*")
      .eq("id", passkey.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create session
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      role: user.role,
    });
  } catch (error) {
    console.error("[Passkey] Login verify error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
