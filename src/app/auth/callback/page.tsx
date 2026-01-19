"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleCallback } from "@/lib/solid/auth.client";

/**
 * OIDC Callback Page
 * Handles redirect from Community Solid Server after authentication
 * Extracts session info and stores it via API
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        // Get the full URL including query params
        const fullUrl = window.location.href;
        
        // Handle the OIDC callback
        const { webId, isLoggedIn } = await handleCallback(fullUrl);

        if (!isLoggedIn || !webId) {
          setError("Authentication failed - no session created");
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // Get session info from browser session (includes tokens)
        const session = window.sessionStorage.getItem(
          "solid-client-authn:session"
        );
        
        // Send session data to API to store in cookie
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            webId,
            // Note: In a production setup, you'd extract and send tokens
            // For now, we'll rely on WebID for session validation
            expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to store session");
        }

        // Redirect to home page
        router.push("/");
      } catch (err) {
        console.error("Callback processing error:", err);
        setError(
          err instanceof Error ? err.message : "Authentication failed"
        );
        setTimeout(() => router.push("/"), 3000);
      }
    }

    processCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
