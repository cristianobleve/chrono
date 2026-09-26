"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  ChevronDown,
  Check,
  Plus,
  Settings,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChronoLogo } from "@/components/ui/ChronoLogo";
import { WorkspaceIcon } from "@/components/workspaces/WorkspaceIcon";
import { useTranslation } from "@/i18n";

interface WorkspaceSwitcherDropdownProps {
  variant?: "navbar" | "sidebar";
}

export const WorkspaceSwitcherDropdown: React.FC<WorkspaceSwitcherDropdownProps> = ({
  variant = "navbar",
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    workspace,
    workspaces,
    currentWorkspaceId,
    switchWorkspace,
    setActiveModal,
  } = useLinearStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  if (workspaces.length === 0) {
    return (
      <div className="flex items-center h-8 px-2.5 rounded-[6px] select-none">
        <img
          src="/name.svg"
          alt="Chrono"
          className="h-3.5 w-auto object-contain opacity-95"
        />
      </div>
    );
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {variant === "navbar" ? (
        /* NAVBAR VARIANT: Sleek Single Workspace Button (Workspace Name ▾) */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 h-8 px-2 rounded-[6px] hover:bg-white/[0.06] transition-colors cursor-pointer group select-none shrink-0",
            isOpen && "bg-white/[0.08]"
          )}
        >
          <WorkspaceIcon
            icon={workspace.icon}
            iconBg={workspace.iconBg}
            iconColor={workspace.iconColor}
            logoUrl={workspace.logoUrl}
            name={workspace.name}
            size="xs"
          />
          <span className="hidden sm:inline font-sans font-medium text-[13px] text-white truncate max-w-[100px] md:max-w-[130px] xl:max-w-[170px] tracking-tight">
            {workspace.name}
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform shrink-0",
              isOpen && "rotate-180 text-white"
            )}
          />
        </button>
      ) : (
        /* SIDEBAR VARIANT: Compact Header Switcher */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-12 w-full px-3 flex items-center justify-between transition-colors cursor-pointer group text-left",
            isOpen ? "bg-zinc-900/80" : "hover:bg-zinc-900/40"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <WorkspaceIcon
              icon={workspace.icon}
              iconBg={workspace.iconBg}
              iconColor={workspace.iconColor}
              logoUrl={workspace.logoUrl}
              name={workspace.name}
              size="sm"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white truncate tracking-tight text-xs leading-tight">
                {workspace.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-zinc-500 truncate font-mono">
                  {workspace.slug}
                </span>
              </div>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform shrink-0",
              isOpen && "rotate-180 text-white"
            )}
          />
        </button>
      )}

      {/* Dropdown Menu: 100% Solid Opaque Obsidian Background (No bleed-through) */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 bg-[#0c0d0e] border border-white/10 rounded-[10px] shadow-[0_24px_50px_rgba(0,0,0,0.95)] p-1 z-[999] flex flex-col gap-0.5 select-none w-64"
        >
          {/* Workspace List: ONLY Icon and Name */}
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
            {workspaces.map((ws) => {
              const isActive = ws.id === currentWorkspaceId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    switchWorkspace(ws.id, router);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-[6px] text-left transition-colors text-xs font-medium cursor-pointer group",
                    isActive
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <WorkspaceIcon
                      icon={ws.icon}
                      iconBg={ws.iconBg}
                      iconColor={ws.iconColor}
                      logoUrl={ws.logoUrl}
                      name={ws.name}
                      size="xs"
                    />
                    <span className="truncate text-white text-xs">
                      {ws.name}
                    </span>
                  </div>

                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Clean Action: + Aggiungi un altro workspace */}
          <div className="pt-1 mt-1 border-t border-white/5 flex flex-col">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setActiveModal("new_workspace");
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-left text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
              <span>{t.modals.addAnotherWorkspace}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
