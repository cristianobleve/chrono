"use client";

import React from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { Box, CheckSquare, Sparkles, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TeamHomePage() {
  const { team, projects, issues, setActiveModal } = useLinearStore();

  return (
    <div className="flex-1 w-full px-6 md:px-10 lg:px-12 py-8 flex flex-col gap-8 select-none text-ink pb-24">
      {/* Header Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[18px] bg-white text-black font-bold text-2xl flex items-center justify-center shadow-xl shrink-0">
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Dashboard {team.name}
            </h1>
            <span
              className="text-xs text-ink-subtle font-mono mt-0.5"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {team.key.toLowerCase()}.chrono.internal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal("new_issue")}
            className="px-4 py-2 rounded-[12px] bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nuova issue</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid across wide screen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/projects"
          className="superquadrato-card p-6 flex flex-col justify-between gap-4 group cursor-pointer shadow-md border border-white/5 hover:border-white/15 transition-colors"
        >
          <div className="flex items-center justify-between text-ink-tertiary">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">Progetti</span>
            <div className="w-9 h-9 rounded-[12px] bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-mono" style={{ fontFamily: "'DM Mono', monospace" }}>
            {projects.length}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-white font-medium group-hover:translate-x-1 transition-transform">
            <span>Visualizza tutti i progetti</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/issues"
          className="superquadrato-card p-6 flex flex-col justify-between gap-4 group cursor-pointer shadow-md border border-white/5 hover:border-white/15 transition-colors"
        >
          <div className="flex items-center justify-between text-ink-tertiary">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">Issue Aperte</span>
            <div className="w-9 h-9 rounded-[12px] bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-mono" style={{ fontFamily: "'DM Mono', monospace" }}>
            {issues.filter(i => i.status !== "done" && i.status !== "canceled").length}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-white font-medium group-hover:translate-x-1 transition-transform">
            <span>Visualizza backlog</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/agent"
          className="superquadrato-card p-6 flex flex-col justify-between gap-4 group cursor-pointer shadow-md border border-white/5 hover:border-white/15 transition-colors"
        >
          <div className="flex items-center justify-between text-ink-tertiary">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">Chrono Agent</span>
            <div className="w-9 h-9 rounded-[12px] bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-sm font-semibold text-white">
            Chrono Agent pronto
          </span>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-white font-medium group-hover:translate-x-1 transition-transform">
            <span>Apri sessione chat</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>
    </div>
  );
}
