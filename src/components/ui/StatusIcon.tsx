import React from "react";
import { ProjectStatus, IssueStatus } from "@/types";
import { Circle, CircleDot, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIconProps {
  status: ProjectStatus | IssueStatus | string;
  className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, className }) => {
  const norm = (status || "").toLowerCase();

  if (norm === "backlog") {
    return (
      <svg
        className={cn("w-3.5 h-3.5 text-sky-400 shrink-0", className)}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      >
        <circle cx="8" cy="8" r="6" />
      </svg>
    );
  }

  if (norm === "todo" || norm === "planned") {
    return <Circle className={cn("w-3.5 h-3.5 text-ink-subtle shrink-0", className)} strokeWidth={1.5} />;
  }

  if (norm === "in_progress" || norm === "in progress") {
    return (
      <svg className={cn("w-3.5 h-3.5 text-[#f2c94c] shrink-0", className)} viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM3.5 8a4.5 4.5 0 0 1 4.5-4.5v9A4.5 4.5 0 0 1 3.5 8z" />
      </svg>
    );
  }

  if (norm === "done" || norm === "completed") {
    return <CheckCircle2 className={cn("w-3.5 h-3.5 text-emerald-400 shrink-0", className)} strokeWidth={1.75} />;
  }

  if (norm === "canceled") {
    return <XCircle className={cn("w-3.5 h-3.5 text-red-400 shrink-0", className)} strokeWidth={1.5} />;
  }

  return <Circle className={cn("w-3.5 h-3.5 text-ink-subtle shrink-0", className)} strokeWidth={1.5} />;
};
