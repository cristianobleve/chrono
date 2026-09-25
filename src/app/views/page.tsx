"use client";

import React, { useMemo, useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, CircleDot, Clock3, Filter, FolderKanban, ListTodo, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

type FocusFilter = "all" | "today" | "overdue" | "priority" | "mine";

export default function ViewsPage() {
  const { issues, projects, currentUser, currentWorkspaceId, setSelectedIssueId } = useLinearStore();
  const { t, lang } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FocusFilter>("all");

  const localeMap: Record<string, string> = {
    it: "it-IT",
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    ru: "ru-RU",
  };
  const dateLocale = localeMap[lang] || "en-US";

  const formatDate = (date?: string | null) =>
    date
      ? new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString(dateLocale, { day: "2-digit", month: "short" })
      : t.focusViews.noDeadline;

  const workspaceIssues = useMemo(() => issues.filter((issue) => currentWorkspaceId && issue.workspaceId === currentWorkspaceId), [issues, currentWorkspaceId]);
  const activeIssues = workspaceIssues.filter((issue) => issue.status !== "done" && issue.status !== "canceled");
  const today = new Date().toISOString().slice(0, 10);
  const overdue = activeIssues.filter((issue) => issue.dueDate && issue.dueDate.slice(0, 10) < today);
  const dueToday = activeIssues.filter((issue) => issue.dueDate?.slice(0, 10) === today);
  const highPriority = activeIssues.filter((issue) => issue.priority === "urgent" || issue.priority === "high");
  const assignedToMe = activeIssues.filter((issue) => issue.assigneeId === currentUser.id);
  const filteredIssues = { all: activeIssues, today: dueToday, overdue, priority: highPriority, mine: assignedToMe }[activeFilter];
  const stats = [
    { key: "today" as const, label: t.focusViews.today, value: dueToday.length, icon: CalendarClock, tone: "text-sky-300", bg: "bg-sky-400/10" },
    { key: "overdue" as const, label: t.focusViews.overdue, value: overdue.length, icon: AlertCircle, tone: "text-red-300", bg: "bg-red-400/10" },
    { key: "priority" as const, label: t.focusViews.highPriority, value: highPriority.length, icon: Target, tone: "text-amber-300", bg: "bg-amber-400/10" },
    { key: "mine" as const, label: t.focusViews.assignedToMe, value: assignedToMe.length, icon: ListTodo, tone: "text-emerald-300", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 py-8 flex flex-col gap-7 text-ink pb-24">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            <Target className="w-3.5 h-3.5 text-sky-300" />
            {t.focusViews.workFocusLabel}
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">{t.focusViews.operationalFocus}</h1>
          <p className="mt-1 text-xs text-zinc-400">{t.focusViews.subtitle}</p>
        </div>
        <Link href="/issues" className="inline-flex items-center gap-2 h-8 px-3 rounded-[8px] bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors">
          {t.focusViews.openAll} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const selected = activeFilter === stat.key;
          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => setActiveFilter(selected ? "all" : stat.key)}
              className={cn(
                "rounded-[10px] border p-4 text-left transition-colors",
                selected ? "border-white/25 bg-white/[0.08]" : "border-white/10 bg-zinc-900/50 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("w-4 h-4", stat.tone)} />
                </span>
                <span className="text-2xl font-semibold text-white tabular-nums">{stat.value}</span>
              </div>
              <span className="mt-3 block text-xs text-zinc-400">{stat.label}</span>
            </button>
          );
        })}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <section className="rounded-[10px] border border-white/10 bg-zinc-900/40 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <h2 className="text-sm font-semibold text-white">{t.focusViews.workQueue}</h2>
              <span className="text-[10px] font-mono text-zinc-500">{filteredIssues.length}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
              <CircleDot className="w-3 h-3 text-emerald-400" />
              {t.focusViews.openIssues}
            </div>
          </div>
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              <p className="text-sm font-medium text-white">{t.focusViews.nothingInQueue}</p>
              <p className="text-xs text-zinc-500">{t.focusViews.nothingInQueueDesc}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredIssues.slice(0, 12).map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      issue.priority === "urgent" ? "bg-red-400" : issue.priority === "high" ? "bg-amber-300" : "bg-zinc-600"
                    )}
                  />
                  <span className="font-mono text-[10px] text-zinc-500 shrink-0">{issue.identifier}</span>
                  <span className="text-xs text-zinc-200 truncate flex-1">{issue.title}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono shrink-0",
                      issue.dueDate && issue.dueDate.slice(0, 10) < today ? "text-red-300" : "text-zinc-500"
                    )}
                  >
                    {formatDate(issue.dueDate)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-[10px] border border-white/10 bg-zinc-900/40 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">{t.focusViews.activeProjects}</h2>
            <FolderKanban className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex flex-col gap-1">
            {projects
              .filter((project) => project.workspaceId === currentWorkspaceId && project.status !== "Completed" && project.status !== "Canceled")
              .slice(0, 6)
              .map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.slug}`}
                  className="flex items-center gap-2 rounded-[8px] px-2.5 py-2 hover:bg-white/[0.05] transition-colors"
                >
                  <span className="w-6 h-6 rounded-[7px] bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] text-zinc-300">
                    {project.name.charAt(0)}
                  </span>
                  <span className="text-xs text-zinc-300 truncate flex-1">{project.name}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-600" />
                </Link>
              ))}
          </div>
          <Link href="/projects" className="pt-3 border-t border-white/5 text-[11px] text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1">
            {t.focusViews.seeAll} <ArrowRight className="w-3 h-3" />
          </Link>
        </aside>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        <Clock3 className="w-3.5 h-3.5" />
        <span>{t.focusViews.filterHint}</span>
      </div>
    </div>
  );
}
