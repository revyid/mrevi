import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { createSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

function log(label: string, data?: unknown) {
  console.log(`[Passkey Verify] ${label}`, data !== undefined ? JSON.stringify(data) : "");
}

function logError(label: string, err: unknown) {
  console.error(`[Passkey Verify ERROR] ${label}`);
  if (err instanceof Error) {
    console.error("  message:", err.message);
    console.error("  stack:", err.stack);
  } else {
    console.error("  raw:", JSON.stringify(err));
  }
}

export async function POST(request: NextRequest) {
  try {
    const reqUrl = new URL(request.url);
    const origin = reqUrl.origin;
    const rpID = reqUrl.hostname;
    log("Request", { origin, rpID });

    const { credential, challenge } = await request.json();
    log("Body", { credentialId: credential?.id, hasChallenge: !!challenge });

    if (!credential) {
      return NextResponse.json({ error: "No credential provided" }, { status: 400 });
    }

    const db = getDb();

    const { data: passkey, error: passkeyError } = await db
      .from("passkeys")
      .select("*")
      .eq("credential_id", credential.id)
      .single();

    log("Passkey lookup", { found: !!passkey, error: passkeyError?.message });

    if (passkeyError || !passkey) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

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

    log("Verification", { verified: verification.verified, newCounter: verification.authenticationInfo.newCounter });

    if (!verification.verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    await db
      .from("passkeys")
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", passkey.id);

    const { data: user, error: userError } = await db
      .from("users")
      .select("*")
      .eq("id", passkey.user_id)
      .single();

    log("User lookup", { found: !!user, error: userError?.message });

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await createSession(user.id);
    log("Session created", { userId: user.id, role: user.role });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    logError("Exception", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
