"use client";

import React, { useEffect, useRef } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { TwingateNavbar } from "@/components/layout/TwingateNavbar";
import { TwingateFooter } from "@/components/layout/TwingateFooter";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { CommandMenu } from "@/components/command-menu/CommandMenu";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { NewIssueModal } from "@/components/issues/NewIssueModal";
import { ImportProjectModal } from "@/components/projects/ImportProjectModal";
import { IssueDetailDrawer } from "@/components/issues/IssueDetailDrawer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChronoLogo } from "@/components/ui/ChronoLogo";
import { useTranslation } from "@/i18n";

import { NewWorkspaceModal } from "@/components/workspaces/NewWorkspaceModal";
import { NewAccountModal } from "@/components/accounts/NewAccountModal";
import { TimelineDrawer } from "@/components/timeline/TimelineDrawer";
import { NoWorkspaceAccess } from "@/components/layout/NoWorkspaceAccess";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const setActiveModal = useLinearStore((state) => state.setActiveModal);
  const activeModal = useLinearStore((state) => state.activeModal);
  const isWorkspaceLoading = useLinearStore((state) => state.isWorkspaceLoading);
  const workspace = useLinearStore((state) => state.workspace);
  const workspaces = useLinearStore((state) => state.workspaces);
  const supabaseStatus = useLinearStore((state) => state.supabaseStatus);
  const pathname = usePathname();
  const lastKeyRef = useRef<string | null>(null);
  const keyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSettings = pathname?.startsWith("/settings");
  const isAgent = pathname?.startsWith("/agent");
  const isLogin = pathname === "/login" || pathname === "/signup" || pathname === "/reset-password" || pathname?.startsWith("/invite/");
  const isHome = pathname === "/";
  const isMarketing = ["/product", "/method", "/security", "/resources"].some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );
  const isAsciiGenerator = pathname === "/ascii-generator";
  const isStandalone = isHome || isLogin || isMarketing || isAsciiGenerator;
  const isProjectDetail = pathname?.startsWith("/project/") && pathname !== "/projects";
  const isProfilePage =
    pathname === "/u" ||
    pathname?.startsWith("/u/") ||
    pathname?.startsWith("/@") ||
    pathname?.startsWith("/profiles/");
  const isFullBleed = isProjectDetail || isProfilePage;

  useEffect(() => {
    if (isStandalone) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape" && activeModal) {
          setActiveModal(null);
        }
        return;
      }

      // Command/Ctrl + K -> Command Menu
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActiveModal(activeModal === "command_menu" ? null : "command_menu");
        return;
      }

      // Escape -> close any modal
      if (e.key === "Escape") {
        setActiveModal(null);
        return;
      }

      // 'c' -> New Issue
      if (e.key.toLowerCase() === "c" && !activeModal && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveModal("new_issue");
        return;
      }

      // 'i' -> Import Project
      if (e.key.toLowerCase() === "i" && !activeModal && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveModal("import_project");
        return;
      }

      // 'n' then 'p' sequence -> New Project
      if (e.key.toLowerCase() === "n" && !activeModal && !e.metaKey && !e.ctrlKey) {
        lastKeyRef.current = "n";
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
        keyTimerRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        return;
      }

      if (e.key.toLowerCase() === "p" && lastKeyRef.current === "n" && !activeModal) {
        e.preventDefault();
        lastKeyRef.current = null;
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
        setActiveModal("new_project");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal, setActiveModal, isStandalone]);

  if (isStandalone) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#09090b] text-ink overflow-x-hidden">
        {children}
        <ToastContainer />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="h-screen min-h-screen w-full flex flex-col bg-[#08090a] text-white overflow-y-auto">
        <NoWorkspaceAccess />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="h-screen min-h-screen w-full flex flex-col bg-[#09090b] text-ink overflow-x-hidden select-none">
      {/* 1. Twingate Master Header & Ribbon */}
      <TwingateNavbar />

      {supabaseStatus !== "connected" && (
        <div
          className={cn(
            "fixed top-[4.75rem] right-4 z-[80] flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-[11px] shadow-lg backdrop-blur-md animate-fade-in",
            supabaseStatus === "syncing" && "border-amber-400/20 bg-amber-950/70 text-amber-200",
            supabaseStatus === "offline" && "border-zinc-500/30 bg-zinc-900/90 text-zinc-300",
            supabaseStatus === "error" && "border-red-400/25 bg-red-950/70 text-red-200"
          )}
          role="status"
          aria-live="polite"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              supabaseStatus === "syncing" && "bg-amber-300 animate-pulse",
              supabaseStatus === "offline" && "bg-zinc-400",
              supabaseStatus === "error" && "bg-red-400"
            )}
          />
          {supabaseStatus === "syncing" ? t.common.syncing : supabaseStatus === "offline" ? t.common.offline : t.common.syncFailed}
        </div>
      )}

      {/* 2. Main Page Container */}
      {workspaces.length === 0 ? (
        /* Empty Workspace Guard */
        <main className="flex-1 flex flex-col w-full min-h-0 pt-20 md:pt-24 bg-[#09090b]">
          <NoWorkspaceAccess />
          <TwingateFooter />
        </main>
      ) : isAgent ? (
        /* Agent Cockpit: 100% fixed viewport height with zero body scroll */
        <main className="flex-1 flex flex-col w-full min-h-0 overflow-hidden bg-[#09090b] pt-20 md:pt-24">
          {children}
        </main>
      ) : isSettings ? (
        /* Settings View: 2-column layout (Sidebar + Content + docked Footer) */
        <div className="flex-1 flex min-h-0 w-full overflow-hidden bg-[#09090b]">
          <aside className="w-64 border-r border-white/5 bg-[#09090b] shrink-0 overflow-y-auto hidden md:flex flex-col pt-20 md:pt-24">
            <SettingsSidebar />
          </aside>
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#09090b] pt-20 md:pt-24">
            <main className="flex-1 flex flex-col w-full">{children}</main>
            <TwingateFooter />
          </div>
        </div>
      ) : (
        /* Standard Pages (Projects, Issues, Views, etc.) */
        <div className={cn("flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden bg-[#09090b]", !isFullBleed && "pt-20 md:pt-24")}>
          <main className="flex-1 flex flex-col w-full">{children}</main>
          <TwingateFooter />
        </div>
      )}

      {/* 3. Global Chrono Modals & Drawers */}
      <CommandMenu />
      <NewProjectModal />
      <NewIssueModal />
      <ImportProjectModal />
      <NewWorkspaceModal />
      <NewAccountModal />
      <IssueDetailDrawer />
      <TimelineDrawer />
      <ToastContainer />

      {/* Global Workspace Transition Overlay (Clean, Professional, No Gradient Blobs) */}
      {isWorkspaceLoading && (
        <div className="fixed inset-0 z-[999] bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center gap-3.5 animate-fade-in select-none">
          <div className="w-14 h-14 rounded-[16px] bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
            <ChronoLogo size={28} glow={false} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-white tracking-tight">
              {t.common.workspaceLoading} "{workspace.name}"
            </span>
            <span className="text-xs text-zinc-400">
              {t.common.workspaceSyncing}
            </span>
          </div>
          <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1 border border-white/5">
            <div className="w-1/2 h-full bg-white rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};
