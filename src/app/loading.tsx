import React from "react";
import { ProjectCardSkeleton, IssueRowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="flex-1 p-6 md:p-10 w-full max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in select-none">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-48 h-8 rounded-xl" />
          <Skeleton className="w-72 h-4 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-24 h-9 rounded-xl" />
          <Skeleton className="w-32 h-9 rounded-xl" />
        </div>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>

      {/* Rows of Skeleton Issues */}
      <div className="rounded-xl bg-zinc-900/40 border border-white/10 overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <Skeleton className="w-28 h-4 rounded-md" />
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
        <IssueRowSkeleton />
        <IssueRowSkeleton />
        <IssueRowSkeleton />
        <IssueRowSkeleton />
      </div>
    </div>
  );
}
