import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/login
 * Initiates OIDC login flow by redirecting to Community Solid Server
 */
export async function GET(request: NextRequest) {
  const oidcIssuer = process.env.SOLID_IDP || "http://localhost:3000";
  const redirectUrl = process.env.REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/auth/callback`;
  const clientName = "Athumi Solid Pod POC";

  // Build OIDC authorization URL
  // The actual redirect will be handled by the client-side login function
  // This API route is mainly for initiating the flow server-side if needed
  // For browser-based OIDC, we typically use client-side redirects
  
  // Return the OIDC issuer and redirect URL for client-side handling
  return NextResponse.json({
    oidcIssuer,
    redirectUrl,
    clientName,
  });
}
