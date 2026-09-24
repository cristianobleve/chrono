import { useState, useEffect } from "react";

export interface DisplayNameUser {
  name?: string | null;
  username?: string | null;
}

/**
 * Hook to check if component has hydrated on the client.
 * Essential for preventing SSR hydration mismatches with client-persisted preferences.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

/**
 * Format user display name based on user preference:
 * - "full_name": e.g. "Cristiano Bleve"
 * - "username": e.g. "@blevecristiano2018"
 * - "first_name": e.g. "Cristiano"
 */
export function formatUserDisplayName(
  user?: DisplayNameUser | null,
  preference: "username" | "full_name" | "first_name" = "full_name"
): string {
  if (!user) return "";

  if (preference === "username") {
    if (user.username) {
      return user.username.startsWith("@") ? user.username : `@${user.username}`;
    }
    return user.name || "User";
  }

  if (preference === "first_name") {
    const firstName = (user.name || "").trim().split(/\s+/)[0];
    return firstName || user.username || "User";
  }

  // default: full_name
  return user.name || (user.username ? (user.username.startsWith("@") ? user.username : `@${user.username}`) : "User");
}
