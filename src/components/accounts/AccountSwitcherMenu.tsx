"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  ChevronDown,
  UserPlus,
  Settings,
  LogOut,
  Users,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatUserDisplayName, useHydrated } from "@/lib/userUtils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { supabase } from "@/lib/supabase";

export const AccountSwitcherMenu: React.FC = () => {
  const {
    currentUser,
    preferences,
    setActiveModal,
    workspace,
  } = useLinearStore();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isHydrated = useHydrated();

  const currentWorkspaceRole = (workspace?.role || currentUser.role || "member").toLowerCase();
  const canManageMembers = currentWorkspaceRole === "owner" || currentWorkspaceRole === "admin";

  const currentPrimaryName = isHydrated
    ? formatUserDisplayName(currentUser, preferences?.displayNames)
    : (currentUser.name || "User");

  const currentSecondaryName = isHydrated
    ? (preferences?.displayNames === "username" ? currentUser.name : `@${currentUser.username || "user"}`)
    : `@${currentUser.username || "user"}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[AccountMenu] Logout error:", err);
    } finally {
      window.location.assign("/login");
    }
  };

  const getRoleBadge = () => {
    if (currentWorkspaceRole === "owner") {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-300 uppercase tracking-wider border border-amber-500/20 shrink-0">
          Owner
        </span>
      );
    }
    if (currentWorkspaceRole === "admin") {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-white uppercase tracking-wider border border-white/10 shrink-0">
          Admin
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-800 text-zinc-400 uppercase tracking-wider border border-white/5 shrink-0">
        Associato
      </span>
    );
  };

  return (
    <div className="relative w-full" ref={menuRef}>
      {/* Trigger Profile Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer group text-left",
          isOpen ? "bg-zinc-900" : "hover:bg-zinc-900/80"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            size="md"
            className="w-7 h-7 rounded-[7px]"
          />

          <div className="flex flex-col min-w-0">
            <span suppressHydrationWarning className="text-xs font-semibold text-white truncate leading-tight group-hover:text-zinc-200 transition-colors">
              {currentPrimaryName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span suppressHydrationWarning className="text-[10px] text-zinc-500 truncate">
                {currentSecondaryName}
              </span>
              {getRoleBadge()}
            </div>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-3 h-3 text-zinc-500 group-hover:text-white transition-transform shrink-0",
            isOpen && "rotate-180 text-white"
          )}
        />
      </button>

      {/* Account Popup Menu (Opens upwards) */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0c0d0e] border border-white/10 rounded-[12px] shadow-[0_24px_50px_rgba(0,0,0,0.95)] p-1.5 z-50 flex flex-col gap-1 select-none">
          {/* Active User Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/5">
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatarUrl}
              size="md"
              className="w-8 h-8 rounded-[8px]"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span suppressHydrationWarning className="truncate text-xs font-semibold text-white">
                  {currentPrimaryName}
                </span>
                {getRoleBadge()}
              </div>
              <span className="text-[10px] text-zinc-400 truncate">
                {currentUser.email || currentSecondaryName}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-1.5 border-t border-white/5 flex flex-col gap-0.5">
            {canManageMembers && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setActiveModal("new_account");
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs transition-colors cursor-pointer group"
              >
                <UserPlus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                <span>Invita un membro...</span>
              </button>
            )}

            <Link
              href={`/u/@${currentUser.username || "me"}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs transition-colors cursor-pointer group"
            >
              <UserIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Scheda Profilo</span>
            </Link>

            <Link
              href="/settings/members"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs transition-colors cursor-pointer group"
            >
              <Users className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Gestione Membri</span>
            </Link>

            <Link
              href="/settings/preferences"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs transition-colors cursor-pointer group"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Impostazioni Profilo</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer group"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Esci dall'account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
