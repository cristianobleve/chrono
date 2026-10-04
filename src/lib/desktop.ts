/**
 * Desktop integration layer for Chrono (Tauri 2.0).
 * Gracefully no-ops when running in standard web / browser environments.
 */

export function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  return "__TAURI_INTERNALS__" in window;
}

export type DesktopPlatform = "windows" | "macos" | "linux" | "unknown";

export function getClientPlatform(): DesktopPlatform {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "unknown";
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("mac") || userAgent.includes("darwin")) return "macos";
  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("linux")) return "linux";
  return "unknown";
}

export interface DesktopUpdateInfo {
  available: boolean;
  version?: string;
  body?: string;
  date?: string;
}

/**
 * Autostartup management
 */
export async function isAutostartEnabled(): Promise<boolean> {
  if (!isDesktopApp()) return false;
  try {
    const { isEnabled } = await import("@tauri-apps/plugin-autostart");
    return await isEnabled();
  } catch (err) {
    console.warn("[Desktop] Failed to check autostart status:", err);
    return false;
  }
}

export async function setAutostartEnabled(enabled: boolean): Promise<boolean> {
  if (!isDesktopApp()) return false;
  try {
    const { enable, disable, isEnabled } = await import("@tauri-apps/plugin-autostart");
    if (enabled) {
      await enable();
    } else {
      await disable();
    }
    return await isEnabled();
  } catch (err) {
    console.error("[Desktop] Failed to update autostart:", err);
    return false;
  }
}

/**
 * Native desktop notifications
 */
export async function sendDesktopNotification(title: string, body: string): Promise<boolean> {
  if (!isDesktopApp()) return false;
  try {
    const { isPermissionGranted, requestPermission, sendNotification } = await import("@tauri-apps/plugin-notification");
    let hasPermission = await isPermissionGranted();
    if (!hasPermission) {
      const permission = await requestPermission();
      hasPermission = permission === "granted";
    }
    if (hasPermission) {
      sendNotification({ title, body });
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[Desktop] Failed to send desktop notification:", err);
    return false;
  }
}

/**
 * Desktop auto-updater
 */
export async function checkDesktopUpdate(): Promise<DesktopUpdateInfo> {
  if (!isDesktopApp()) return { available: false };
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    if (update && update.available) {
      return {
        available: true,
        version: update.version,
        body: update.body || undefined,
        date: update.date || undefined,
      };
    }
    return { available: false };
  } catch (err) {
    console.warn("[Desktop] Update check error:", err);
    return { available: false };
  }
}

export async function downloadAndInstallDesktopUpdate(): Promise<boolean> {
  if (!isDesktopApp()) return false;
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const { relaunch } = await import("@tauri-apps/plugin-process");
    const update = await check();
    if (update && update.available) {
      await update.downloadAndInstall();
      await relaunch();
      return true;
    }
    return false;
  } catch (err) {
    console.error("[Desktop] Failed to install update:", err);
    return false;
  }
}

/**
 * Window controls
 */
export async function minimizeDesktopWindow(): Promise<void> {
  if (!isDesktopApp()) return;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  } catch (err) {
    console.warn("[Desktop] Failed to minimize window:", err);
  }
}

export async function hideDesktopWindowToTray(): Promise<void> {
  if (!isDesktopApp()) return;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().hide();
  } catch (err) {
    console.warn("[Desktop] Failed to hide window to tray:", err);
  }
}

export async function quitDesktopApp(): Promise<void> {
  if (!isDesktopApp()) return;
  try {
    const { exit } = await import("@tauri-apps/plugin-process");
    await exit(0);
  } catch (err) {
    console.warn("[Desktop] Failed to exit desktop app:", err);
  }
}
