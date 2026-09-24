import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Milestone } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFriendlyDate(
  date: Date | string | null | undefined,
  options?: { twoDigitDay?: boolean }
): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return typeof date === "string" ? date : "";
    const currentYear = new Date().getFullYear();
    const isThisYear = d.getFullYear() === currentYear;
    return d.toLocaleDateString("it-IT", {
      day: options?.twoDigitDay ? "2-digit" : "numeric",
      month: "short",
      ...(isThisYear ? {} : { year: "numeric" }),
    });
  } catch {
    return typeof date === "string" ? date : "";
  }
}

/**
 * Sorts milestones deterministically:
 * 1. Milestone number if title contains 'Milestone X' or 'M[0-9]+'
 * 2. Explicit sortOrder (if > 0)
 * 3. Target date chronologically
 * 4. Natural title string collation
 */
export function sortMilestones(milestones: Milestone[]): Milestone[] {
  if (!milestones || !Array.isArray(milestones)) return [];

  return [...milestones].sort((a, b) => {
    // 1. Try to extract milestone number from name, e.g. "Milestone 1", "Milestone 2", "M1", etc.
    const matchA = a.name ? a.name.match(/(?:milestone|m)\s*(\d+)/i) : null;
    const matchB = b.name ? b.name.match(/(?:milestone|m)\s*(\d+)/i) : null;

    if (matchA && matchB) {
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      if (numA !== numB) {
        return numA - numB;
      }
    } else if (matchA) {
      return -1;
    } else if (matchB) {
      return 1;
    }

    // 2. If explicit sortOrder is defined and > 0, compare sortOrder
    const orderA = typeof a.sortOrder === "number" && a.sortOrder > 0 ? a.sortOrder : null;
    const orderB = typeof b.sortOrder === "number" && b.sortOrder > 0 ? b.sortOrder : null;
    if (orderA !== null && orderB !== null && orderA !== orderB) {
      return orderA - orderB;
    }
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;

    // 3. Fallback to targetDate chronological order
    if (a.targetDate && b.targetDate) {
      const dateA = new Date(a.targetDate).getTime();
      const dateB = new Date(b.targetDate).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
        return dateA - dateB;
      }
    } else if (a.targetDate) {
      return -1;
    } else if (b.targetDate) {
      return 1;
    }

    // 4. Natural string comparison
    return (a.name || "").localeCompare(b.name || "", undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

