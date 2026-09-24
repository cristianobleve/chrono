"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Clock,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Trash2,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  FolderGit2,
  Milestone as MilestoneIcon,
  Maximize2,
  Calendar,
  User,
} from "lucide-react";
import { useLinearStore } from "@/store/useLinearStore";
import { TimelineEvent, TimelineEntityType, TimelineActionType } from "@/types";
import { cn } from "@/lib/utils";

interface TimelineDrawerProps {
  projectId?: string; // Optional filter for specific project history
}

export const TimelineDrawer: React.FC<TimelineDrawerProps> = ({ projectId }) => {
  const {
    timelineEvents,
    isTimelineDrawerOpen,
    setTimelineDrawerOpen,
    currentWorkspaceId,
    workspace,
    clearTimeline,
    setSelectedIssueId,
    setActiveModal,
  } = useLinearStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState<"all" | TimelineEntityType>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");

  // Filter events by workspace (and optionally project)
  const filteredEvents = useMemo(() => {
    return (timelineEvents || []).filter((evt) => {
      // Workspace filter
      const evtWs = evt.workspaceId || "ws-1";
      if (currentWorkspaceId && evtWs !== currentWorkspaceId) {
        return false;
      }
      // Project specific filter
      if (projectId) {
        const matchesEntity = evt.entityId === projectId;
        const matchesProjectRef = evt.metadata?.projectId === projectId;
        if (!matchesEntity && !matchesProjectRef) return false;
      }
      // Entity type filter
      if (selectedEntityType !== "all" && evt.entityType !== selectedEntityType) {
        return false;
      }
      // Action type filter
      if (selectedActionType !== "all" && !evt.action.includes(selectedActionType)) {
        return false;
      }
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = evt.entityTitle.toLowerCase().includes(q);
        const inDesc = evt.description.toLowerCase().includes(q);
        const inAuthor = evt.authorName.toLowerCase().includes(q);
        const inId = (evt.entityIdentifier || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inAuthor && !inId) return false;
      }
      return true;
    });
  }, [timelineEvents, currentWorkspaceId, projectId, selectedEntityType, selectedActionType, searchQuery]);

  // Group events by human-friendly date
  const groupedEvents = useMemo(() => {
    const groups: { label: string; events: TimelineEvent[] }[] = [];
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    filteredEvents.forEach((evt) => {
      const d = new Date(evt.timestamp);
      let groupLabel = "Precedenti";
      if (d.toDateString() === todayStr) {
        groupLabel = "Oggi";
      } else if (d.toDateString() === yesterdayStr) {
        groupLabel = "Ieri";
      } else {
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          groupLabel = "Questa Settimana";
        } else if (diffDays <= 30) {
          groupLabel = "Ultimi 30 Giorni";
        } else {
          groupLabel = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
        }
      }

      let group = groups.find((g) => g.label === groupLabel);
      if (!group) {
        group = { label: groupLabel, events: [] };
        groups.push(group);
      }
      group.events.push(evt);
    });

    return groups;
  }, [filteredEvents]);

  if (!isTimelineDrawerOpen) return null;

  const getActionBadge = (action: TimelineActionType, entityType: TimelineEntityType) => {
    if (action.includes("created")) {
      return {
        icon: PlusCircle,
        label: "Creato",
      };
    }
    if (action.includes("completed") || action === "issue_status_changed") {
      return {
        icon: CheckCircle2,
        label: "Avanzamento",
      };
    }
    if (action.includes("deleted")) {
      return {
        icon: Trash2,
        label: "Eliminato",
      };
    }
    if (action.includes("restored")) {
      return {
        icon: RotateCcw,
        label: "Ripristinato",
      };
    }
    return {
      icon: Sparkles,
      label: "Modificato",
    };
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

      if (diffSec < 60) return "Adesso";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min fa`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} h fa`;
      return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px] transition-opacity"
        onClick={() => setTimelineDrawerOpen(false)}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-auto">
        <div className="w-screen max-w-md sm:max-w-lg lg:max-w-xl bg-zinc-950 border-l border-white/10 text-zinc-300 flex flex-col shadow-2xl animate-slide-left">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-white tracking-tight">Cronologia & Audit Storico</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-900 text-zinc-400 border border-white/10">
                    {filteredEvents.length}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Cronoprogramma delle modifiche per {workspace?.name || "Workspace"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/timeline"
                onClick={() => setTimelineDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                title="Apri pagina completa cronoprogramma"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setTimelineDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-zinc-950">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca modifiche, issue, progetti, autori..."
                className="w-full bg-zinc-900 border border-white/10 focus:border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Entity Type Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: "all", label: "Tutti" },
                { id: "project", label: "Progetti" },
                { id: "issue", label: "Issue" },
                { id: "milestone", label: "Milestone" },
                { id: "workspace", label: "Workspace" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedEntityType(tab.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
                    selectedEntityType === tab.id
                      ? "bg-zinc-800 text-white font-medium shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Feed Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {groupedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-white mb-1">Nessuna modifica trovata</h3>
                <p className="text-[11px] text-zinc-500 max-w-xs">
                  {searchQuery
                    ? "Nessun evento corrisponde ai criteri di ricerca impostati."
                    : "Non ci sono ancora eventi registrati in questo workspace."}
                </p>
              </div>
            ) : (
              groupedEvents.map((group) => (
                <div key={group.label} className="space-y-3">
                  {/* Date Sticky Header */}
                  <div className="sticky top-0 z-10 flex items-center gap-2 py-1 bg-zinc-950/90 backdrop-blur-sm">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] font-mono text-zinc-500">{group.events.length} eventi</span>
                  </div>

                  {/* Events in this Group with continuous centered line */}
                  <div className="relative pl-6 space-y-3">
                    {/* Continuous Vertical Timeline Line - ALWAYS visible */}
                    <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-zinc-800" />

                    {group.events.map((evt) => {
                      const badge = getActionBadge(evt.action, evt.entityType);

                      return (
                        <div key={evt.id} className="relative group">
                          {/* Center Circle Node on Timeline connector: perfectly aligned at 8px */}
                          <div className="absolute -left-6 top-3 w-4 h-4 rounded-full border border-white/20 bg-zinc-950 flex items-center justify-center z-10 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          </div>

                          {/* Card Content */}
                          <div className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-white/5 hover:border-white/10 rounded-xl p-3.5 transition-all shadow-sm">
                            {/* Top Author & Timestamp Row */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-4 h-4 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[9px] font-semibold text-zinc-200 shrink-0">
                                  {evt.authorName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-semibold text-white truncate">{evt.authorName}</span>
                                <span className="text-[10px] text-zinc-600">·</span>
                                <span className="text-[10px] text-zinc-400 truncate">{badge.label}</span>
                              </div>

                              <span
                                className="text-[10px] font-mono text-zinc-500 shrink-0"
                                title={new Date(evt.timestamp).toLocaleString("it-IT")}
                              >
                                {formatRelativeTime(evt.timestamp)}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-zinc-200 mb-2 leading-relaxed">{evt.description}</p>

                            {/* Diff changes if present */}
                            {evt.diff && evt.diff.length > 0 && (
                              <div className="mb-2 p-2 rounded-lg bg-zinc-950 border border-white/5 flex flex-col gap-1 text-[11px] font-mono">
                                {evt.diff.map((d, dIdx) => (
                                  <div key={dIdx} className="flex items-center gap-1.5">
                                    <span className="text-zinc-500">{d.label || d.field}:</span>
                                    <span className="line-through text-zinc-500 text-[10px]">{String(d.oldValue)}</span>
                                    <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
                                    <span className="text-zinc-200 font-medium text-[10px]">{String(d.newValue)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Bottom Entity Tag & Quick Link */}
                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                {evt.entityIdentifier && (
                                  <span className="font-mono font-medium text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/10">
                                    {evt.entityIdentifier}
                                  </span>
                                )}
                                <span className="font-medium text-zinc-400 truncate max-w-[200px]">
                                  {evt.entityTitle}
                                </span>
                              </div>

                              {evt.entityHref && (
                                <Link
                                  href={evt.entityHref}
                                  onClick={() => setTimelineDrawerOpen(false)}
                                  className="text-zinc-300 hover:text-white flex items-center gap-1 font-medium hover:underline transition-colors"
                                >
                                  <span>Apri</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
            <span className="font-mono text-[10px]">SYNC Realtime</span>
            <Link
              href="/timeline"
              onClick={() => setTimelineDrawerOpen(false)}
              className="text-zinc-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Visualizza Cronoprogramma Esteso</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
