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
 * Create a Solid Node.js Session instance from stored session data
 * This can be used in API routes for Pod operations
 */
export async function createSolidNodeSession(
  sessionData: SessionData
): Promise<Session> {
  const session = new Session();

  // If we have tokens stored, restore the session
  if (sessionData.accessToken) {
    // Note: The actual token restoration depends on Solid SDK's session handling
    // For now, we'll need to re-authenticate or use the stored WebID
    // In a production setup, you'd store and restore the full session info
    session.info = {
      isLoggedIn: true,
      webId: sessionData.webId,
      sessionId: sessionData.webId, // Simplified
    };
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
    return null;
  }

  return createSolidNodeSession(sessionData);
}
