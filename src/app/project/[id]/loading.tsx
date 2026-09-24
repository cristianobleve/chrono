import React from "react";

export default function ProjectDetailLoading() {
  return (
    <div className="flex-1 w-full h-full min-h-[70vh] flex items-center justify-center bg-[#09090b] select-none">
      <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-xs text-zinc-400 font-sans shadow-sm">
        <span className="font-medium text-zinc-300">Loading project details</span>
        <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-zinc-700 border-t-zinc-200 animate-spin shrink-0" />
      </div>
    </div>
  );
}
