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

/**
 * Extract access token from browser session storage
 * Returns tokens if available, undefined otherwise
 */
export async function getTokensFromSession(): Promise<{
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  try {
    const oidcIssuer = process.env.NEXT_PUBLIC_SOLID_IDP || "http://localhost:3000";
    
    // Solid SDK stores session with various possible key patterns
    const allKeys = Object.keys(window.sessionStorage);
    const sessionKeys = allKeys.filter((key) =>
      key.includes("solid") || key.includes("authn") || key.includes("session")
    );
    
    for (const key of sessionKeys) {
      const stored = window.sessionStorage.getItem(key);
      if (stored) {
        try {
          const sessionData = JSON.parse(stored);
          
          // Try different possible structures
          let tokens: any = null;
          
          if (sessionData.session) {
            tokens = sessionData.session;
          } else if (sessionData.tokens) {
            tokens = sessionData.tokens;
          } else if (sessionData.accessToken || sessionData.token) {
            tokens = sessionData;
          } else if (sessionData.credentials) {
            tokens = sessionData.credentials;
          } else if (sessionData.idToken) {
            // OIDC tokens might be stored differently
            tokens = sessionData;
          }
          
          if (tokens) {
            const accessToken = tokens.accessToken || tokens.token || tokens.idToken;
            const refreshToken = tokens.refreshToken;
            
            let expiresIn: number | undefined;
            if (tokens.expirationDate) {
              const expirationMs = new Date(tokens.expirationDate).getTime();
              expiresIn = Math.max(0, Math.floor((expirationMs - Date.now()) / 1000));
            } else if (tokens.expiresIn) {
              expiresIn = tokens.expiresIn;
            } else if (tokens.expires_at) {
              expiresIn = Math.max(0, tokens.expires_at - Math.floor(Date.now() / 1000));
            }
            
            if (accessToken) {
              return {
                accessToken,
                refreshToken,
                expiresIn,
              };
            }
          }
        } catch (e) {
          console.warn(`Could not parse session data from ${key}:`, e);
          // Continue to next key
          continue;
        }
      }
    }
    
    console.warn("No tokens found in sessionStorage");
  } catch (e) {
    console.error("Could not extract tokens:", e);
  }
  
  return {};
}
