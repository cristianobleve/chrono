"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Plus,
  ChevronRight,
  Box,
  UploadCloud,
  Sparkles,
  Calendar,
  Layers,
  Trash2,
  AlertTriangle,
  Clock,
  Search,
  LayoutGrid,
  List,
  Command,
  ChevronDown,
  ChevronUp,
  FolderPlus,
} from "lucide-react";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { SpotlightCard } from "@/components/ui/react-bits/SpotlightCard";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/userUtils";
import { ProjectCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n";

export const ProjectsListView: React.FC = () => {
  const {
    workspace,
    projects,
    issues,
    projectFolders,
    addProjectFolder,
    deleteProject,
    currentWorkspaceId,
    setActiveModal,
    currentUser,
    isWorkspaceLoading,
    supabaseStatus,
    getUserDisplayName,
  } = useLinearStore();
  const { t } = useTranslation();

  const isHydrated = useHydrated();
  const currentUserName = isHydrated ? getUserDisplayName(currentUser) : (currentUser.name || "User");

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOverviewBento, setShowOverviewBento] = useState<boolean>(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderModal, setShowFolderModal] = useState(false);

  // Filter projects by current workspace, status, folder and search query
  const filteredProjects = projects.filter((p) => {
    const projectWsId = p.workspaceId || "ws-1";
    if (projectWsId !== currentWorkspaceId) {
      return false;
    }
    if (filterStatus !== "all" && p.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (selectedFolderId !== "all") {
      if (p.folderId !== selectedFolderId && (p as any).category !== selectedFolderId) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSummary = p.summary?.toLowerCase().includes(q);
      const matchId = p.identifier?.toLowerCase().includes(q);
      if (!matchName && !matchSummary && !matchId) {
        return false;
      }
    }
    return true;
  });

  // Workspace stats for the Bento strip
  const workspaceProjects = projects.filter((p) => (p.workspaceId || "ws-1") === currentWorkspaceId);
  const workspaceProjectIds = new Set(workspaceProjects.map((p) => p.id));
  const workspaceIssues = issues.filter(
    (i) => (i.workspaceId || "ws-1") === currentWorkspaceId || (i.projectId && workspaceProjectIds.has(i.projectId))
  );
  const doneWorkspaceIssues = workspaceIssues.filter((i) => i.status === "done");
  const workspaceCompletionPct =
    workspaceIssues.length > 0 ? Math.round((doneWorkspaceIssues.length / workspaceIssues.length) * 100) : 0;
  const isInitialSyncing = supabaseStatus === "syncing" && projects.length === 0;

  const getDeadlineBadge = (targetDateStr?: string | null) => {
    if (!targetDateStr) return null;
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-red-950/40 border border-red-500/20 text-red-400 font-medium text-[10px] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span>{t.projectsList.expiredSince} {Math.abs(diffDays)}d</span>
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/20 text-amber-400 font-medium text-[10px] flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{t.projectsList.expirestoday}</span>
        </span>
      );
    }
    if (diffDays <= 3) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-950/30 border border-amber-500/20 text-amber-300 font-medium text-[10px] flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-300" />
          <span>{diffDays} {t.projectsList.daysLeft}</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 font-medium text-[10px] flex items-center gap-1">
        <Calendar className="w-3 h-3 text-emerald-400" />
        <span>{diffDays} {t.projectsList.daysLeft}</span>
      </span>
    );
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addProjectFolder({
      name: newFolderName.trim(),
      color: "#5e6ad2",
    });
    setNewFolderName("");
    setShowFolderModal(false);
  };

  return (
    <div className="flex-1 w-full px-4 sm:px-6 md:px-10 lg:px-12 py-6 sm:py-8 flex flex-col gap-6 select-none text-ink pb-24 relative overflow-x-hidden bg-[#09090b]">
      {/* Loading State */}
      {isWorkspaceLoading || isInitialSyncing ? (
        <div className="flex flex-col gap-6 relative z-10 animate-fade-in" aria-busy="true">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="w-40 h-7 rounded-lg" />
              <Skeleton className="w-64 h-3 rounded-md" />
            </div>
            <Skeleton className="w-32 h-9 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28 rounded-[16px]" />
            <Skeleton className="h-28 rounded-[16px]" />
            <Skeleton className="h-28 rounded-[16px]" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-32 h-6 rounded-md" />
            <Skeleton className="w-56 h-9 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 relative z-10 animate-fade-in">
          {/* Top Bento Overview Strip (Compact, Floating, Collapsible) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {t.projectsList.workspaceOverview}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                  {workspace.name}
                </span>
              </div>
              <button
                onClick={() => setShowOverviewBento(!showOverviewBento)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{showOverviewBento ? t.projectsList.collapse : t.projectsList.expand}</span>
                {showOverviewBento ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showOverviewBento && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bento Card 1: Workspace Health & Pulse */}
                <div className="rounded-[12px] bg-zinc-900/40 border border-white/5 p-4 flex flex-col justify-between gap-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">{t.projectsList.progressStatus}</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-bold text-white tracking-tight">{workspaceCompletionPct}%</span>
                      <span className="text-xs text-zinc-400 font-mono">
                        {doneWorkspaceIssues.length}/{workspaceIssues.length} issue
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${workspaceCompletionPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1 border-t border-white/5">
                    <span>{workspaceProjects.length} {t.projectsList.activeProjects}</span>
                    <span>•</span>
                    <span>{workspaceIssues.length - doneWorkspaceIssues.length} {t.projectsList.pending}</span>
                  </div>
                </div>

                {/* Bento Card 2: Quick Actions Hub */}
                <div className="rounded-[12px] bg-zinc-900/40 border border-white/5 p-4 flex flex-col justify-between gap-3 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-zinc-300">{t.projectsList.quickActions}</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setActiveModal("new_project")}
                      className="p-2.5 rounded-[8px] bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 text-white flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group"
                    >
                      <Box className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-[11px] font-medium leading-tight">{t.projectsList.newProject}</span>
                    </button>
                    <button
                      onClick={() => setActiveModal("import_project")}
                      className="p-2.5 rounded-[8px] bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 text-white flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group"
                    >
                      <UploadCloud className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-[11px] font-medium leading-tight">{t.projectsList.importMd}</span>
                    </button>
                    <Link
                      href="/agent"
                      className="p-2.5 rounded-[8px] bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 text-white flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group"
                    >
                      <Sparkles className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-[11px] font-medium leading-tight">{t.projectsList.aiAgent}</span>
                    </Link>
                  </div>
                  <span className="text-[11px] text-zinc-500 truncate">
                    {t.projectsList.quickActionsSubtitle}
                  </span>
                </div>

                {/* Bento Card 3: Team Lead & Launchers */}
                <div className="rounded-[12px] bg-zinc-900/40 border border-white/5 p-4 flex flex-col justify-between gap-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">{t.projectsList.activeSession}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Chrono Core</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-zinc-800 border border-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span suppressHydrationWarning className="text-xs font-bold text-white truncate">
                        {currentUserName}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        {currentUser.email || "Workspace Lead"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <button
                      onClick={() => setActiveModal("new_issue")}
                      className="flex-1 py-1.5 rounded-[6px] bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-white text-xs font-semibold transition-colors text-center cursor-pointer"
                    >
                      + Issue
                    </button>
                    <button
                      onClick={() => setActiveModal("command_menu")}
                      className="flex-1 py-1.5 rounded-[6px] bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-zinc-300 text-xs font-medium transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Command className="w-3 h-3 text-zinc-400" />
                      <span>Cmd+K</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Toolbar: Search, Filters, Folders and View Toggle */}
          <div className="flex flex-col gap-3.5 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Title & Count */}
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {t.projects.title}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-[6px] bg-zinc-900 border border-white/10 text-zinc-400">
                  {filteredProjects.length}
                </span>
              </div>

              {/* Right Toolbar Actions: Search, View Toggle, Create Button */}
              <div className="flex w-full sm:w-auto items-center gap-2.5 flex-wrap">
                {/* Search Bar */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.common.search}
                    className="pl-8 pr-3 py-2 rounded-[8px] bg-zinc-900/90 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all w-full sm:w-56"
                  />
                </div>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="flex items-center p-0.5 rounded-[8px] bg-zinc-900 border border-white/10">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded-[6px] text-xs transition-colors cursor-pointer",
                      viewMode === "grid" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                    title="Grid"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 rounded-[6px] text-xs transition-colors cursor-pointer",
                      viewMode === "list" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                    title="List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={() => setActiveModal("new_project")}
                  className="px-3.5 py-1.5 rounded-[8px] bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.projects.newProject}</span>
                </button>
              </div>
            </div>

            {/* Filter Pills and Folder Tabs Row (Clean breathing room, NO separator line) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Folder Collections */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedFolderId("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-[8px] text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                    selectedFolderId === "all"
                      ? "bg-zinc-800 text-white shadow-sm border border-white/10"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white border border-transparent"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.projectsList.allLists}</span>
                </button>

                {projectFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                      selectedFolderId === folder.id
                        ? "bg-zinc-800 text-white shadow-sm border border-white/10"
                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white border border-transparent"
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: folder.color || "#71717a" }}
                    />
                    <span>{folder.name}</span>
                  </button>
                ))}

                <button
                  onClick={() => setShowFolderModal(true)}
                  className="px-2.5 py-1.5 rounded-[8px] bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/5 text-zinc-400 hover:text-white text-xs font-semibold shrink-0 transition-all flex items-center gap-1 cursor-pointer"
                  title={t.projectsList.newList}
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>{t.projectsList.newList}</span>
                </button>
              </div>

              {/* Status Filters: EQUAL AND FIXED WIDTH TABS (Never resize or shift) */}
              <div className="grid grid-cols-4 w-full sm:w-80 h-8 p-0.5 rounded-[8px] bg-zinc-900/90 border border-white/10 shrink-0 self-start sm:self-auto">
                {[
                  { key: "all", label: t.projects.all },
                  { key: "Planned", label: t.projects.planned },
                  { key: "In Progress", label: t.projects.inProgress },
                  { key: "Completed", label: t.projects.completed },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setFilterStatus(st.key)}
                    className={cn(
                      "w-full h-full flex items-center justify-center text-center rounded-[6px] text-xs font-medium transition-all cursor-pointer truncate",
                      filterStatus.toLowerCase() === st.key.toLowerCase()
                        ? "bg-zinc-800 text-white shadow-sm border border-white/10"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Folder creation inline input */}
            {showFolderModal && (
              <div className="p-3 rounded-[10px] bg-zinc-900 border border-white/10 flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  placeholder={t.projectsList.newListPlaceholder}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  autoFocus
                  className="flex-1 bg-transparent text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-3 py-1 rounded-[6px] bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 cursor-pointer"
                >
                  {t.projectsList.create}
                </button>
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="px-2.5 py-1 text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  {t.common.cancel}
                </button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 rounded-[14px] bg-zinc-950/60 border border-white/5 flex flex-col items-center justify-center text-center gap-3.5 shadow-inner">
              <div className="w-12 h-12 rounded-[10px] bg-zinc-900 border border-white/10 flex items-center justify-center text-primary shadow-sm">
                <Box className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-white">
                  {searchQuery ? t.projectsList.noProjectsFound : t.projectsList.noProjectsWorkspace}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  {searchQuery
                    ? t.projectsList.noSearchResults
                    : t.projects.noProjectsFound}
                </p>
              </div>
              <div className="flex items-center gap-2.5 mt-2 flex-wrap justify-center">
                <button
                  onClick={() => setActiveModal("new_project")}
                  className="px-4 py-2 rounded-[8px] bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.projectsList.createNew}</span>
                </button>
                <button
                  onClick={() => setActiveModal("import_project")}
                  className="px-4 py-2 rounded-[8px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-zinc-400" />
                  <span>{t.projectsList.importFromMarkdown}</span>
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* =========================================================================
               PLANE-STYLE GRID VIEW (Refined: No notch on gradient, isolated trash, crisp radius)
               ========================================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const projIssues = issues.filter((i) => i.projectId === proj.id);
                const doneIssues = projIssues.filter((i) => i.status === "done");
                const totalIssues = projIssues.length;
                const issuesPct = totalIssues > 0 ? Math.round((doneIssues.length / totalIssues) * 100) : 0;

                const projMilestones = proj.milestones || [];
                const doneMilestones = projMilestones.filter((m) => m.completed);
                const totalMilestones = projMilestones.length;
                const milestonesPct =
                  totalMilestones > 0 ? Math.round((doneMilestones.length / totalMilestones) * 100) : 0;

                const totalItems = totalMilestones + totalIssues;
                const doneItems = doneMilestones.length + doneIssues.length;
                const overallPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

                // Subtle architectural fallback gradient if no cover image
                const fallbackGradient =
                  proj.coverGradient ||
                  `radial-gradient(ellipse at top left, ${proj.iconBg || "#1f1f23"} 0%, #09090b 100%)`;

                return (
                  <Link key={proj.id} href={`/project/${proj.slug}`} className="block">
                    <div className="group rounded-[12px] bg-[#0c0d0e] border border-white/5 hover:border-white/15 transition-shadow duration-200 overflow-hidden flex flex-col hover:shadow-2xl relative cursor-pointer h-full">
                      {/* 1. Cover Header with Smooth Ambient Dissolve */}
                      <div className="h-36 w-full relative overflow-hidden bg-[#0c0d0e] shrink-0">
                        {proj.coverUrl ? (
                          <img
                            src={proj.coverUrl}
                            alt={proj.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full" style={{ background: fallbackGradient }} />
                        )}

                        {/* Gradiente inferiore per dissolvenza sulla superficie della card */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-[#0c0d0e]/55 to-transparent pointer-events-none" />

                        {/* Top-left: Identifier Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <InternalIdBadge
                            id={proj.identifier || "PRJ"}
                            internalId={proj.internalId || proj.id}
                            size="xs"
                          />
                        </div>

                        {/* Top-right: Trash Action */}
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteProject(proj.id);
                            }}
                            className="p-1.5 rounded-[6px] bg-black/60 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-400 hover:bg-red-950/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title={t.projectsList.moveToTrash}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 2. Floating Overhang Icon */}
                      <div className="-mt-6 px-4 relative z-10">
                        <ProjectIconBadge
                          project={proj}
                          size="md"
                          className="ring-4 ring-[#0c0d0e] rounded-[10px] shadow-xl"
                        />
                      </div>

                      {/* 3. Project Identity, Status Badges & Summary */}
                      <div className="p-4 pt-2.5 flex flex-col gap-2 flex-1">
                        <h3 className="text-[15px] font-bold text-white group-hover:text-white transition-colors truncate">
                          {proj.name}
                        </h3>

                        {/* Status, Priority & Deadline Badges (Cleanly placed in body) */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-zinc-900 border border-white/10 text-[11px] text-zinc-300">
                            <StatusIcon status={proj.status} />
                            <span>{proj.status}</span>
                          </div>

                          <div
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] bg-zinc-900/80 border border-white/10 text-[11px] text-zinc-400"
                            title={`${t.common.priority}: ${proj.priority}`}
                          >
                            <PriorityIcon priority={proj.priority} />
                            <span className="capitalize">{proj.priority}</span>
                          </div>

                          {proj.targetDate && getDeadlineBadge(proj.targetDate)}
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed min-h-[32px] mt-0.5">
                          {proj.summary || proj.description || t.projectsList.noSummary}
                        </p>
                      </div>

                      {/* 4. Footer: Progress Track & Counts */}
                      <div className="p-4 pt-3 border-t border-white/5 mt-auto flex flex-col gap-2 text-xs text-zinc-400 bg-zinc-950/30">
                        {/* Dual Split Track: Milestones (Green) + Issues (Blue) */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex items-center gap-1.5">
                            {/* Milestones Track */}
                            <div
                              className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden"
                              title={`Milestones completate: ${doneMilestones.length}/${totalMilestones} (${milestonesPct}%)`}
                            >
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                style={{ width: `${milestonesPct}%` }}
                              />
                            </div>

                            {/* Issues Track */}
                            <div
                              className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden"
                              title={`Issue completate: ${doneIssues.length}/${totalIssues} (${issuesPct}%)`}
                            >
                              <div
                                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                                style={{ width: `${issuesPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Overall Percentage */}
                          <span
                            className="text-[11px] font-bold text-zinc-300 font-mono w-8 text-right shrink-0"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {overallPct}%
                          </span>
                        </div>

                        {/* Counts Meta */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>
                            {doneMilestones.length}/{totalMilestones} Milestones
                          </span>
                          <span>
                            {doneIssues.length}/{totalIssues} Issues
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* =========================================================================
               LIST VIEW (Full-width dense horizontal cards with crisp radius)
               ========================================================================= */
            <div className="flex flex-col gap-3">
              {filteredProjects.map((proj) => {
                const projIssues = issues.filter((i) => i.projectId === proj.id);
                const doneIssues = projIssues.filter((i) => i.status === "done");
                const totalIssues = projIssues.length;
                const issuesPct = totalIssues > 0 ? Math.round((doneIssues.length / totalIssues) * 100) : 0;

                const projMilestones = proj.milestones || [];
                const doneMilestones = projMilestones.filter((m) => m.completed);
                const totalMilestones = projMilestones.length;
                const milestonesPct =
                  totalMilestones > 0 ? Math.round((doneMilestones.length / totalMilestones) * 100) : 0;

                const totalItems = totalMilestones + totalIssues;
                const doneItems = doneMilestones.length + doneIssues.length;
                const overallPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

                return (
                  <Link key={proj.id} href={`/project/${proj.slug}`}>
                    <SpotlightCard className="p-4 rounded-[12px] flex flex-col gap-3.5 group cursor-pointer shadow-lg">
                      <div className="flex items-start justify-between gap-4 pb-1">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <ProjectIconBadge project={proj} size="md" className="rounded-[8px]" />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <InternalIdBadge
                                id={proj.identifier || "PRJ"}
                                internalId={proj.internalId || proj.id}
                                size="xs"
                              />
                              <span className="font-bold text-white text-sm group-hover:text-primary transition-colors truncate">
                                {proj.name}
                              </span>
                              <StatusIcon status={proj.status} />
                              <span className="text-[11px] text-zinc-500">{proj.status}</span>
                              {getDeadlineBadge(proj.targetDate)}
                            </div>
                            {proj.summary && (
                              <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{proj.summary}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <PriorityIcon priority={proj.priority} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteProject(proj.id);
                            }}
                            className="p-1.5 rounded-[6px] text-zinc-500 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title={t.projectsList.moveToTrash}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      {/* Progress Bar & Metadata */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                        <div className="flex items-center gap-3 w-52 sm:w-60">
                          <div className="flex-1 flex items-center gap-1.5">
                            <div
                              className="h-1.5 flex-1 rounded-full bg-zinc-800/90 overflow-hidden"
                              title={`Milestone completate: ${doneMilestones.length}/${totalMilestones} (${milestonesPct}%)`}
                            >
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                style={{ width: `${milestonesPct}%` }}
                              />
                            </div>
                            <div
                              className="h-1.5 flex-1 rounded-full bg-zinc-800/90 overflow-hidden"
                              title={`Issue completate: ${doneIssues.length}/${totalIssues} (${issuesPct}%)`}
                            >
                              <div
                                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                                style={{ width: `${issuesPct}%` }}
                              />
                            </div>
                          </div>

                          <span
                            className="text-[11px] font-bold text-zinc-300 w-8 text-right font-mono shrink-0"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {overallPct}%
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                          <span>
                            {doneMilestones.length}/{totalMilestones} Milestones
                          </span>
                          <span>
                            {doneIssues.length}/{totalIssues} Issues
                          </span>
                          {proj.targetDate && (
                            <span className="flex items-center gap-1 font-sans font-medium">
                              <Calendar className="w-3 h-3" />
                              {formatDate(proj.targetDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

