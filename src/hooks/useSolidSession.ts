"use client";

import { useState, useEffect } from "react";

export interface SessionInfo {
  isLoggedIn: boolean;
  webId: string | null;
  expiresAt?: number;
}

/**
 * React hook to manage Solid session state
 * Fetches session from API and provides reactive session info
 */
export function useSolidSession() {
  const [session, setSession] = useState<SessionInfo>({
    isLoggedIn: false,
    webId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auth/session");
      
      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }

      const data = await response.json();
      setSession({
        isLoggedIn: data.isLoggedIn || false,
        webId: data.webId || null,
        expiresAt: data.expiresAt,
      });
    } catch (err) {
      console.error("Session fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch session");
      setSession({
        isLoggedIn: false,
        webId: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch session on mount and when window regains focus
  useEffect(() => {
    fetchSession();

    // Refresh session when window regains focus (handles tab switches)
    const handleFocus = () => {
      fetchSession();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return {
    session,
    isLoading,
    error,
    refresh: fetchSession,
  };
}
