"use client";

import React, { useState, useMemo } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { TrashCategory, TrashItem } from "@/types";
import {
  Trash2,
  RotateCcw,
  Search,
  Layers,
  CheckSquare,
  Tag as TagIcon,
  Flame,
  Folder,
  AlertTriangle,
  Clock,
  Sparkles,
  Inbox,
  Filter,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/react-bits/SpotlightCard";
import { ShinyText } from "@/components/ui/react-bits/ShinyText";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export default function TrashPage() {
  const { t } = useTranslation();
  const {
    trash,
    restoreFromTrash,
    permanentDeleteFromTrash,
    emptyTrash,
    currentWorkspaceId,
  } = useLinearStore();

  const [activeCategory, setActiveCategory] = useState<TrashCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  // Filter trash for current workspace
  const workspaceTrash = useMemo(() => {
    return trash.filter(
      (item) => !item.workspaceId || item.workspaceId === currentWorkspaceId
    );
  }, [trash, currentWorkspaceId]);

  // Counts by category
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: workspaceTrash.length,
      project: 0,
      issue: 0,
      habit: 0,
      tag: 0,
      folder: 0,
    };
    workspaceTrash.forEach((t) => {
      if (res[t.category] !== undefined) {
        res[t.category]++;
      }
    });
    return res;
  }, [workspaceTrash]);

  // Filtered items by category and search
  const filteredItems = useMemo(() => {
    return workspaceTrash.filter((item) => {
      const matchCategory = activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [workspaceTrash, activeCategory, searchQuery]);

  const navItems: { id: TrashCategory | "all"; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: t.trash.all, icon: <Trash2 className="w-4 h-4" /> },
    { id: "project", label: t.trash.projects, icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: "issue", label: t.trash.issues, icon: <CheckSquare className="w-4 h-4 text-zinc-300" /> },
    { id: "habit", label: t.trash.habits, icon: <Flame className="w-4 h-4 text-amber-400" /> },
    { id: "tag", label: t.trash.tags, icon: <TagIcon className="w-4 h-4 text-purple-400" /> },
    { id: "folder", label: t.trash.folders, icon: <Folder className="w-4 h-4 text-zinc-300" /> },
  ];

  const getCategoryBadge = (category: TrashCategory) => {
    switch (category) {
      case "project":
        return <span className="px-2 py-0.5 rounded-[6px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">{t.trash.projects}</span>;
      case "issue":
        return <span className="px-2 py-0.5 rounded-[6px] bg-zinc-800 text-zinc-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider">{t.trash.issues}</span>;
      case "habit":
        return <span className="px-2 py-0.5 rounded-[6px] bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">{t.trash.habits}</span>;
      case "tag":
        return <span className="px-2 py-0.5 rounded-[6px] bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">{t.trash.tags}</span>;
      case "folder":
        return <span className="px-2 py-0.5 rounded-[6px] bg-zinc-800 text-zinc-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider">{t.trash.folders}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 flex min-h-0 w-full overflow-hidden bg-black select-none">
      {/* Left Sidebar: Vertical Navigation Tabs (Style Settings) */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950 shrink-0 p-5 flex flex-col gap-4 overflow-y-auto hidden md:flex">
        <div className="flex items-center gap-2.5 px-3 py-2 text-white">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs">{t.trash.title}</span>
            <span className="text-[10px] text-zinc-500">{t.trash.subtitle}</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-xs">
          {navItems.map((item) => {
            const count = counts[item.id] || 0;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.id)}
                className={cn(
                  "px-3.5 py-2 rounded-lg font-medium transition-all text-xs flex items-center justify-between cursor-pointer",
                  isActive
                    ? "text-white bg-white/10 border border-white/10 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn(isActive ? "text-white" : "text-zinc-500")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono",
                    count > 0 ? "bg-white/10 text-white" : "text-zinc-600 opacity-50"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Empty Trash Button in Sidebar */}
        {workspaceTrash.length > 0 && (
          <div className="mt-auto pt-4 border-t border-white/5">
            {confirmEmpty ? (
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-950/20 border border-red-900/40">
                <span className="text-[11px] text-red-300 font-medium text-center">
                  {t.trash.confirmEmpty}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      emptyTrash();
                      setConfirmEmpty(false);
                    }}
                    className="flex-1 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] transition-colors"
                  >
                    {t.common.confirm}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmEmpty(false)}
                    className="flex-1 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmEmpty(true)}
                className="w-full px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.trash.emptyTrash}</span>
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Right Column: Main Trash Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 md:p-10 max-w-5xl">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {t.trash.title}
              </h1>
              {workspaceTrash.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold font-mono">
                  {workspaceTrash.length}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {t.trash.subtitle}
            </p>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/10 focus-within:border-white/20 w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile Tabs selector */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-3 border-b border-white/5 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-colors",
                activeCategory === item.id
                  ? "bg-white text-zinc-950 font-medium"
                  : "bg-zinc-900/60 text-zinc-400"
              )}
            >
              {item.label} ({counts[item.id] || 0})
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className="py-6 flex flex-col gap-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
                <Trash2 className="w-6 h-6 opacity-40" />
              </div>
              <h3 className="text-sm font-semibold text-white">{t.trash.emptyStateTitle}</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                {t.trash.emptyStateDesc}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <SpotlightCard
                key={item.id}
                spotlightColor="rgba(239, 68, 68, 0.12)"
                className="p-4 rounded-xl bg-zinc-900/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {item.category === "project" && <Layers className="w-4 h-4 text-emerald-400" />}
                    {item.category === "issue" && <CheckSquare className="w-4 h-4 text-zinc-300" />}
                    {item.category === "habit" && <Flame className="w-4 h-4 text-amber-400" />}
                    {item.category === "tag" && <TagIcon className="w-4 h-4 text-purple-400" />}
                    {item.category === "folder" && <Folder className="w-4 h-4 text-zinc-300" />}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate max-w-md">
                        {item.title}
                      </span>
                      {getCategoryBadge(item.category)}
                    </div>

                    {item.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {formatDate(item.deletedAt)}
                      </span>
                      {item.deletedBy && (
                        <span>da {item.deletedBy}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <button
                    type="button"
                    onClick={() => restoreFromTrash(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.trash.restore}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => permanentDeleteFromTrash(item.id)}
                    className="p-1.5 rounded-lg bg-zinc-950 hover:bg-red-950/40 hover:border-red-800/60 border border-white/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title={t.trash.deletePermanently}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </SpotlightCard>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
