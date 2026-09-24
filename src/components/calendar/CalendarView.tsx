"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { Issue, IssuePriority, IssueStatus } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Box,
  Layers,
  Sparkles,
  Filter,
} from "lucide-react";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export const CalendarView: React.FC = () => {
  const {
    issues,
    createIssue,
    updateIssue,
    moveIssueToStatus,
    setSelectedIssueId,
    projects,
    addToast,
    preferences,
  } = useLinearStore();

  const isSundayFirst = preferences?.firstDayOfWeek === "sunday";
  const dayNames = isSundayFirst
    ? ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
    : ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 31)); // August 2026
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-08-31");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<IssuePriority>("high");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month & days in month
  // In JS Date: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Adjust startingDay according to preferred first day of week
  const startingDay = isSundayFirst
    ? firstDayIndex
    : (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  const handleCreateTaskForDate = (dateStr: string) => {
    if (!quickTitle.trim()) return;

    createIssue({
      title: quickTitle.trim(),
      dueDate: dateStr,
      priority: quickPriority,
      status: "todo",
      projectId: filterProject !== "all" ? filterProject : null,
    });

    setQuickTitle("");
    addToast({
      title: "Task aggiunta al calendario",
      description: `${quickTitle} • ${dateStr}`,
      type: "success",
    });
  };

  const handleDropOnDate = (dateStr: string) => {
    if (!draggedIssueId) return;
    updateIssue(draggedIssueId, { dueDate: dateStr });
    addToast({
      title: "Data di scadenza aggiornata",
      description: `Task spostata al ${dateStr}`,
      type: "info",
    });
    setDraggedIssueId(null);
  };

  // Build 42 grid cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startingDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = prevMonthDate.toISOString().split("T")[0];
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const currentMonthDate = new Date(year, month, i);
    const dateStr = currentMonthDate.toISOString().split("T")[0];
    calendarCells.push({
      day: i,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // Next month leading days
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = nextMonthDate.toISOString().split("T")[0];
    calendarCells.push({
      day: i,
      dateStr,
      isCurrentMonth: false,
    });
  }

  const projectOptions: SelectOption[] = [
    {
      value: "all",
      label: "Tutti i Progetti",
      icon: <Box className="w-3.5 h-3.5 text-ink-tertiary" />,
    },
    ...projects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: <Box className="w-3.5 h-3.5 text-zinc-400" />,
    })),
  ];

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="flex-1 flex min-w-0 flex-col h-full bg-black select-none text-ink pb-16 overflow-hidden">
      {/* Calendar Header / Action Toolbar */}
      <div className="w-full px-4 sm:px-6 md:px-10 py-3.5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-zinc-950 shrink-0">
        <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-850 text-white border border-white/10 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight font-heading">
              {MONTH_NAMES[month]} {year}
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900/60 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Mese precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Oggi
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Mese successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter by project */}
        <div className="flex items-center gap-2">
          <LinearSelect
            options={projectOptions}
            value={filterProject}
            onChange={setFilterProject}
            size="sm"
          />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex min-w-0 flex-col p-2 sm:p-4 md:p-6 overflow-hidden min-h-0">
        {/* Day Name Columns */}
        <div suppressHydrationWarning className="grid grid-cols-7 gap-px mb-2 text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          {dayNames.map((name, i) => (
            <div key={i} className="py-1">
              {name}
            </div>
          ))}
        </div>

        {/* 42 Calendar Cells Grid */}
        <div suppressHydrationWarning className="flex-1 grid grid-cols-7 grid-rows-6 gap-2 min-h-0">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;

            // Get issues for this day
            const cellIssues = issues.filter((i) => {
              if (filterProject !== "all" && i.projectId !== filterProject) return false;
              return i.dueDate === cell.dateStr;
            });

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(cell.dateStr)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropOnDate(cell.dateStr);
                }}
                className={cn(
                  "min-w-0 p-1 sm:p-2 rounded-lg sm:rounded-xl border flex flex-col justify-between transition-all overflow-hidden cursor-pointer group shadow-sm",
                  cell.isCurrentMonth
                    ? "bg-zinc-900/40 hover:bg-zinc-800/40"
                    : "bg-zinc-950 opacity-30 hover:opacity-60",
                  isSelected
                    ? "border-white/40 ring-1 ring-white/20"
                    : isToday
                    ? "border-white/20 bg-white/5"
                    : "border-white/5 hover:border-white/10"
                )}
              >
                {/* Cell Header: Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full font-heading",
                      isToday
                        ? "bg-white text-zinc-950 font-bold"
                        : cell.isCurrentMonth
                        ? "text-white"
                        : "text-zinc-600"
                    )}
                  >
                    {cell.day}
                  </span>

                  {cellIssues.length > 0 && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {cellIssues.length}
                    </span>
                  )}
                </div>

                {/* Day Tasks Stack */}
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto my-1 max-h-[80px]">
                  {cellIssues.slice(0, 3).map((issue) => {
                    const isDone = issue.status === "done";
                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", issue.id);
                          setDraggedIssueId(issue.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssueId(issue.id);
                        }}
                        className={cn(
                          "px-1.5 py-0.5 rounded-md text-[10px] font-medium border flex items-center justify-between gap-1 truncate cursor-grab active:cursor-grabbing transition-colors",
                          isDone
                            ? "bg-zinc-950 border-white/5 text-zinc-500 line-through"
                            : "bg-zinc-800/80 border-white/10 text-white hover:border-white/20"
                        )}
                        title={issue.title}
                      >
                        <span className="truncate">{issue.title}</span>
                        <PriorityIcon priority={issue.priority} />
                      </div>
                    );
                  })}

                  {cellIssues.length > 3 && (
                    <span className="text-[9px] text-zinc-400 font-medium text-center">
                      +{cellIssues.length - 3} altre
                    </span>
                  )}
                </div>

                {/* Quick Add Trigger on Hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(cell.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 py-0.5 text-[9px] text-zinc-400 hover:text-white flex items-center justify-center gap-1 transition-opacity cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Nuova task</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Quick Capture Bar at Bottom */}
      {selectedDate && (
        <div className="px-4 sm:px-6 md:px-10 py-3 bg-zinc-950 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-3 w-full min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-white font-medium">
                {selectedDate}:
              </span>
            </div>
            <input
              type="text"
              placeholder="Scrivi una task per questo giorno e premi Invio..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTaskForDate(selectedDate)}
              className="min-w-0 flex-1 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none placeholder:text-zinc-500"
            />
            <button
              onClick={() => handleCreateTaskForDate(selectedDate)}
              disabled={!quickTitle.trim()}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold text-xs transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Aggiungi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
