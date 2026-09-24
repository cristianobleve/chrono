"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { Issue, EisenhowerQuadrant, IssuePriority } from "@/types";
import {
  Grid2X2,
  Plus,
  Flame,
  Calendar,
  Users,
  Trash2,
  CheckCircle2,
  Circle,
  Box,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { cn } from "@/lib/utils";

interface QuadrantDef {
  key: EisenhowerQuadrant;
  title: string;
  subtitle: string;
  action: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  defaultPriority: IssuePriority;
}

const QUADRANTS: QuadrantDef[] = [
  {
    key: "q1",
    title: "Urgente & Importante",
    subtitle: "Crisi, scadenze imminenti e blocchi critici",
    action: "FAI SUBITO",
    color: "#f87171",
    bgColor: "bg-red-950/15",
    borderColor: "border-red-500/20 hover:border-red-500/30",
    icon: <Flame className="w-4 h-4 text-red-400" />,
    defaultPriority: "urgent",
  },
  {
    key: "q2",
    title: "Importante ma non urgente",
    subtitle: "Visione, architettura, crescita e pianificazione",
    action: "PIANIFICA",
    color: "#d4d4d8",
    bgColor: "bg-zinc-900/30",
    borderColor: "border-white/10 hover:border-white/20",
    icon: <Calendar className="w-4 h-4 text-zinc-300" />,
    defaultPriority: "high",
  },
  {
    key: "q3",
    title: "Urgente ma non importante",
    subtitle: "Interruzioni, richieste immediate, task operative",
    action: "DELEGA",
    color: "#fbbf24",
    bgColor: "bg-amber-950/15",
    borderColor: "border-amber-500/20 hover:border-amber-500/30",
    icon: <Users className="w-4 h-4 text-amber-400" />,
    defaultPriority: "medium",
  },
  {
    key: "q4",
    title: "Non urgente & non importante",
    subtitle: "Attività a basso valore, distrazioni, backlog",
    action: "ELIMINA / ARCHIVIA",
    color: "#94a3b8",
    bgColor: "bg-zinc-900/20",
    borderColor: "border-white/10 hover:border-white/20",
    icon: <Trash2 className="w-4 h-4 text-zinc-400" />,
    defaultPriority: "low",
  },
];

export const EisenhowerMatrixView: React.FC = () => {
  const {
    issues,
    createIssue,
    moveIssueToQuadrant,
    moveIssueToStatus,
    setSelectedIssueId,
    projects,
    addToast,
  } = useLinearStore();

  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [activeInputQuadrant, setActiveInputQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  const handleCreateInQuadrant = (quadrant: EisenhowerQuadrant, priority: IssuePriority) => {
    if (!quickTitle.trim()) return;

    createIssue({
      title: quickTitle.trim(),
      priority,
      status: "todo",
      eisenhowerQuadrant: quadrant,
    });

    setQuickTitle("");
    setActiveInputQuadrant(null);
    addToast({
      title: "Task aggiunta al quadrante",
      description: quickTitle.trim(),
      type: "success",
    });
  };

  const handleDropOnQuadrant = (quadrant: EisenhowerQuadrant) => {
    if (!draggedIssueId) return;
    moveIssueToQuadrant(draggedIssueId, quadrant);
    setDragOverQuadrant(null);
    setDraggedIssueId(null);
  };

  // Helper to map issue to quadrant (fallback based on priority if not explicitly set)
  const getQuadrantIssues = (quadrantKey: EisenhowerQuadrant) => {
    return issues.filter((i) => {
      if (i.status === "done" || i.status === "canceled") return false;
      if (i.eisenhowerQuadrant) return i.eisenhowerQuadrant === quadrantKey;

      // Fallback heuristics:
      if (quadrantKey === "q1") return i.priority === "urgent";
      if (quadrantKey === "q2") return i.priority === "high";
      if (quadrantKey === "q3") return i.priority === "medium";
      if (quadrantKey === "q4") return i.priority === "low" || i.priority === "none";
      return false;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black select-none text-ink pb-16 overflow-hidden p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <Grid2X2 className="w-5 h-5 text-zinc-400" />
            <span>Matrice di Eisenhower</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Trascina le task tra i 4 quadranti per definire subito cosa fare, pianificare, delegare o eliminare.
          </p>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4 min-h-0">
        {QUADRANTS.map((quad) => {
          const quadIssues = getQuadrantIssues(quad.key);
          const isDragOver = dragOverQuadrant === quad.key;
          const isInputActive = activeInputQuadrant === quad.key;

          return (
            <div
              key={quad.key}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverQuadrant !== quad.key) setDragOverQuadrant(quad.key);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverQuadrant(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnQuadrant(quad.key);
              }}
              className={cn(
                "p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-xl",
                quad.bgColor,
                quad.borderColor,
                isDragOver && "ring-1 ring-white/40 bg-zinc-900/60"
              )}
            >
              {/* Quadrant Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  {quad.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-heading">
                        {quad.title}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/10 border border-white/10 text-white">
                        {quadIssues.length}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
                      {quad.action}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveInputQuadrant(isInputActive ? null : quad.key)}
                  className="p-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Aggiungi task in questo quadrante"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Input Row if active */}
              {isInputActive && (
                <div className="mt-2.5 p-2 rounded-lg bg-zinc-950 border border-white/10 flex items-center gap-2 shrink-0 animate-fade-in">
                  <input
                    type="text"
                    placeholder={`Nuova task in ${quad.action}...`}
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateInQuadrant(quad.key, quad.defaultPriority)
                    }
                    autoFocus
                    className="flex-1 bg-transparent text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCreateInQuadrant(quad.key, quad.defaultPriority)}
                    className="px-3 py-1 rounded-md bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    Aggiungi
                  </button>
                </div>
              )}

              {/* Task Items List */}
              <div className="flex-1 overflow-y-auto my-2.5 flex flex-col gap-2 min-h-0 pr-1">
                {quadIssues.map((issue) => {
                  const proj = projects.find((p) => p.id === issue.projectId);
                  const isBeingDragged = draggedIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", issue.id);
                        setDraggedIssueId(issue.id);
                      }}
                      onDragEnd={() => {
                        setDraggedIssueId(null);
                        setDragOverQuadrant(null);
                      }}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={cn(
                        "p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/60 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 group cursor-grab active:cursor-grabbing shadow-sm",
                        isBeingDragged && "opacity-40 border-dashed border-primary"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveIssueToStatus(issue.id, "done");
                          }}
                          className="text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <Circle className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <InternalIdBadge id={issue.identifier} size="xs" />
                            <span className="text-xs font-medium text-white truncate group-hover:text-white transition-colors">
                              {issue.title}
                            </span>
                          </div>

                          {proj && (
                            <span className="text-[10px] text-zinc-500 truncate mt-0.5">
                              {proj.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <PriorityIcon priority={issue.priority} />
                    </div>
                  );
                })}

                {quadIssues.length === 0 && (
                  <div
                    className={cn(
                      "flex-1 border border-dashed rounded-lg p-6 text-center text-xs flex flex-col items-center justify-center gap-1 transition-colors",
                      isDragOver
                        ? "border-white/40 bg-white/5 text-white font-medium"
                        : "border-white/10 text-zinc-500 opacity-40"
                    )}
                  >
                    <span>Trascina le task qui</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
