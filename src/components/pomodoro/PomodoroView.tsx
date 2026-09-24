"use client";

import React, { useState, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ListTodo,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playNotificationChime } from "@/lib/notificationService";
import { useTranslation } from "@/i18n";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";

export const PomodoroView: React.FC = () => {
  const { t } = useTranslation();
  const {
    pomodoro,
    setPomodoroMode,
    setPomodoroRunning,
    setPomodoroActiveIssue,
    tickPomodoro,
    resetPomodoro,
    issues,
    addToast,
  } = useLinearStore();

  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Audio alert on completion
  useEffect(() => {
    if (pomodoro.timeLeft === 0 && soundEnabled) {
      playNotificationChime();
    }
  }, [pomodoro.timeLeft, soundEnabled]);

  const minutes = Math.floor(pomodoro.timeLeft / 60);
  const seconds = pomodoro.timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const activeIssue = issues.find((i) => i.id === pomodoro.activeIssueId);
  const pendingIssues = issues.filter((i) => i.status !== "done" && i.status !== "canceled");

  const totalTimeForMode =
    pomodoro.mode === "focus"
      ? 25 * 60
      : pomodoro.mode === "short_break"
      ? 5 * 60
      : 15 * 60;

  const progressPct = Math.round(
    ((totalTimeForMode - pomodoro.timeLeft) / totalTimeForMode) * 100
  );

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 flex flex-col items-center select-none text-ink">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-8 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-300" />
            <h1 className="text-xl font-bold font-heading text-white tracking-tight">
              {t.pomodoro.title}
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            {t.pomodoro.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            "p-2 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-2",
            soundEnabled
              ? "bg-zinc-900 border-white/10 text-white"
              : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-white"
          )}
          title={soundEnabled ? t.pomodoro.sound : t.pomodoro.noSound}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-zinc-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-zinc-500" />
          )}
          <span className="hidden sm:inline text-[11px]">
            {soundEnabled ? t.pomodoro.sound : t.pomodoro.noSound}
          </span>
        </button>
      </div>

      {/* Main Timer Display Deck */}
      <div className="w-full max-w-lg mt-10 p-8 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-8">
        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900/80 border border-white/5 gap-1">
          <button
            type="button"
            onClick={() => setPomodoroMode("focus")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              pomodoro.mode === "focus"
                ? "bg-white text-zinc-950 shadow-sm font-semibold"
                : "text-zinc-400 hover:text-white"
            )}
          >
            {t.pomodoro.focus} (25m)
          </button>
          <button
            type="button"
            onClick={() => setPomodoroMode("short_break")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              pomodoro.mode === "short_break"
                ? "bg-white text-zinc-950 shadow-sm font-semibold"
                : "text-zinc-400 hover:text-white"
            )}
          >
            {t.pomodoro.shortBreak} (5m)
          </button>
          <button
            type="button"
            onClick={() => setPomodoroMode("long_break")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              pomodoro.mode === "long_break"
                ? "bg-white text-zinc-950 shadow-sm font-semibold"
                : "text-zinc-400 hover:text-white"
            )}
          >
            {t.pomodoro.longBreak} (15m)
          </button>
        </div>

        {/* Digital Time Readout */}
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-7xl sm:text-8xl font-bold font-mono tracking-tighter text-white tabular-nums select-none"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {timeFormatted}
          </span>

          <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
            {pomodoro.mode === "focus"
              ? t.pomodoro.focus
              : pomodoro.mode === "short_break"
              ? t.pomodoro.shortBreak
              : t.pomodoro.longBreak}
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
          <div
            className="h-full bg-white transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPomodoroRunning(!pomodoro.isRunning)}
            className={cn(
              "px-6 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg",
              pomodoro.isRunning
                ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                : "bg-white hover:bg-zinc-200 text-zinc-950"
            )}
          >
            {pomodoro.isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{t.pomodoro.pause}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t.pomodoro.start}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => resetPomodoro()}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={t.pomodoro.reset}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Task Association */}
        <div className="w-full pt-5 border-t border-white/5 flex flex-col gap-2">
          <span className="text-[11px] text-zinc-500 font-medium">
            {t.pomodoro.focusOn}
          </span>

          <LinearSelect
            size="md"
            fullWidth
            value={pomodoro.activeIssueId || ""}
            onChange={(val) => setPomodoroActiveIssue(val || null)}
            placeholder={t.pomodoro.noIssueSelected}
            options={[
              { value: "", label: t.pomodoro.noIssueSelected },
              ...pendingIssues.map((issue) => ({
                value: issue.id,
                label: `${issue.identifier} - ${issue.title}`,
              })),
            ]}
          />

          {activeIssue && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/5 text-xs text-zinc-300 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{activeIssue.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Deck */}
      <div className="w-full max-w-lg mt-6 grid grid-cols-2 gap-3 text-center">
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5 flex flex-col gap-1">
          <span className="text-[11px] text-zinc-500 font-medium">{t.pomodoro.sessions}</span>
          <span className="text-xl font-bold text-white font-mono">
            {pomodoro.completedSessions}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5 flex flex-col gap-1">
          <span className="text-[11px] text-zinc-500 font-medium">{t.pomodoro.progress}</span>
          <span className="text-xl font-bold text-white font-mono">
            {pomodoro.completedSessions * 25} min
          </span>
        </div>
      </div>
    </div>
  );
};
