"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  mode: "date" | "time";
  placeholder?: string;
  accent?: "default" | "amber";
}

const pad = (value: number) => String(value).padStart(2, "0");
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  mode,
  placeholder,
  accent = "default",
}) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const parsed = value ? new Date(`${value}T12:00:00`) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectedDate = value && mode === "date" ? new Date(`${value}T12:00:00`) : null;
  const monthDays = useMemo(() => {
    if (mode !== "date") return [];
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - startOffset + 1;
      return dayNumber > 0 && dayNumber <= daysInMonth
        ? new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNumber)
        : null;
    });
  }, [mode, viewDate]);

  const timeOptions = useMemo(() => {
    return Array.from({ length: 48 }, (_, index) => `${pad(Math.floor(index / 2))}:${index % 2 ? "30" : "00"}`);
  }, []);

  const displayValue = value
    ? mode === "date"
      ? new Date(`${value}T12:00:00`).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })
      : value
    : placeholder || (mode === "date" ? "Seleziona data" : "Seleziona orario");

  const chooseDate = (date: Date) => {
    onChange(toDateKey(date));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-[8px] border px-2.5 py-1.5 text-left text-xs font-mono transition-colors",
          "bg-zinc-900 text-white hover:bg-zinc-800 border-white/10",
          open && (accent === "amber" ? "border-amber-400/60" : "border-sky-400/60"),
          !value && "text-zinc-500"
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {mode === "date" ? <CalendarDays className="h-3.5 w-3.5 shrink-0 text-zinc-400" /> : <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
          <span className="truncate">{displayValue}</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform", open && "rotate-180 text-white")} />
      </button>

      {open && (
        <div className={cn(
          "absolute top-[calc(100%+6px)] z-[100] rounded-[10px] border border-white/10 bg-[#0c0d0e] p-2 shadow-[0_18px_42px_rgba(0,0,0,0.8)] animate-slide-up",
          mode === "time" ? "right-0 w-[198px]" : "left-0 w-[248px]"
        )}>
          {mode === "date" ? (
            <>
              <div className="flex items-center justify-between px-1 pb-2">
                <button type="button" aria-label="Mese precedente" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="rounded-[7px] p-1 text-zinc-400 hover:bg-white/10 hover:text-white"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <span className="text-[11px] font-semibold capitalize text-white">{viewDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</span>
                <button type="button" aria-label="Mese successivo" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="rounded-[7px] p-1 text-zinc-400 hover:bg-white/10 hover:text-white"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 border-b border-white/5 pb-1 text-center text-[10px] font-semibold text-zinc-600">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5 pt-1">
                {monthDays.map((date, index) => {
                  if (!date) return <span key={`empty-${index}`} className="h-8" />;
                  const dateKey = toDateKey(date);
                  const selected = selectedDate && toDateKey(selectedDate) === dateKey;
                  const today = toDateKey(new Date()) === dateKey;
                  return (
                    <button key={dateKey} type="button" onClick={() => chooseDate(date)} className={cn("flex h-7 items-center justify-center rounded-[6px] text-[11px] transition-colors", selected ? "bg-sky-400 font-semibold text-zinc-950" : "text-zinc-300 hover:bg-white/10 hover:text-white", today && !selected && "border border-sky-400/50 text-sky-300")}>
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                <button type="button" onClick={() => chooseDate(new Date())} className="rounded-[7px] px-2 py-1 text-[10px] text-sky-300 hover:bg-sky-400/10">Oggi</button>
                {value && <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="rounded-[7px] px-2 py-1 text-[10px] text-zinc-500 hover:bg-red-400/10 hover:text-red-300">Rimuovi</button>}
              </div>
            </>
          ) : (
            <div className="max-h-56 overflow-y-auto pr-0.5">
              <div className="mb-1 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Scegli orario</div>
              <div className="grid grid-cols-2 gap-1">
                {timeOptions.map((time) => (
                  <button key={time} type="button" onClick={() => { onChange(time); setOpen(false); }} className={cn("flex h-7 items-center justify-between rounded-[6px] px-2 text-[11px] font-mono transition-colors", value === time ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white")}>
                    {time}
                    {value === time && <Check className="h-3.5 w-3.5 text-sky-300" />}
                  </button>
                ))}
              </div>
              {value && <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="mt-2 w-full rounded-[7px] border-t border-white/5 px-2 py-2 text-left text-[10px] text-zinc-500 hover:text-red-300">Rimuovi orario</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
