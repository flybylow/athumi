import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/solid/auth.server";

/**
 * GET /api/auth/session
 * Returns current session info (WebID, logged-in status)
 * Used by client components to check authentication state
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({
        isLoggedIn: false,
        webId: null,
      });
    }

    // Return only non-sensitive info (not tokens)
    return NextResponse.json({
      isLoggedIn: true,
      webId: session.webId,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
