import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/solid/auth.server";

/**
 * POST /api/auth/logout
 * Clears session cookie and logs out user
 */
export async function POST(request: NextRequest) {
  try {
    await clearSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
