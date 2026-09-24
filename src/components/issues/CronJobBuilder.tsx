"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CRON_PRESETS,
  isValidCron,
  describeCron,
  getNextCronRun,
} from "@/lib/cronUtils";
import {
  Clock,
  Calendar,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { useLinearStore } from "@/store/useLinearStore";

interface CronJobBuilderProps {
  initialCron?: string | null;
  onChange: (cron: string, humanReadable: string) => void;
}

export const CronJobBuilder: React.FC<CronJobBuilderProps> = ({
  initialCron,
  onChange,
}) => {
  const preferences = useLinearStore((s) => s.preferences);
  const isSundayFirst = preferences?.firstDayOfWeek === "sunday";

  const weekdays = useMemo(() => {
    if (isSundayFirst) {
      return [
        { val: 0, label: "Dom", full: "Domenica" },
        { val: 1, label: "Lun", full: "Lunedì" },
        { val: 2, label: "Mar", full: "Martedì" },
        { val: 3, label: "Mer", full: "Mercoledì" },
        { val: 4, label: "Gio", full: "Giovedì" },
        { val: 5, label: "Ven", full: "Venerdì" },
        { val: 6, label: "Sab", full: "Sabato" },
      ];
    }
    return [
      { val: 1, label: "Lun", full: "Lunedì" },
      { val: 2, label: "Mar", full: "Martedì" },
      { val: 3, label: "Mer", full: "Mercoledì" },
      { val: 4, label: "Gio", full: "Giovedì" },
      { val: 5, label: "Ven", full: "Venerdì" },
      { val: 6, label: "Sab", full: "Sabato" },
      { val: 0, label: "Dom", full: "Domenica" },
    ];
  }, [isSundayFirst]);

  const [cronString, setCronString] = useState<string>(
    initialCron && isValidCron(initialCron) ? initialCron : "0 9 * * 1-5"
  );
  const [builderTab, setBuilderTab] = useState<"presets" | "visual" | "raw">("presets");
  const [copied, setCopied] = useState(false);
  const addToast = useLinearStore((s) => s.addToast);

  // Visual builder state
  const [visualHour, setVisualHour] = useState<string>("09");
  const [visualMinute, setVisualMinute] = useState<string>("00");
  const [visualDays, setVisualDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const isValid = isValidCron(cronString);
  const humanDescription = describeCron(cronString);
  const nextRun = getNextCronRun(cronString);

  // Synchronize visual builder with cron string
  const applyVisual = (h: string, m: string, days: number[]) => {
    let dowPart = "*";
    if (days.length > 0 && days.length < 7) {
      // Check if weekdays
      const isWeekdays =
        days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d));
      if (isWeekdays) {
        dowPart = "1-5";
      } else {
        dowPart = days.sort().join(",");
      }
    }
    const minutePart = parseInt(m, 10).toString();
    const hourPart = parseInt(h, 10).toString();
    const newCron = `${minutePart} ${hourPart} * * ${dowPart}`;
    setCronString(newCron);
    onChange(newCron, describeCron(newCron));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({
      title: "Espressione Cron Copiata",
      description: cronString,
      type: "success",
    });
  };

  const handlePresetSelect = (presetCron: string) => {
    setCronString(presetCron);
    onChange(presetCron, describeCron(presetCron));
  };

  const handleRawChange = (val: string) => {
    setCronString(val);
    if (isValidCron(val)) {
      onChange(val, describeCron(val));
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 text-xs">
      {/* 1. Natural Language Banner & Cron Output */}
      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Schedulazione Cron Job</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-[10px] font-mono cursor-pointer border border-white/10"
            title="Copia espressione cron"
          >
            {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copiato!" : "Copia"}</span>
          </button>
        </div>

        {/* Human Readable Translation */}
        <div className="text-white font-semibold text-xs leading-snug">
          {humanDescription}
        </div>

        {/* Raw Cron Token Monospace Pill */}
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-1 rounded-md bg-zinc-950 border border-white/20 text-white font-mono font-bold text-xs tracking-wider select-text">
            {cronString}
          </span>

          {nextRun && (
            <span className="text-[10px] font-mono text-zinc-500">
              Prossimo run:{" "}
              <strong className="text-zinc-400">
                {nextRun.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}{" "}
                alle {nextRun.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* 2. Builder Mode Switcher */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950 border border-white/10">
        <button
          type="button"
          onClick={() => setBuilderTab("presets")}
          className={cn(
            "flex-1 py-1 text-center font-medium rounded-md transition-colors cursor-pointer text-[11px]",
            builderTab === "presets" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-500 hover:text-white"
          )}
        >
          Preset Rapidi
        </button>
        <button
          type="button"
          onClick={() => setBuilderTab("visual")}
          className={cn(
            "flex-1 py-1 text-center font-medium rounded-md transition-colors cursor-pointer text-[11px]",
            builderTab === "visual" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-500 hover:text-white"
          )}
        >
          Costruttore Visuale
        </button>
        <button
          type="button"
          onClick={() => setBuilderTab("raw")}
          className={cn(
            "flex-1 py-1 text-center font-medium rounded-md transition-colors cursor-pointer text-[11px]",
            builderTab === "raw" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-500 hover:text-white"
          )}
        >
          Espressione Manuale
        </button>
      </div>

      {/* 3. Tab: Presets */}
      {builderTab === "presets" && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {CRON_PRESETS.map((preset) => {
            const isCurrent = cronString === preset.cron;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.cron)}
                className={cn(
                  "p-2 rounded-[6px] border text-left flex flex-col gap-0.5 transition-all cursor-pointer",
                  isCurrent
                    ? "bg-white/10 border-white/30 text-white shadow-sm"
                    : "bg-zinc-900/60 hover:bg-zinc-800 border-white/5 text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{preset.label}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{preset.cron}</span>
                </div>
                <span className="text-[10px] text-zinc-500 leading-tight">{preset.description}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Tab: Visual Builder */}
      {builderTab === "visual" && (
        <div className="flex flex-col gap-3">
          {/* Time Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Orario di Esecuzione</span>
            <div className="flex items-center gap-2">
              <DateTimePicker
                mode="time"
                value={`${visualHour}:${visualMinute}`}
                onChange={(value) => {
                  const [h, m] = value.split(":");
                  setVisualHour(h);
                  setVisualMinute(m);
                  applyVisual(h, m, visualDays);
                }}
              />
              <span className="text-[10px] text-zinc-500">Fuso orario locale</span>
            </div>
          </div>

          {/* Weekdays Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Giorni della Settimana</span>
            <div className="flex items-center gap-1 flex-wrap">
              {weekdays.map((wd) => {
                const isSelected = visualDays.includes(wd.val);
                return (
                  <button
                    key={wd.val}
                    type="button"
                    onClick={() => {
                      const updated = isSelected
                        ? visualDays.filter((d) => d !== wd.val)
                        : [...visualDays, wd.val];
                      setVisualDays(updated);
                      applyVisual(visualHour, visualMinute, updated);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer",
                      isSelected
                        ? "bg-white text-zinc-950 font-bold shadow-sm"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10"
                    )}
                  >
                    {wd.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab: Raw Cron String Input */}
      {builderTab === "raw" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Sintassi Cron Standard (5 campi)</span>
          </div>

          <input
            type="text"
            value={cronString}
            onChange={(e) => handleRawChange(e.target.value)}
            placeholder="* * * * *"
            className={cn(
              "px-3 py-1.5 rounded-lg bg-zinc-900 border font-mono text-xs focus:outline-none transition-colors",
              isValid
                ? "border-white/10 text-white focus:border-white/20"
                : "border-rose-500/60 text-rose-300 focus:border-rose-500"
            )}
          />

          <div className="grid grid-cols-5 text-center text-[9px] font-mono text-zinc-500">
            <div>min (0-59)</div>
            <div>ore (0-23)</div>
            <div>mese (1-31)</div>
            <div>mese (1-12)</div>
            <div>sett (0-6)</div>
          </div>
        </div>
      )}
    </div>
  );
};
