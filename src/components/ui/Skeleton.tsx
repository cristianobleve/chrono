"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[10px] bg-zinc-900 border border-white/5",
        className
      )}
      {...props}
    />
  );
};

// 1. Project Card Skeleton for ProjectsListView
export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col justify-between gap-4 h-52 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-[12px] bg-zinc-900" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-32 h-4 rounded-md" />
            <Skeleton className="w-20 h-2.5 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="w-full h-3 rounded-md" />
        <Skeleton className="w-3/4 h-3 rounded-md" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-2 rounded-full" />
          <Skeleton className="w-8 h-2.5 rounded-md" />
        </div>
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    </div>
  );
};

// 2. Issue Row Skeleton for IssuesHubView
export const IssueRowSkeleton: React.FC = () => {
  return (
    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-4 animate-pulse bg-zinc-950/50">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="w-4 h-4 rounded-md shrink-0" />
        <Skeleton className="w-14 h-3.5 rounded-md shrink-0" />
        <Skeleton className="w-48 sm:w-80 h-3.5 rounded-md" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    </div>
  );
};

// 3. Unsplash Photo Grid Skeleton for ProjectCoverPicker
export const UnsplashPhotoSkeleton: React.FC = () => {
  return (
    <div className="h-28 rounded-[12px] bg-zinc-900 border border-white/5 animate-pulse relative overflow-hidden flex flex-col justify-end p-2 gap-1.5">
      <Skeleton className="w-24 h-3 rounded-md bg-zinc-800" />
      <Skeleton className="w-14 h-2 rounded-md bg-zinc-800" />
    </div>
  );
};

// 4. Agent Reasoning Bubble Skeleton for LinearAgentView
export const AgentMessageSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 text-xs max-w-[85%] self-start animate-pulse">
      <Skeleton className="w-8 h-8 rounded-[11px] bg-zinc-900 shrink-0" />
      <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-3 min-w-[280px] sm:min-w-[420px]">
        <div className="flex items-center gap-2">
          <Skeleton className="w-28 h-3.5 rounded-md bg-zinc-800" />
          <Skeleton className="w-16 h-4 rounded-full bg-zinc-800" />
        </div>
        <Skeleton className="w-full h-3 rounded-md bg-zinc-800/80" />
        <Skeleton className="w-[90%] h-3 rounded-md bg-zinc-800/80" />
        <Skeleton className="w-[65%] h-3 rounded-md bg-zinc-800/80" />
      </div>
    </div>
  );
};
