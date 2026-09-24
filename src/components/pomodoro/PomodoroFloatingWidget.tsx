"use client";

import React, { useState, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  X,
  Flame,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const PomodoroFloatingWidget: React.FC = () => {
  const {
    pomodoro,
    setPomodoroMode,
    setPomodoroRunning,
    setPomodoroActiveIssue,
    tickPomodoro,
    resetPomodoro,
    issues,
  } = useLinearStore();

  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Timer Tick Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomodoro.isRunning) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isRunning, tickPomodoro]);

  if (!isVisible) return null;

  const minutes = Math.floor(pomodoro.timeLeft / 60);
  const seconds = pomodoro.timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const activeIssue = issues.find((i) => i.id === pomodoro.activeIssueId);

  return (
    <div className="fixed bottom-5 right-[74px] z-40 select-none animate-slide-up">
      {isMinimized ? (
        /* Minimized Sleek Pill */
        <div
          onClick={() => setIsMinimized(false)}
          className={cn(
            "px-3.5 py-2 rounded-full border shadow-2xl flex items-center gap-2.5 cursor-pointer backdrop-blur-md transition-colors",
            pomodoro.isRunning
              ? "bg-zinc-900 border-white/30 text-white ring-1 ring-white/20"
              : "bg-zinc-950/90 border-white/10 text-zinc-400 hover:text-white"
          )}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="font-mono font-bold text-xs text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
            {timeFormatted}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
            {pomodoro.mode === "focus" ? "Focus" : "Pausa"}
          </span>
          <Maximize2 className="w-3 h-3 text-zinc-500 ml-1" />
        </div>
      ) : (
        /* Expanded Superquadrato Card */
        <div className="w-72 p-4 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col gap-3.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-xs text-white font-heading">
                Pomodoro Focus
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Minimizza"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Chiudi timer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-zinc-900 border border-white/10 text-[10px] font-semibold">
            <button
              onClick={() => setPomodoroMode("focus")}
              className={cn(
                "py-1 rounded-lg transition-colors cursor-pointer",
                pomodoro.mode === "focus" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white"
              )}
            >
              Focus 25m
            </button>
            <button
              onClick={() => setPomodoroMode("short_break")}
              className={cn(
                "py-1 rounded-lg transition-colors cursor-pointer",
                pomodoro.mode === "short_break" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white"
              )}
            >
              Pausa 5m
            </button>
            <button
              onClick={() => setPomodoroMode("long_break")}
              className={cn(
                "py-1 rounded-lg transition-colors cursor-pointer",
                pomodoro.mode === "long_break" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white"
              )}
            >
              Pausa 15m
            </button>
          </div>

          {/* Large Countdown Display */}
          <div className="text-center py-2">
            <div
              className="text-4xl font-bold text-white tracking-tight font-mono"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {timeFormatted}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              {pomodoro.completedSessions} sessioni completate oggi
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={resetPomodoro}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Resetta"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPomodoroRunning(!pomodoro.isRunning)}
              className="flex-1 py-2 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {pomodoro.isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Pausa</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Avvia Focus</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
