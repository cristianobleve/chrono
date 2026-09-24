/**
 * External Storage Client for Media & Images (Cloudflare R2, AWS S3, or Uploadthing)
 *
 * Architecture:
 * - Supabase: Stores relational metadata, issue comments, descriptions, and file URLs.
 * - External Object Storage (R2 / S3): Stores binary assets (images, avatars, attachments)
 *   with zero egress fees and high-speed global CDN delivery.
 */

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

const MEDIA_DB_NAME = "chrono-media-cache";
const AVATAR_STORE_NAME = "avatars";
const COVER_STORE_NAME = "covers";

function openMediaDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MEDIA_DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AVATAR_STORE_NAME)) {
        db.createObjectStore(AVATAR_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(COVER_STORE_NAME)) {
        db.createObjectStore(COVER_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalAvatar(accountId: string, dataUrl: string): Promise<string> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`chrono_avatar_${accountId}`, dataUrl);
    } catch {
      // quota or private mode
    }
  }

  if (typeof window !== "undefined" && window.indexedDB) {
    try {
      const database = await openMediaDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(AVATAR_STORE_NAME, "readwrite");
        transaction.objectStore(AVATAR_STORE_NAME).put(dataUrl, accountId);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      database.close();
    } catch (e) {
      console.warn("IndexedDB avatar write notice:", e);
    }
  }

  return `local-avatar:${accountId}`;
}

export async function getLocalAvatar(accountId: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(`chrono_avatar_${accountId}`);
    if (cached) return cached;
  } catch {}

  if (!window.indexedDB) return null;

  try {
    const database = await openMediaDatabase();
    const value = await new Promise<string | null>((resolve, reject) => {
      const request = database.transaction(AVATAR_STORE_NAME).objectStore(AVATAR_STORE_NAME).get(accountId);
      request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : null);
      request.onerror = () => reject(request.error);
    });
    database.close();

    if (value) {
      try {
        localStorage.setItem(`chrono_avatar_${accountId}`, value);
      } catch {}
    }

    return value;
  } catch {
    return null;
  }
}

export async function removeLocalAvatar(accountId: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`chrono_avatar_${accountId}`);
  } catch {}

  if (!window.indexedDB) return;

  try {
    const database = await openMediaDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(AVATAR_STORE_NAME, "readwrite");
      transaction.objectStore(AVATAR_STORE_NAME).delete(accountId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  } catch {}
}

export async function saveLocalCover(accountId: string, dataUrl: string): Promise<string> {
  if (typeof window !== "undefined") {
    // Only store in localStorage if small enough to prevent quota exhaustion
    if (dataUrl.length < 350000) {
      try {
        localStorage.setItem(`chrono_cover_${accountId}`, dataUrl);
      } catch {}
    }
  }

  if (typeof window !== "undefined" && window.indexedDB) {
    try {
      const database = await openMediaDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(COVER_STORE_NAME, "readwrite");
        transaction.objectStore(COVER_STORE_NAME).put(dataUrl, accountId);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      database.close();
    } catch (e) {
      console.warn("IndexedDB cover write notice:", e);
    }
  }

  // If external URL or moderate dataUrl, return as is. If large, use local ref
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }
  return `local-cover:${accountId}`;
}

export async function getLocalCover(accountId: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(`chrono_cover_${accountId}`);
    if (cached) return cached;
  } catch {}

  if (!window.indexedDB) return null;

  try {
    const database = await openMediaDatabase();
    const value = await new Promise<string | null>((resolve, reject) => {
      const request = database.transaction(COVER_STORE_NAME).objectStore(COVER_STORE_NAME).get(accountId);
      request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : null);
      request.onerror = () => reject(request.error);
    });
    database.close();

    if (value && value.length < 350000) {
      try {
        localStorage.setItem(`chrono_cover_${accountId}`, value);
      } catch {}
    }

    return value;
  } catch {
    return null;
  }
}

export async function removeLocalCover(accountId: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`chrono_cover_${accountId}`);
  } catch {}

  if (!window.indexedDB) return;

  try {
    const database = await openMediaDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(COVER_STORE_NAME, "readwrite");
      transaction.objectStore(COVER_STORE_NAME).delete(accountId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  } catch {}
}

export async function uploadMediaFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload media file");
  }

  return response.json();
}
