import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/solid/auth.server";

/**
 * POST /api/auth/callback
 * Receives session data from client after OIDC callback
 * Stores session in encrypted HTTP-only cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webId, accessToken, refreshToken, expiresIn } = body;

    if (!webId) {
      return NextResponse.json(
        { error: "Missing webId in callback data" },
        { status: 400 }
      );
    }

    // Calculate expiration time (default to 7 days if not provided)
    const expiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create and store session
    await createSession({
      webId,
      accessToken,
      refreshToken,
      expiresAt,
    });

    return NextResponse.json({ success: true, webId });
  } catch (error) {
    console.error("Callback API error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
