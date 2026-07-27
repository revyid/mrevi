import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function POST(request: NextRequest) {
  try {
    const origin = new URL(request.url).origin;
    const rpID = new URL(origin).hostname;

    // Generate authentication options — no allowCredentials since we use discoverable credentials
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      allowCredentials: [],
    });

    return NextResponse.json({
      options,
      challenge: options.challenge,
    });
  } catch (error) {
    console.error("[Passkey] Login generate error:", error);
    return NextResponse.json({ error: "Failed to generate options" }, { status: 500 });
  }
}
