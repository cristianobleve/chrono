"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { Issue, IssueStatus, Priority } from "@/types";
import {
  List,
  Kanban,
  Plus,
  Box,
  CheckCircle2,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export const IssuesHubView: React.FC = () => {
  const {
    issues,
    updateIssue,
    moveIssueToStatus,
    deleteIssue,
    currentWorkspaceId,
    setActiveModal,
    setSelectedIssueId,
    projects,
    team,
  } = useLinearStore();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<IssueStatus | null>(null);

  const statuses: { key: IssueStatus; label: string }[] = [
    { key: "backlog", label: t.issues.backlog },
    { key: "todo", label: t.issues.todo },
    { key: "in_progress", label: t.issues.inProgress },
    { key: "done", label: t.issues.done },
    { key: "canceled", label: t.issues.canceled },
  ];

  const workspaceProjects = projects.filter(
    (p) => currentWorkspaceId && p.workspaceId === currentWorkspaceId
  );

  const projectOptions: SelectOption[] = [
    { value: "all", label: t.projects.all, icon: <Box className="w-3.5 h-3.5 text-ink-tertiary" /> },
    ...workspaceProjects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: <Box className="w-3.5 h-3.5 text-zinc-400" />,
    })),
  ];

  const priorityOptions: SelectOption[] = [
    { value: "all", label: t.common.all },
    { value: "urgent", label: t.issues.urgent, icon: <PriorityIcon priority="urgent" /> },
    { value: "high", label: t.issues.high, icon: <PriorityIcon priority="high" /> },
    { value: "medium", label: t.issues.medium, icon: <PriorityIcon priority="medium" /> },
    { value: "low", label: t.issues.low, icon: <PriorityIcon priority="low" /> },
    { value: "none", label: t.common.priority, icon: <PriorityIcon priority="none" /> },
  ];

  const filteredIssues = issues.filter((issue) => {
    // Strict Workspace Isolation
    if (!currentWorkspaceId || issue.workspaceId !== currentWorkspaceId) return false;
    if (filterPriority !== "all" && issue.priority !== filterPriority) return false;
    if (filterProject !== "all" && issue.projectId !== filterProject) return false;
    return true;
  });

  const handleMoveStatus = (issueId: string, newStatus: IssueStatus) => {
    updateIssue(issueId, { status: newStatus });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] select-none text-ink pb-20">
      {/* Header filter bar (Full Width) */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 shrink-0 bg-[#09090b]">
        <div className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer",
                viewMode === "list" ? "bg-zinc-800 text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-white"
              )}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer",
                viewMode === "board" ? "bg-zinc-800 text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-white"
              )}
              title="Board view"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
          </div>

          <div className="hidden sm:block h-4 w-px bg-white/5" />

          {/* Filter by project */}
          <LinearSelect
            options={projectOptions}
            value={filterProject}
            onChange={setFilterProject}
            size="sm"
          />

          {/* Filter by priority */}
          <LinearSelect
            options={priorityOptions}
            value={filterPriority}
            onChange={setFilterPriority}
            size="sm"
          />
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <button
            onClick={() => setActiveModal("new_issue")}
            className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-[10px] text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.issues.newIssue}</span>
            <span className="kbd-shortcut bg-zinc-200 border-zinc-300 text-zinc-950 text-[9px] ml-1">
              C
            </span>
          </button>
        </div>
      </div>

      {/* Main Content: List or Board - Full Width */}
      {viewMode === "list" ? (
        /* Grouped List View */
        <div className="flex-1 w-full px-4 sm:px-6 md:px-10 lg:px-12 py-6">
          <div className="flex flex-col gap-6">
            {statuses.map((st) => {
              const groupIssues = filteredIssues.filter((i) => i.status === st.key);

              return (
                <div key={st.key} className="rounded-[16px] bg-zinc-900/60 border border-white/5 flex flex-col overflow-hidden shadow-lg">
                  {/* Group Header */}
                  <div className="h-11 px-5 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2.5">
                      <StatusIcon status={st.key} />
                      <span className="font-bold text-white text-xs">{st.label}</span>
                      <span
                        className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {groupIssues.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveModal("new_issue")}
                      className="p-1 hover:text-white rounded text-zinc-500 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Group Rows */}
                  {groupIssues.length === 0 ? (
                    <div className="px-6 py-4 text-xs text-zinc-500 italic">
                      Nessuna issue in stato {st.label}
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {groupIssues.map((issue) => {
                        const proj = projects.find((p) => p.id === issue.projectId);

                        return (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className="h-12 min-w-0 px-4 sm:px-5 flex items-center justify-between hover:bg-zinc-800/40 transition-colors text-xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1 overflow-hidden">
                              {/* Priority */}
                              <PriorityIcon priority={issue.priority} />

                              {/* Internal ID Badge */}
                              <InternalIdBadge
                                id={issue.identifier}
                                internalId={issue.internalId || issue.id}
                                size="xs"
                              />

                              {/* Title */}
                              <span className="text-white font-medium truncate group-hover:text-white transition-colors">
                                {issue.title}
                              </span>

                              {/* Labels */}
                              {issue.labels && issue.labels.length > 0 && (
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                  {issue.labels.map((lbl, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400 border border-white/5"
                                    >
                                      {lbl}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right attributes */}
                            <div className="flex items-center gap-4 shrink-0 text-xs text-zinc-400">
                              {/* Project tag */}
                              {proj && (
                                <span className="hidden md:flex items-center gap-1 text-[11px] text-zinc-500">
                                  <Box className="w-3 h-3 text-zinc-400" />
                                  <span className="truncate max-w-[120px]">{proj.name}</span>
                                </span>
                              )}

                              {/* Assignee Avatar */}
                              <div className="w-6 h-6 rounded-[8px] bg-zinc-800 text-white border border-white/10 flex items-center justify-center text-[10px] font-bold">
                                CB
                              </div>

                              {/* Status cycle button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus =
                                    st.key === "backlog"
                                      ? "todo"
                                      : st.key === "todo"
                                      ? "in_progress"
                                      : st.key === "in_progress"
                                      ? "done"
                                      : "todo";
                                  handleMoveStatus(issue.id, nextStatus);
                                }}
                                className="p-1 hover:text-white text-zinc-500 cursor-pointer"
                                title="Avanza stato"
                              >
                                <StatusIcon status={issue.status} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Board / Kanban View with Interactive Drag & Drop */
        <div className="flex-1 w-full px-6 md:px-10 lg:px-12 py-6 overflow-x-auto flex gap-5 bg-[#09090b]">
          {statuses.map((st) => {
            const colIssues = filteredIssues.filter((i) => i.status === st.key);
            const isDragOver = dragOverCol === st.key;

            return (
              <div
                key={st.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverCol !== st.key) setDragOverCol(st.key);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const issueId = e.dataTransfer.getData("text/plain") || draggedIssueId;
                  if (issueId) {
                    moveIssueToStatus(issueId, st.key);
                  }
                  setDragOverCol(null);
                  setDraggedIssueId(null);
                }}
                className={cn(
                  "w-80 flex flex-col bg-zinc-900/40 border rounded-[16px] overflow-hidden shrink-0 max-h-full shadow-xl transition-all duration-200",
                  isDragOver
                    ? "border-primary ring-2 ring-primary/40 bg-zinc-900/80"
                    : "border-white/5"
                )}
              >
                {/* Column Header */}
                <div className="h-11 px-4 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/80">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={st.key} />
                    <span className="font-bold text-white text-xs">{st.label}</span>
                    <span
                      className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {colIssues.length}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveModal("new_issue")}
                    className="p-1 hover:text-white text-zinc-500 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Cards List */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-[140px]">
                  {colIssues.map((issue) => {
                    const proj = projects.find((p) => p.id === issue.projectId);
                    const isBeingDragged = draggedIssueId === issue.id;

                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", issue.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedIssueId(issue.id);
                        }}
                        onDragEnd={() => {
                          setDraggedIssueId(null);
                          setDragOverCol(null);
                        }}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={cn(
                          "p-4 rounded-[14px] bg-zinc-900/80 hover:bg-zinc-850 border border-white/5 hover:border-white/15 transition-all shadow-md flex flex-col gap-2.5 group cursor-grab active:cursor-grabbing",
                          isBeingDragged && "opacity-40 border-dashed border-primary scale-95"
                        )}
                      >
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <InternalIdBadge
                            id={issue.identifier}
                            internalId={issue.internalId || issue.id}
                            size="xs"
                          />
                          <PriorityIcon priority={issue.priority} />
                        </div>

                        <span className="text-xs font-semibold text-white leading-snug group-hover:text-white transition-colors">
                          {issue.title}
                        </span>

                        {proj && (
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Box className="w-3 h-3 text-zinc-400" />
                            <span className="truncate">{proj.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                          {issue.labels && issue.labels.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-zinc-800 text-zinc-400 border border-white/5">
                              {issue.labels[0]}
                            </span>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center gap-2">
                            {st.key !== "done" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveIssueToStatus(issue.id, "done");
                                }}
                                className="text-[10px] text-zinc-500 hover:text-emerald-400 cursor-pointer"
                                title="Segna come completato"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <div className="w-6 h-6 rounded-[8px] bg-zinc-800 text-white border border-white/10 flex items-center justify-center text-[10px] font-bold">
                              CB
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colIssues.length === 0 && (
                    <div
                      className={cn(
                        "flex-1 border border-dashed rounded-[14px] p-6 text-center text-xs flex flex-col items-center justify-center gap-1.5 transition-colors",
                        isDragOver
                          ? "border-white/40 bg-white/5 text-white font-semibold"
                          : "border-white/10 text-zinc-500"
                      )}
                    >
                      <span>Trascina una task qui</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
