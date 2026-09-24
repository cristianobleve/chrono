"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Inbox,
  CheckSquare,
  GitPullRequest,
  Sparkles,
  Layers,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  PenSquare,
  HelpCircle,
  Settings,
  Zap,
  Box,
  SlidersHorizontal,
  Home,
  UserPlus,
  ArrowDownToLine,
  MoreHorizontal,
  UploadCloud,
  Calendar,
  Grid2X2,
  Flame,
  Tag as TagIcon,
  Trash2,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChronoLogo } from "@/components/ui/ChronoLogo";
import { WorkspaceSwitcherDropdown } from "@/components/workspaces/WorkspaceSwitcherDropdown";
import { AccountSwitcherMenu } from "@/components/accounts/AccountSwitcherMenu";
import { useTranslation } from "@/i18n";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const {
    workspace,
    team,
    currentUser,
    trash,
    supabaseStatus,
    setActiveModal,
  } = useLinearStore();

  const isSettings = pathname?.startsWith("/settings");

  return (
    <aside className="w-[240px] h-screen bg-zinc-950/80 border-r border-white/5 flex flex-col justify-between select-none text-xs font-normal text-zinc-400 shrink-0">
      {/* Top section: Workspace + Quick Search & Create */}
      <div className="flex flex-col min-h-0">
        {/* Workspace Dropdown Header with Switcher */}
        <div className="border-b border-white/5 flex items-center justify-between pr-2 bg-zinc-900/40">
          <div className="flex-1 min-w-0">
            <WorkspaceSwitcherDropdown />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal("command_menu");
              }}
              title="Cerca o salta a... (⌘K)"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal("new_issue");
              }}
              title="Nuova Issue (+)"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            >
              <PenSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-2 py-3 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-170px)]">
          {/* Workspace Group */}
          <div className="space-y-0.5">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
              Workspace & Flussi
            </span>

            <Link
              href="/projects"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                (pathname === "/projects" || pathname?.startsWith("/project/"))
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <Box className="w-4 h-4 text-zinc-400" />
              <span>{t.projects.title}</span>
            </Link>

            <Link
              href="/issues"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname === "/issues"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <CheckSquare className="w-4 h-4 text-zinc-400" />
              <span>{t.issues.title}</span>
            </Link>

            <Link
              href="/timeline"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname === "/timeline"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>{t.nav.timeline}</span>
            </Link>

            <Link
              href="/inbox"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname === "/inbox"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <Inbox className="w-4 h-4 text-zinc-400" />
              <span>{t.nav.inbox}</span>
            </Link>

            <Link
              href={`/u/@${currentUser.username || "me"}`}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname?.startsWith("/u/") || pathname?.startsWith("/@") || pathname?.startsWith("/profiles")
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span>{t.nav.profiles}</span>
            </Link>

            <Link
              href="/agent"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors group",
                pathname === "/agent"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <Sparkles className="w-4 h-4 text-zinc-400 group-hover:scale-105 transition-transform" />
              <span className="flex-1">{t.nav.agent}</span>
            </Link>
          </div>

          {/* Productivity Tools Group */}
          <div className="space-y-0.5">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
              Strumenti & Organizzazione
            </span>

            <Link
              href="/calendar"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname === "/calendar"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Calendario</span>
            </Link>

            <Link
              href="/eisenhower"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname === "/eisenhower"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <Grid2X2 className="w-4 h-4 text-cyan-400" />
              <span>Matrice Eisenhower</span>
            </Link>

            <Link
              href="/habits"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname === "/habits"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{t.nav.habits}</span>
            </Link>

            <Link
              href="/tags"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname === "/tags"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <TagIcon className="w-4 h-4 text-fuchsia-400" />
              <span>{t.nav.tags}</span>
            </Link>

            <Link
              href="/trash"
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors group",
                pathname === "/trash"
                  ? "bg-zinc-800/80 text-white font-semibold border border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-red-400/80 group-hover:text-red-400 transition-colors" />
                <span>{t.nav.trash}</span>
              </div>
              {trash.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 text-[9px] font-mono font-bold">
                  {trash.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom section: Account Switcher & Settings */}
      <div className="p-3 flex flex-col gap-2 border-t border-white/5 bg-zinc-900/30">
        {/* Multi-Account Switcher Profile Menu */}
        <AccountSwitcherMenu />

        {/* Settings & Supabase Status */}
        <div className="flex items-center justify-between px-1 pt-1.5 border-t border-white/5 text-xs text-zinc-400">
          <Link
            href="/settings/general"
            className={cn(
              "p-1.5 hover:text-white hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-1.5 text-xs",
              isSettings && "text-white bg-zinc-800 font-semibold"
            )}
            title="Impostazioni di sistema"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.nav.settings}</span>
          </Link>

          {/* Supabase Status Pill */}
          <Link
            href="/settings/database"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/5 hover:border-white/20 transition-colors text-[10px]"
            title={`Supabase Database: ${supabaseStatus}`}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                supabaseStatus === "connected" && "bg-emerald-400",
                supabaseStatus === "syncing" && "bg-amber-400 animate-spin",
                supabaseStatus === "offline" && "bg-zinc-500",
                supabaseStatus === "error" && "bg-red-500"
              )}
            />
            <span className="font-mono text-[10px] text-zinc-400">
              {supabaseStatus === "connected" ? "Supabase" : supabaseStatus}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
