"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Sparkles,
  Box,
  CheckSquare,
  LayoutGrid,
  Settings,
  Search,
  Plus,
  LogOut,
  User as UserIcon,
  Clock,
  ImageIcon,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcherDropdown } from "@/components/workspaces/WorkspaceSwitcherDropdown";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { supabase } from "@/lib/supabase";
import { useHydrated } from "@/lib/userUtils";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useTranslation } from "@/i18n";

export const TwingateNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    setActiveModal,
    addToast,
    getUserDisplayName,
  } = useLinearStore();
  const { t } = useTranslation();

  const isHydrated = useHydrated();
  const currentUserName = isHydrated ? getUserDisplayName(currentUser) : (currentUser.name || "User");

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    try {
      await supabase.auth.signOut();
    } catch (e) {}

    useLinearStore.setState({
      workspaces: [],
      workspace: {
        id: "",
        identifier: "",
        internalId: "",
        name: "",
        slug: "",
        icon: "chrono",
        iconBg: "#121419",
        iconColor: "#5e6ad2",
        plan: "Free",
        createdAt: "",
        updatedAt: "",
      },
      currentWorkspaceId: "",
      projects: [],
      issues: [],
      habits: [],
      tags: [],
      projectFolders: [],
      trash: [],
      timelineEvents: [],
      accounts: [],
      currentAccountId: "",
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("chrono_app_store_v8");
        localStorage.removeItem("linear-clone-storage");
      } catch (_) {}
    }

    addToast({
      title: "Disconnessione",
      description: "Sei uscito dal tuo account con successo.",
      type: "info",
    });
    router.push("/login");
  };

  const mainNavItems = [
    { label: t.nav.projects, href: "/projects", icon: Box, match: (p: string) => p.startsWith("/project") },
    { label: t.nav.issues, href: "/issues", icon: CheckSquare, match: (p: string) => p === "/issues" || p === "/my-issues" },
    { label: t.nav.timeline, href: "/timeline", icon: Clock, match: (p: string) => p.startsWith("/timeline") },
    { label: t.nav.views, href: "/views", icon: Target, match: (p: string) => p.startsWith("/views") },
    { label: t.nav.agent, href: "/agent", icon: Sparkles, match: (p: string) => p.startsWith("/agent") },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40 w-full px-2.5 sm:px-4 md:px-8 pt-2.5 sm:pt-3 select-none pointer-events-none">
      {/* Clean Floating Bar: Zero nested background boxes */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-3.5 h-[50px] sm:h-[54px] rounded-[10px] bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center justify-between pointer-events-auto transition-all gap-2">
        {/* Left: Workspace Selector (Clean ghost) */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          <WorkspaceSwitcherDropdown variant="navbar" />
        </div>

        {/* Center: Flat Navigation Links (Visible on large screens >= 1024px to guarantee no overlap with workspace or tools) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
          {mainNavItems.map((item) => {
            const isActive = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "h-8 px-2.5 xl:px-3 rounded-[6px] text-xs font-medium tracking-tight transition-colors inline-flex items-center gap-1.5 xl:gap-2 select-none shrink-0",
                  isActive
                    ? "text-white bg-white/[0.08]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-white" : "text-zinc-400")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools: Clean Ghost Search -> + Nuovo Primary -> Avatar -> Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Ghost Search Trigger */}
          <button
            type="button"
            onClick={() => setActiveModal("command_menu")}
            className="flex items-center justify-center lg:justify-between w-8 h-8 lg:w-36 xl:w-48 px-2 lg:px-2.5 rounded-[6px] hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors text-xs cursor-pointer group shrink-0"
            title="Cerca nel workspace o digita un comando (⌘K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
              <span className="hidden lg:inline text-[11px] text-zinc-400 group-hover:text-zinc-300 truncate select-none">
                {t.common.search}
              </span>
            </div>
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 bg-white/[0.06] rounded-[4px] shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* New Issue Button: White "+ Nuovo" action button */}
          <button
            type="button"
            onClick={() => setActiveModal("new_issue")}
            className="h-8 px-2 sm:px-3 rounded-[6px] bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-sm shrink-0"
            title="Nuova Issue (C)"
            aria-label="Nuova Issue"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="hidden sm:inline">Nuovo</span>
          </button>

          <NotificationCenter />

          {/* Vertical Divider */}
          <div className="h-4 w-px bg-white/10 mx-0.5 shrink-0" />

          {/* User Profile Avatar: Exact h-8 w-8 box matching "+ Nuovo" button */}
          <div className="relative shrink-0 flex items-center" ref={userMenuRef}>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "h-8 w-8 p-0 rounded-[6px] border border-white/15 hover:border-white/30 bg-zinc-850 flex items-center justify-center transition-all cursor-pointer shrink-0 focus:outline-none overflow-hidden select-none",
                userMenuOpen && "border-white/40 ring-1 ring-white/20"
              )}
              title={currentUserName}
              aria-label="Menu utente"
            >
              <UserAvatar
                name={currentUser.name}
                avatarUrl={currentUser.avatarUrl || currentUser.avatar}
                size="md"
                className="w-full h-full border-0 rounded-none bg-transparent"
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#0c0d0e] border border-white/10 rounded-[10px] shadow-[0_24px_50px_rgba(0,0,0,0.95)] p-1.5 z-50 flex flex-col animate-slide-up select-none">
                {/* User Info Header with Avatar */}
                <div className="px-2.5 py-2 flex items-center gap-2.5 border-b border-white/5">
                  <UserAvatar
                    name={currentUser.name}
                    avatarUrl={currentUser.avatarUrl || currentUser.avatar}
                    size="md"
                    className="w-8 h-8 rounded-[6px]"
                  />
                  <div className="flex flex-col min-w-0">
                    <span suppressHydrationWarning className="text-xs font-semibold text-white truncate leading-tight">
                      {currentUserName}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-sans truncate leading-tight mt-0.5">
                      {currentUser.email || "Non autenticato"}
                    </span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col gap-0.5 py-1">
                  <Link
                    href="/settings/general"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>{t.nav.profileAndAccount}</span>
                  </Link>

                  <Link
                    href="/settings/workspace"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>{t.nav.workspaceSettings}</span>
                  </Link>

                  <Link
                    href="/timeline"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>{t.nav.timeline}</span>
                  </Link>

                  <Link
                    href="/pomodoro"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>{t.nav.pomodoro}</span>
                  </Link>

                  <Link
                    href="/ascii-generator"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>ASCII</span>
                  </Link>
                </div>

                {/* Logout Action */}
                <div className="pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left group font-normal"
                  >
                    <LogOut className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                    <span>{t.nav.signOut}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Navigation Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/10 text-zinc-400 hover:text-white lg:hidden shrink-0 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? t.common.close : t.nav.settings}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <span className="text-lg leading-none">×</span> : <LayoutGrid className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mx-auto mt-2 w-full max-w-7xl rounded-[10px] border border-white/10 bg-[#0c0d0e] p-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.95)] pointer-events-auto lg:hidden animate-slide-up select-none">
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1.5" aria-label="Navigazione mobile e tablet">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex min-h-[44px] items-center gap-2.5 rounded-[7px] px-3 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.1] text-white"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveModal("new_issue");
              }}
              className="flex min-h-[44px] items-center gap-2.5 rounded-[7px] px-3 text-xs font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.issues.newIssue}</span>
            </button>
            <Link
              href="/settings/general"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center gap-2.5 rounded-[7px] px-3 text-xs font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.nav.settings}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
