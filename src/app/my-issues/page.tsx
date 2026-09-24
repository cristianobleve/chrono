"use client";

import React from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { Box, Plus, CheckSquare } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/i18n";

export default function MyIssuesPage() {
  const { t } = useTranslation();
  const { issues, projects, currentUser, setActiveModal, setSelectedIssueId, getUserDisplayName } = useLinearStore();

  const myIssues = issues.filter(
    (i) => i.assigneeId === currentUser.id || i.assignee?.id === currentUser.id
  );

  return (
    <div className="flex-1 p-8 md:p-12 max-w-6xl mx-auto w-full flex flex-col gap-6 animate-fade-in text-ink select-none pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {t.myIssues.title} ({myIssues.length})
          </h1>
          <p suppressHydrationWarning className="text-xs text-ink-subtle mt-1">
            {t.myIssues.subtitle}
          </p>
        </div>

        <button
          onClick={() => setActiveModal("new_issue")}
          className="px-4 py-2 rounded-[14px] bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.myIssues.newIssue}</span>
        </button>
      </div>

      {myIssues.length === 0 ? (
        <div className="superquadrato-card p-12 text-center text-ink-subtle text-xs flex flex-col items-center justify-center gap-2">
          <CheckSquare className="w-8 h-8 text-zinc-600" />
          <span className="text-white font-semibold">{t.myIssues.emptyTitle}</span>
          <span className="text-ink-tertiary">{t.myIssues.emptyDesc}</span>
        </div>
      ) : (
        <div className="superquadrato-card overflow-hidden shadow-xl">
          <div className="divide-y divide-white/5">
            {myIssues.map((issue) => {
              const proj = projects.find((p) => p.id === issue.projectId);

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="h-12 px-5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <PriorityIcon priority={issue.priority} />
                    <span
                      className="font-mono text-[11px] text-ink-subtle w-14 shrink-0"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {issue.identifier}
                    </span>
                    <span className="text-white font-medium truncate group-hover:text-white transition-colors">
                      {issue.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs text-ink-subtle">
                    {proj && (
                      <span className="hidden sm:flex items-center gap-1 text-[11px] text-ink-tertiary">
                        <Box className="w-3 h-3 text-zinc-400" />
                        <span>{proj.name}</span>
                      </span>
                    )}
                    <StatusIcon status={issue.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
