import { cookies } from "next/headers";
import { serialize, parse } from "cookie";
import crypto from "crypto";

/**
 * Session data structure stored in encrypted cookie
 */
export interface SessionData {
  webId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt: number;
}

/**
 * Cookie encryption key from environment variable
 * In production, this should be a strong random string
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET || "default-secret-change-in-production";
  // Use SHA-256 hash of secret for consistent 32-byte key (AES-256)
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt session data for cookie storage
 */
export function encryptSession(data: SessionData): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16); // Initialization vector
  
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const json = JSON.stringify(data);
  
  let encrypted = cipher.update(json, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Prepend IV to encrypted data (IV doesn't need to be secret)
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt session data from cookie
 */
export function decryptSession(encrypted: string): SessionData | null {
  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(":");
    
    if (parts.length !== 2) {
      return null;
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return JSON.parse(decrypted) as SessionData;
  } catch (error) {
    console.error("Failed to decrypt session:", error);
    return null;
  }
}

/**
 * Check if session has expired
 */
export function isSessionExpired(session: SessionData): boolean {
  return session.expiresAt < Date.now();
}

/**
 * Cookie name for session storage
 */
export const SESSION_COOKIE_NAME = "solid-session";

/**
 * Cookie options for session storage
 */
export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: "lax" as const, // Allow OIDC redirects
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  };
}
