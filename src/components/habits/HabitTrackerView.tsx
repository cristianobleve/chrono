"use client";

import React, { useState, useMemo } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Flame,
  Plus,
  Check,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export const HabitTrackerView: React.FC = () => {
  const { habits, addHabit, toggleHabitDate, preferences } = useLinearStore();
  const { t, lang } = useTranslation();

  const localeMap: Record<string, string> = {
    it: "it-IT",
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    ru: "ru-RU",
  };
  const dateLocale = localeMap[lang] || "en-US";

  const isSundayFirst = preferences?.firstDayOfWeek === "sunday";

  const daysOfWeek = useMemo(() => {
    const curr = new Date();
    const currentDay = curr.getDay();
    const diffToStart = isSundayFirst ? currentDay : (currentDay === 0 ? 6 : currentDay - 1);

    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - diffToStart);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const name = d.toLocaleDateString(dateLocale, { weekday: "short" });
      days.push({ dayIndex: d.getDay(), name, dateStr });
    }
    return days;
  }, [isSundayFirst, dateLocale]);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Engineering");
  const [newColor, setNewColor] = useState("#60a5fa");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateHabit = () => {
    if (!newTitle.trim()) return;

    addHabit({
      title: newTitle.trim(),
      category: newCategory,
      color: newColor,
      frequency: "daily",
      targetDays: [1, 2, 3, 4, 5],
    });

    setNewTitle("");
    setShowAddForm(false);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6 text-ink select-none pb-24 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            <span>{t.habits.title}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">{t.habits.subtitle}</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.habits.newHabit}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 flex flex-col gap-4 shadow-xl">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider text-zinc-400">
            {t.habits.configureHabit}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400">{t.habits.habitName}</label>
              <input
                type="text"
                placeholder={t.habits.habitNamePlaceholder}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateHabit()}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-400">{t.habits.category}</label>
              <input
                type="text"
                placeholder={t.habits.categoryPlaceholder}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">{t.habits.color}</span>
              <div className="flex items-center gap-1.5">
                {["#60a5fa", "#34d399", "#c084fc", "#f472b6", "#fb923c", "#facc15"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      "w-5 h-5 rounded-full transition-transform cursor-pointer",
                      newColor === c ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : "hover:scale-105"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs"
              >
                {t.habits.cancel}
              </button>
              <button
                onClick={handleCreateHabit}
                disabled={!newTitle.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200"
              >
                {t.habits.create}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 flex flex-col gap-4 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 font-medium text-white font-heading">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>{t.habits.currentWeek}</span>
          </div>
          <span className="text-zinc-500 text-[11px] font-mono">
            {habits.length} {t.habits.activeHabits}
          </span>
        </div>

        <div suppressHydrationWarning className="flex flex-col gap-3 overflow-x-auto">
          <div className="grid grid-cols-12 gap-2 text-center text-xs font-medium text-zinc-400 uppercase pb-1 min-w-[650px]">
            <div className="col-span-5 text-left pl-2">{t.habits.habitColumn}</div>
            {daysOfWeek.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "col-span-1 py-1 rounded-md",
                  d.dateStr === todayStr && "bg-white/10 text-white font-medium"
                )}
              >
                <span>{d.name}</span>
                <span className="block text-[9px] opacity-60 font-mono">
                  {d.dateStr.split("-")[2]}
                </span>
              </div>
            ))}
          </div>

          {habits.map((habit) => (
            <div
              key={habit.id}
              className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-zinc-950/60 border border-white/5 hover:border-white/10 transition-colors min-w-[650px] group"
            >
              <div className="col-span-5 flex items-center justify-between pr-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: habit.color || "#60a5fa" }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-xs text-white truncate">{habit.title}</span>
                    {habit.category && (
                      <span className="text-[10px] text-zinc-500 truncate">{habit.category}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 shrink-0">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-medium text-white font-mono">{habit.streak}d</span>
                </div>
              </div>

              {daysOfWeek.map((d, i) => {
                const isChecked = habit.completedDates.includes(d.dateStr);
                return (
                  <div key={i} className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => toggleHabitDate(habit.id, d.dateStr)}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer",
                        isChecked
                          ? "bg-white border-white text-zinc-950 shadow-sm"
                          : "bg-zinc-900/60 hover:bg-zinc-800 border-white/10 text-transparent"
                      )}
                    >
                      <Check className={cn("w-3.5 h-3.5 stroke-[2.5]", isChecked ? "opacity-100" : "opacity-0")} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
