"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sliders,
  Sparkles,
  Database,
  Users,
  Settings2,
  Building2,
  Trash2,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useLinearStore } from "@/store/useLinearStore";
import { useTranslation } from "@/i18n";

export const SettingsSidebar: React.FC = () => {
  const pathname = usePathname();
  const { workspace } = useLinearStore();
  const { t } = useTranslation();

  const isAssociato = workspace?.role === "member" || workspace?.role === "guest";

  const personalItems = [
    { label: t.settingsSidebar.general, href: "/settings/general", icon: <Settings2 className="w-4 h-4" /> },
    { label: t.settingsSidebar.preferences, href: "/settings/preferences", icon: <Sliders className="w-4 h-4" /> },
  ];

  const adminItems = [
    { label: t.settingsSidebar.workspace, href: "/settings/workspace", icon: <Building2 className="w-4 h-4" /> },
    {
      label: t.settingsSidebar.members,
      href: "/settings/members",
      icon: <Users className="w-4 h-4" />,
      locked: isAssociato,
    },
    { label: t.settingsSidebar.ai, href: "/settings/ai", icon: <Sparkles className="w-4 h-4" /> },
    { label: t.settingsSidebar.database, href: "/settings/database", icon: <Database className="w-4 h-4" /> },
    { label: t.settingsSidebar.trash, href: "/trash", icon: <Trash2 className="w-4 h-4 text-red-400" /> },
  ];

  return (
    <div className="p-4 flex flex-col gap-5 w-full select-none text-xs">
      <Link
        href="/projects"
        className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 text-xs font-medium cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Torna ai progetti</span>
      </Link>

      {/* Account Section */}
      <div className="flex flex-col gap-1">
        <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Account
        </div>
        <nav className="flex flex-col gap-0.5">
          {personalItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs flex items-center justify-between gap-2.5",
                  isActive
                    ? "text-white bg-white/10 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn(isActive ? "text-white" : "text-zinc-500")}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Administration Section */}
      <div className="flex flex-col gap-1">
        <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Administration
        </div>
        <nav className="flex flex-col gap-0.5">
          {adminItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs flex items-center justify-between gap-2.5",
                  isActive
                    ? "text-white bg-white/10 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn(isActive ? "text-white" : "text-zinc-500")}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.locked && (
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-500 font-medium">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Admin</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
