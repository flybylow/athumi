"use client";

import {
  Session,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout as solidLogout,
} from "@inrupt/solid-client-authn-browser";

/**
 * Client-side authentication helpers for Solid Pod OIDC flow
 * Uses browser-based authentication which redirects to OIDC provider
 */

/**
 * Get the current browser session
 */
export function getBrowserSession(): Session {
  return getDefaultSession();
}

/**
 * Initiate login flow - redirects to OIDC provider
 */
export async function initiateLogin(): Promise<void> {
  const oidcIssuer = process.env.NEXT_PUBLIC_SOLID_IDP || "http://localhost:3000";
  const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
  const clientName = "Athumi Solid Pod POC";

  try {
    await login({
      oidcIssuer,
      redirectUrl,
      clientName,
    });
  } catch (error) {
    console.error("Login initiation failed:", error);
    throw error;
  }
}

/**
 * Handle OIDC callback - extracts auth info from URL
 * Call this after redirect from OIDC provider
 */
export async function handleCallback(url: string): Promise<{
  webId: string | undefined;
  isLoggedIn: boolean;
}> {
  try {
    await handleIncomingRedirect(url);

    const session = getDefaultSession();
    
    return {
      webId: session.info.webId,
      isLoggedIn: session.info.isLoggedIn,
    };
  } catch (error) {
    console.error("Callback handling failed:", error);
    throw error;
  }
}

/**
 * Logout from Solid session
 */
export async function logout(): Promise<void> {
  try {
    await solidLogout();
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}

/**
 * Get current session info from browser
 */
export function getSessionInfo(): {
  webId: string | undefined;
  isLoggedIn: boolean;
} {
  const session = getDefaultSession();
  return {
    webId: session.info.webId,
    isLoggedIn: session.info.isLoggedIn,
  };
}
