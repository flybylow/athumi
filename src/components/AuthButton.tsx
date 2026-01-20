"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSolidSession } from "@/hooks/useSolidSession";
import { initiateLogin, logout } from "@/lib/solid/auth.client";

/**
 * Authentication Button Component
 * Shows login button when not authenticated, logout button when authenticated
 */
export function AuthButton() {
  const router = useRouter();
  const { session, isLoading, refresh } = useSolidSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      await initiateLogin();
      // initiateLogin will redirect to OIDC provider
      // We don't need to do anything else here
    } catch (error) {
      console.error("Login error:", error);
      setIsProcessing(false);
      alert("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      setIsProcessing(true);
      
      // Logout from Solid browser session
      await logout();
      
      // Clear server-side session cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      // Full page refresh to clear all state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setIsProcessing(false);
      alert("Logout failed. Please try again.");
    }
  };

  if (isLoading || isProcessing) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-md bg-gray-300 text-gray-600 cursor-not-allowed"
      >
        {isLoading ? "Loading..." : "Processing..."}
      </button>
    );
  }

  if (session.isLoggedIn && session.webId) {
    return (
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      Login with Solid
    </button>
  );
}
