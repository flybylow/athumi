import { cookies } from "next/headers";
import { Session } from "@inrupt/solid-client-authn-node";
import {
  decryptSession,
  encryptSession,
  getCookieOptions,
  isSessionExpired,
  SESSION_COOKIE_NAME,
  type SessionData,
} from "./session";

/**
 * Server-side session management for Solid Pod authentication
 * Handles cookie-based session storage and Solid Node.js session restoration
 */

/**
 * Get the current server-side session from cookies
 * Returns null if no session or session is expired
 */
export async function getServerSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = decryptSession(sessionCookie.value);
  
  if (!session) {
    return null;
  }

  // Check if session has expired
  if (isSessionExpired(session)) {
    // Clear expired session
    await clearSession();
    return null;
  }

  return session;
}

/**
 * Create a new session and store it in a cookie
 */
export async function createSession(sessionData: SessionData): Promise<void> {
  const encrypted = encryptSession(sessionData);
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, encrypted, getCookieOptions());
}

/**
 * Clear the session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Create an authenticated fetch function using stored access token
 * This creates a fetch wrapper that adds Authorization header
 */
function createAuthenticatedFetch(
  accessToken: string,
  oidcIssuer: string
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    
    // Add Authorization header with Bearer token
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    
    // Add DPoP header if needed (for some Solid servers)
    // For POC with Community Solid Server, Bearer token should work
    
    return fetch(input, {
      ...init,
      headers,
    });
  };
}

/**
 * Create a Solid Node.js Session instance from stored session data
 * This can be used in API routes for Pod operations
 */
export async function createSolidNodeSession(
  sessionData: SessionData
): Promise<Session> {
  const session = new Session();

  // Set session info
  session.info = {
    isLoggedIn: true,
    webId: sessionData.webId,
    sessionId: sessionData.webId,
  };

  // If we have an access token, create an authenticated fetch
  if (sessionData.accessToken) {
    const oidcIssuer = process.env.SOLID_IDP || process.env.NEXT_PUBLIC_SOLID_IDP || "http://localhost:3000";
    console.log("Creating authenticated fetch with token");
    session.fetch = createAuthenticatedFetch(
      sessionData.accessToken,
      oidcIssuer
    ) as any; // Type assertion needed for SDK compatibility
  } else {
    // Fallback: use regular fetch (will fail for protected resources)
    console.warn("No access token found - using unauthenticated fetch (this will fail for Pod operations)");
    session.fetch = fetch;
  }

  return session;
}

/**
 * Get a Solid Node.js Session for use in API routes
 * Returns null if not authenticated
 */
export async function getSolidNodeSession(): Promise<Session | null> {
  const sessionData = await getServerSession();
  
  if (!sessionData) {
    console.log("No session data found");
    return null;
  }

  console.log("Session data found:", {
    webId: sessionData.webId,
    hasAccessToken: !!sessionData.accessToken,
    accessTokenLength: sessionData.accessToken?.length,
    expiresAt: new Date(sessionData.expiresAt).toISOString(),
  });

  return createSolidNodeSession(sessionData);
}
