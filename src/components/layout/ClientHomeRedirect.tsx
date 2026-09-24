"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLinearStore } from "@/store/useLinearStore";

const VIEW_TO_PATH: Record<string, string> = {
  agent: "/agent",
  projects: "/projects",
  all_issues: "/issues",
  my_issues: "/my-issues",
  inbox: "/inbox",
  active_issues: "/issues",
  current_cycle: "/cycles",
};

export function ClientHomeRedirect() {
  const router = useRouter();
  const defaultHomeView = useLinearStore((state) => state.preferences.defaultHomeView);

  useEffect(() => {
    let target = VIEW_TO_PATH[defaultHomeView] || "/agent";
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("chrono_app_store_v7");
        if (stored) {
          const parsed = JSON.parse(stored);
          const pref = parsed?.state?.preferences?.defaultHomeView;
          if (pref && VIEW_TO_PATH[pref]) {
            target = VIEW_TO_PATH[pref];
            document.cookie = `chrono_default_home=${pref}; path=/; max-age=31536000; SameSite=Lax`;
          }
        }
      }
    } catch {
      // ignore
    }
    router.replace(target);
  }, [defaultHomeView, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black text-zinc-600 text-xs">
      <div className="w-4 h-4 border border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
}
