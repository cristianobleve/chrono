"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Filter,
  Search,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Trash2,
  RotateCcw,
  ExternalLink,
  Layers,
  BarChart3,
  User,
  Users,
  FolderGit2,
  Milestone as MilestoneIcon,
  FileSpreadsheet,
  ListFilter,
  Activity,
  Check,
  ChevronDown,
  Building2,
} from "lucide-react";
import { useLinearStore } from "@/store/useLinearStore";
import { TimelineEvent, TimelineEntityType, TimelineActionType } from "@/types";
import { cn } from "@/lib/utils";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { useTranslation } from "@/i18n";
import type { TranslationDictionary } from "@/i18n";

interface ExportDropdownProps {
  t: TranslationDictionary["timeline"];
  onExportCSV: () => void;
  onExportJSON: () => void;
  onPrint: () => void;
}

const TimelineExportDropdown: React.FC<ExportDropdownProps> = ({
  t,
  onExportCSV,
  onExportJSON,
  onPrint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative inline-block text-xs select-none" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 px-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm",
          isOpen && "bg-zinc-800 border-white/20 text-white shadow-md"
        )}
      >
        <Download className="w-3.5 h-3.5 text-zinc-400" />
        <span>Export</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-180 text-white"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-zinc-950 border border-white/10 shadow-2xl p-1 flex flex-col gap-0.5 z-50 animate-slide-down">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportCSV();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-white">CSV</span>
              <span className="text-[10px] text-zinc-500">{t.csvSpreadsheet}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportJSON();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-white">JSON</span>
              <span className="text-[10px] text-zinc-500">{t.csvDump}</span>
            </div>
          </button>

          <div className="h-px bg-white/5 my-0.5" />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onPrint();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-white">Print</span>
              <span className="text-[10px] text-zinc-500">{t.printPdf}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export const TimelineView: React.FC = () => {
  const { t, lang } = useTranslation();
  const {
    timelineEvents,
    currentWorkspaceId,
    workspace,
    projects,
    accounts,
    addToast,
    clearTimeline,
  } = useLinearStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d">("all");

  const entityOptions: SelectOption[] = useMemo(
    () => [
      { value: "all", label: t.timeline.allEntities, icon: <Layers className="w-3.5 h-3.5 text-zinc-400" /> },
      { value: "project", label: t.timeline.onlyProjects, icon: <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" /> },
      { value: "issue", label: t.timeline.onlyIssues, icon: <Check className="w-3.5 h-3.5 text-zinc-400" /> },
      { value: "milestone", label: t.timeline.onlyMilestones, icon: <MilestoneIcon className="w-3.5 h-3.5 text-zinc-400" /> },
      { value: "workspace", label: t.timeline.onlyWorkspace, icon: <Building2 className="w-3.5 h-3.5 text-zinc-400" /> },
    ],
    [t]
  );

  const projectOptions: SelectOption[] = useMemo(
    () => [
      {
        value: "all",
        label: t.timeline.allProjects,
        icon: <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />,
      },
      ...projects.map((p) => ({
        value: p.id,
        label: p.name,
        icon: (
          <ProjectIconBadge
            project={p}
            size="xs"
            className="w-3.5 h-3.5 rounded-[3px] text-[8px]"
          />
        ),
      })),
    ],
    [projects, t]
  );

  const authorOptions: SelectOption[] = useMemo(
    () => [
      {
        value: "all",
        label: t.timeline.allAuthors,
        icon: <Users className="w-3.5 h-3.5 text-zinc-400" />,
      },
      ...accounts.map((acc) => ({
        value: acc.name,
        label: acc.name,
        icon: (
          <UserAvatar
            name={acc.name}
            avatarUrl={acc.avatarUrl}
            size="xs"
            className="w-3.5 h-3.5 rounded-[4px] text-[8px]"
          />
        ),
      })),
    ],
    [accounts, t]
  );

  // Filter events
  const filteredEvents = useMemo(() => {
    return (timelineEvents || []).filter((evt) => {
      const evtWs = evt.workspaceId || "ws-1";
      if (currentWorkspaceId && evtWs !== currentWorkspaceId) {
        return false;
      }
      if (selectedProject !== "all") {
        const matchesEntity = evt.entityId === selectedProject;
        const matchesProjectRef = evt.metadata?.projectId === selectedProject;
        if (!matchesEntity && !matchesProjectRef) return false;
      }
      if (selectedAuthor !== "all" && evt.authorId !== selectedAuthor && evt.authorName !== selectedAuthor) {
        return false;
      }
      if (selectedEntityType !== "all" && evt.entityType !== selectedEntityType) {
        return false;
      }
      if (dateRange !== "all") {
        const d = new Date(evt.timestamp);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (dateRange === "7d" && diffDays > 7) return false;
        if (dateRange === "30d" && diffDays > 30) return false;
      }
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
  }, [timelineEvents, currentWorkspaceId, selectedProject, selectedAuthor, selectedEntityType, dateRange, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const now = new Date().toDateString();
    const todayCount = filteredEvents.filter((e) => new Date(e.timestamp).toDateString() === now).length;
    const completions = filteredEvents.filter((e) => e.action.includes("completed") || e.action === "issue_status_changed").length;
    const authors = new Set(filteredEvents.map((e) => e.authorName)).size;

    return { total, todayCount, completions, authors };
  }, [filteredEvents]);

  // Grouped events for Visual Mode
  const groupedEvents = useMemo(() => {
    const groups: { label: string; events: TimelineEvent[] }[] = [];
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    filteredEvents.forEach((evt) => {
      const d = new Date(evt.timestamp);
      let groupLabel = t.timeline.groupPrevious;
      if (d.toDateString() === todayStr) {
        groupLabel = t.timeline.groupToday;
      } else if (d.toDateString() === yesterdayStr) {
        groupLabel = t.timeline.groupYesterday;
      } else {
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          groupLabel = t.timeline.groupThisWeek;
        } else if (diffDays <= 30) {
          groupLabel = t.timeline.groupLast30;
        } else {
          groupLabel = d.toLocaleDateString(lang, { month: "long", year: "numeric" });
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
  }, [filteredEvents, t, lang]);

  const getActionBadge = (action: TimelineActionType) => {
    if (action.includes("created")) {
      return {
        icon: PlusCircle,
        label: t.timeline.badgeCreation,
      };
    }
    if (action.includes("completed") || action === "issue_status_changed") {
      return {
        icon: CheckCircle2,
        label: t.timeline.badgeProgress,
      };
    }
    if (action.includes("deleted")) {
      return {
        icon: Trash2,
        label: t.timeline.badgeDeletion,
      };
    }
    if (action.includes("restored")) {
      return {
        icon: RotateCcw,
        label: t.timeline.badgeRestore,
      };
    }
    return {
      icon: Sparkles,
      label: t.timeline.badgeEdit,
    };
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `chrono-cronoprogramma-${Date.now()}.json`);
    a.click();
    addToast({ title: "Esportazione JSON", description: "File cronoprogramma scaricato con successo", type: "success" });
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "Data", "Autore", "Azione", "Entità", "ID", "Titolo", "Descrizione"];
    const rows = filteredEvents.map((e) => [
      e.timestamp,
      new Date(e.timestamp).toLocaleString(lang),
      `"${e.authorName}"`,
      e.action,
      e.entityType,
      e.entityIdentifier || e.entityId,
      `"${e.entityTitle.replace(/"/g, '""')}"`,
      `"${e.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const a = document.createElement("a");
    a.setAttribute("href", encodeURI(csvContent));
    a.setAttribute("download", `chrono-cronoprogramma-${Date.now()}.csv`);
    a.click();
    addToast({ title: "Esportazione CSV", description: "Report tabellare scaricato con successo", type: "success" });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] text-ink overflow-y-auto select-none">
      {/* Top Header Banner */}
      <div className="border-b border-white/5 bg-[#09090b] px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-semibold text-white tracking-tight">{t.timeline.title}</h1>
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-zinc-900 text-zinc-300 border border-white/10">
                  {workspace?.name || "Workspace"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {t.timeline.subtitle}
              </p>
            </div>
          </div>

          {/* Dedicated Custom Export Selector (CSV, JSON, Print) */}
          <TimelineExportDropdown
            t={t.timeline}
            onExportCSV={exportCSV}
            onExportJSON={exportJSON}
            onPrint={() => window.print()}
          />
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Metric Cards Row - Quiet & Monochromatic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/10 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-zinc-400">{t.timeline.metricEvents}</span>
              <span className="text-xl font-bold text-white font-mono">{stats.total}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-white/10 flex items-center justify-center text-zinc-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/10 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-zinc-400">{t.timeline.metricToday}</span>
              <span className="text-xl font-bold text-white font-mono">{stats.todayCount}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-white/10 flex items-center justify-center text-zinc-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/10 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-zinc-400">{t.timeline.metricCompletions}</span>
              <span className="text-xl font-bold text-white font-mono">{stats.completions}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-white/10 flex items-center justify-center text-zinc-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/10 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-zinc-400">{t.timeline.metricMembers}</span>
              <span className="text-xl font-bold text-white font-mono">{stats.authors}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-white/10 flex items-center justify-center text-zinc-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Filters & Mode Switcher Bar - Uniform h-8 Height Across All Controls */}
        <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm">
          {/* Search Input (Height h-8) */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca modifiche, issue, progetti, autore..."
              className="h-8 w-full bg-zinc-900/80 hover:bg-zinc-850 border border-white/10 focus:border-white/20 rounded-lg pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Controls: Custom Selectors and Button Groups All Exactly h-8 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Custom Entity Filter */}
            <LinearSelect
              options={entityOptions}
              value={selectedEntityType}
              onChange={setSelectedEntityType}
              size="md"
            />

            {/* Custom Project Filter */}
            <LinearSelect
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              size="md"
            />

            {/* Custom Author Filter */}
            <LinearSelect
              options={authorOptions}
              value={selectedAuthor}
              onChange={setSelectedAuthor}
              size="md"
            />

            {/* Date Range Segmented Buttons (Height h-8, matching selectors) */}
            <div className="flex items-center h-8 rounded-lg bg-zinc-900/80 border border-white/10 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDateRange("all")}
                className={cn(
                  "h-full px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  dateRange === "all"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                Tutto
              </button>
              <button
                type="button"
                onClick={() => setDateRange("7d")}
                className={cn(
                  "h-full px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  dateRange === "7d"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                7gg
              </button>
              <button
                type="button"
                onClick={() => setDateRange("30d")}
                className={cn(
                  "h-full px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  dateRange === "30d"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                30gg
              </button>
            </div>

            {/* View Mode Switcher (Roadmap vs Tabella) */}
            <div className="flex items-center h-8 rounded-lg bg-zinc-900/80 border border-white/10 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("visual")}
                className={cn(
                  "h-full px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                  viewMode === "visual"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Roadmap</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-full px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                  viewMode === "table"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Tabella</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {filteredEvents.length === 0 ? (
          <div className="p-16 rounded-xl bg-zinc-900/40 border border-white/10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Nessun evento storico trovato</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Non ci sono eventi che corrispondono ai filtri attuali. Prova a reimpostare i criteri di ricerca.
            </p>
          </div>
        ) : viewMode === "visual" ? (
          /* Visual Roadmap Mode */
          <div className="space-y-8">
            {groupedEvents.map((group) => (
              <div key={group.label} className="space-y-4">
                {/* Date Group Header */}
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 border border-white/10 text-zinc-300">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs font-mono text-zinc-500">{group.events.length} modifiche</span>
                </div>

                {/* Vertical Timeline Stream */}
                <div className="relative pl-8 space-y-4">
                  {/* Continuous Vertical Timeline Line */}
                  <div className="absolute left-[9px] top-0 bottom-0 w-[2px] bg-white/10" />

                  {group.events.map((evt) => {
                    const badge = getActionBadge(evt.action);
                    const Icon = badge.icon;
                    const dateObj = new Date(evt.timestamp);

                    return (
                      <div key={evt.id} className="relative group">
                        {/* Minimalist node on vertical line */}
                        <div className="absolute -left-8 top-4 w-4 h-4 rounded-full border border-white/20 bg-[#09090b] flex items-center justify-center z-10 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        </div>

                        {/* Card Content */}
                        <div className="p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/10 transition-all shadow-sm">
                          {/* Top Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <UserAvatar
                                name={evt.authorName}
                                avatarUrl={evt.authorAvatar || accounts.find((a) => a.name === evt.authorName || a.id === evt.authorId)?.avatarUrl}
                                size="xs"
                                className="w-5 h-5 rounded-[5px] text-[9px]"
                              />
                              <span className="text-xs font-semibold text-white">{evt.authorName}</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/10 bg-zinc-850 text-zinc-300 flex items-center gap-1">
                                <Icon className="w-3 h-3 text-zinc-400" />
                                <span>{badge.label}</span>
                              </span>

                              {evt.entityIdentifier && (
                                <span className="font-mono text-[11px] text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/10">
                                  {evt.entityIdentifier}
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-mono text-zinc-500">
                              {dateObj.toLocaleDateString("it-IT")} alle{" "}
                              {dateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div className="mb-2.5">
                            <h4 className="text-xs font-semibold text-white tracking-tight">{evt.entityTitle}</h4>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{evt.description}</p>
                          </div>

                          {/* Diff Box if present */}
                          {evt.diff && evt.diff.length > 0 && (
                            <div className="mb-3 p-2.5 rounded-lg bg-zinc-950/80 border border-white/10 flex flex-col gap-1.5 text-xs font-mono">
                              {evt.diff.map((d, dIdx) => (
                                <div key={dIdx} className="flex items-center gap-2">
                                  <span className="text-zinc-500">{d.label || d.field}:</span>
                                  <span className="line-through text-zinc-500">{String(d.oldValue)}</span>
                                  <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
                                  <span className="text-zinc-200 font-medium">{String(d.newValue)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Bottom Actions Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                            <span className="text-[11px] text-zinc-500 capitalize">
                              Entità: <strong className="text-zinc-300">{evt.entityType}</strong>
                            </span>

                            {evt.entityHref && (
                              <Link
                                href={evt.entityHref}
                                className="text-zinc-400 hover:text-white font-medium flex items-center gap-1 text-[11px] hover:underline underline-offset-2 transition-colors"
                              >
                                <span>Visualizza Dettagli</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Audit Log Table Mode */
          <div className="border border-white/10 rounded-xl bg-zinc-900/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/90 text-zinc-400 font-mono uppercase text-[10px]">
                    <th className="p-3.5 pl-5">Data & Ora</th>
                    <th className="p-3.5">Autore</th>
                    <th className="p-3.5">Azione</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Identificatore</th>
                    <th className="p-3.5">Descrizione & Modifica</th>
                    <th className="p-3.5 pr-5 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEvents.map((evt) => {
                    const badge = getActionBadge(evt.action);
                    const Icon = badge.icon;
                    const dateObj = new Date(evt.timestamp);

                    return (
                      <tr key={evt.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 pl-5 font-mono text-zinc-400 whitespace-nowrap">
                          {dateObj.toLocaleDateString("it-IT")}{" "}
                          <span className="text-white">
                            {dateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-medium text-white">
                          <div className="flex items-center gap-1.5">
                            <UserAvatar
                              name={evt.authorName}
                              avatarUrl={evt.authorAvatar || accounts.find((a) => a.name === evt.authorName || a.id === evt.authorId)?.avatarUrl}
                              size="xs"
                              className="w-4 h-4 rounded-[4px] text-[8px]"
                            />
                            <span>{evt.authorName}</span>
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/10 bg-zinc-850 text-zinc-300 inline-flex items-center gap-1">
                            <Icon className="w-3 h-3 text-zinc-400" />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-zinc-400 capitalize">
                          {evt.entityType}
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-mono font-medium text-zinc-300">
                          {evt.entityIdentifier || "-"}
                        </td>
                        <td className="p-3.5 text-zinc-300 leading-relaxed max-w-md">
                          <div className="font-semibold text-white truncate">{evt.entityTitle}</div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1">{evt.description}</div>
                        </td>
                        <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                          {evt.entityHref ? (
                            <Link
                              href={evt.entityHref}
                              className="text-zinc-300 hover:text-white hover:underline font-medium flex items-center justify-end gap-1"
                            >
                              <span>Apri</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-zinc-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
