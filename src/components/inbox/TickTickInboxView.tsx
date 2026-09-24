"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { Issue, IssuePriority, IssueStatus, IssueRecurrence } from "@/types";
import {
  Inbox,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Repeat,
  Tag as TagIcon,
  Box,
  Flame,
  AlertCircle,
  Check,
  Sparkles,
  Search,
} from "lucide-react";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

type InboxFilterTab = "today" | "next7days" | "inbox" | "completed";

export const TickTickInboxView: React.FC = () => {
  const { t } = useTranslation();
  const { issues, createIssue, updateIssue, moveIssueToStatus, setSelectedIssueId, projects, tags, addToast } = useLinearStore();

  const [activeTab, setActiveTab] = useState<InboxFilterTab>("today");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<IssuePriority>("medium");
  const [quickProjectId, setQuickProjectId] = useState<string>("none");
  const [quickDueDate, setQuickDueDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [quickRecurrence, setQuickRecurrence] = useState<IssueRecurrence>("none");
  const [searchQuery, setSearchQuery] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysStr = in7Days.toISOString().split("T")[0];

  // Filter calculations
  const todayIssues = issues.filter(
    (i) => i.status !== "done" && i.status !== "canceled" && (i.dueDate === todayStr || !i.dueDate)
  );

  const next7DaysIssues = issues.filter(
    (i) =>
      i.status !== "done" &&
      i.status !== "canceled" &&
      i.dueDate &&
      i.dueDate >= todayStr &&
      i.dueDate <= in7DaysStr
  );

  const allInboxIssues = issues.filter((i) => i.status !== "done" && i.status !== "canceled");
  const completedIssues = issues.filter((i) => i.status === "done");

  const getDisplayedIssues = () => {
    let list: Issue[] = [];
    switch (activeTab) {
      case "today":
        list = todayIssues;
        break;
      case "next7days":
        list = next7DaysIssues;
        break;
      case "inbox":
        list = allInboxIssues;
        break;
      case "completed":
        list = completedIssues;
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.identifier.toLowerCase().includes(q));
    }

    return list;
  };

  const displayedIssues = getDisplayedIssues();

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;

    createIssue({
      title: quickTitle.trim(),
      priority: quickPriority,
      status: "todo",
      dueDate: quickDueDate || null,
      projectId: quickProjectId === "none" ? null : quickProjectId,
      recurrence: quickRecurrence,
    });

    setQuickTitle("");
    addToast({
      title: t.inbox.taskCreatedSuccess,
      description: quickTitle.trim(),
      type: "success",
    });
  };

  const handleToggleDone = (issue: Issue) => {
    const nextStatus: IssueStatus = issue.status === "done" ? "todo" : "done";
    moveIssueToStatus(issue.id, nextStatus);
  };

  const priorityOptions: SelectOption[] = [
    { value: "urgent", label: t.issueDrawer.priorityUrgent, icon: <PriorityIcon priority="urgent" /> },
    { value: "high", label: t.issueDrawer.priorityHigh, icon: <PriorityIcon priority="high" /> },
    { value: "medium", label: t.issueDrawer.priorityMedium, icon: <PriorityIcon priority="medium" /> },
    { value: "low", label: t.issueDrawer.priorityLow, icon: <PriorityIcon priority="low" /> },
    { value: "none", label: t.issueDrawer.priorityNone, icon: <PriorityIcon priority="none" /> },
  ];

  const projectSelectOptions: SelectOption[] = [
    {
      value: "none",
      label: t.inbox.noProject,
      icon: <Box className="w-3.5 h-3.5 text-ink-tertiary" />,
    },
    ...projects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: <Box className="w-3.5 h-3.5 text-zinc-400" />,
    })),
  ];

  const recurrenceOptions: SelectOption[] = [
    { value: "none", label: t.inbox.noRecurrence },
    { value: "daily", label: t.inbox.recurrenceDaily },
    { value: "weekly", label: t.inbox.recurrenceWeekly },
    { value: "monthly", label: t.inbox.recurrenceMonthly },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-black select-none text-ink pb-20 overflow-hidden">
      {/* 1. Left TickTick Sub-navigation Sidebar */}
      <div className="w-full md:w-64 bg-zinc-950 border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-850 text-white border border-white/10 flex items-center justify-center font-bold">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{t.inbox.title}</h2>
            <span className="text-[11px] text-zinc-400">{t.inbox.captureSubtitle}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder={t.inbox.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none placeholder:text-zinc-500"
          />
        </div>

        {/* View Tabs */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("today")}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "today"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{t.inbox.today}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium">
              {todayIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("next7days")}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "next7days"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{t.inbox.next7Days}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium">
              {next7DaysIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inbox")}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "inbox"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-zinc-400" />
              <span>{t.inbox.allTasks}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium">
              {allInboxIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "completed"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t.inbox.completed}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium">
              {completedIssues.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-10 overflow-y-auto gap-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-heading">
              {activeTab === "today" && t.inbox.today}
              {activeTab === "next7days" && t.inbox.next7Days}
              {activeTab === "inbox" && t.inbox.allTasks}
              {activeTab === "completed" && t.inbox.completed}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {displayedIssues.length} {t.inbox.taskCount}
            </p>
          </div>
        </div>

        {/* Quick Capture Input Box (TickTick Style) */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/10 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <Plus className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
              placeholder={t.inbox.quickCapturePlaceholder}
              className="flex-1 bg-transparent text-white text-xs placeholder:text-zinc-500 focus:outline-none select-text"
            />
            <button
              onClick={handleQuickAdd}
              disabled={!quickTitle.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              {t.inbox.add}
            </button>
          </div>

          {/* Quick metadata bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
            <input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/10 text-white text-[11px] focus:outline-none"
            />

            <LinearSelect
              options={priorityOptions}
              value={quickPriority}
              onChange={(val) => setQuickPriority(val as IssuePriority)}
              size="sm"
            />

            <LinearSelect
              options={projectSelectOptions}
              value={quickProjectId}
              onChange={setQuickProjectId}
              size="sm"
            />

            <LinearSelect
              options={recurrenceOptions}
              value={quickRecurrence}
              onChange={(val) => setQuickRecurrence(val as IssueRecurrence)}
              size="sm"
            />
          </div>
        </div>

        {/* Task Items List */}
        <div className="flex flex-col gap-2">
          {displayedIssues.length === 0 ? (
            <div className="p-12 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2 bg-zinc-950/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-40" />
              <span className="font-semibold text-white">{t.inbox.noTasks}</span>
              <span className="text-[11px]">{t.inbox.allDone}</span>
            </div>
          ) : (
            displayedIssues.map((issue) => {
              const proj = projects.find((p) => p.id === issue.projectId);
              const isDone = issue.status === "done";

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={cn(
                    "p-3.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/40 border transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-sm",
                    isDone ? "border-white/5 opacity-60" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDone(issue);
                      }}
                      className="text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                      )}
                    </button>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <InternalIdBadge id={issue.identifier} size="xs" />
                        <span
                          className={cn(
                            "text-xs font-medium truncate transition-colors",
                            isDone ? "line-through text-zinc-500" : "text-white group-hover:text-zinc-200"
                          )}
                        >
                          {issue.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        {proj && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Box className="w-2.5 h-2.5 text-zinc-400" />
                            <span>{proj.name}</span>
                          </span>
                        )}

                        {issue.dueDate && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Calendar className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{issue.dueDate}</span>
                          </span>
                        )}

                        {issue.recurrence && issue.recurrence !== "none" && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Repeat className="w-2.5 h-2.5" />
                            <span className="capitalize">{issue.recurrence}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <PriorityIcon priority={issue.priority} />
                    <StatusIcon status={issue.status} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
