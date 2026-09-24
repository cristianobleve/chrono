"use client";

import React, { useState, useEffect, useMemo } from "react";
import { IssueRecurrence } from "@/types";
import {
  Calendar,
  Clock,
  Repeat,
  Bell,
  Check,
  X,
  Sparkles,
  Volume2,
  CalendarDays,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { cn } from "@/lib/utils";
import { CronJobBuilder } from "./CronJobBuilder";
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendDesktopNotification,
  playNotificationChime,
  NotificationPermissionState,
} from "@/lib/notificationService";
import { useLinearStore } from "@/store/useLinearStore";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

interface RecurrenceReminderPickerProps {
  dueDate: string | null;
  dueTime?: string | null;
  reminderDate?: string | null;
  reminderTime?: string | null;
  recurrence?: IssueRecurrence;
  recurrenceDays?: number[];
  cronExpression?: string | null;
  cronHumanReadable?: string | null;
  onChange: (data: {
    dueDate: string | null;
    dueTime?: string | null;
    reminderDate?: string | null;
    reminderTime?: string | null;
    recurrence?: IssueRecurrence;
    recurrenceDays?: number[];
    cronExpression?: string | null;
    cronHumanReadable?: string | null;
  }) => void;
}

export const RecurrenceReminderPicker: React.FC<RecurrenceReminderPickerProps> = ({
  dueDate,
  dueTime = "",
  reminderDate = "",
  reminderTime = "",
  recurrence = "none",
  recurrenceDays = [],
  cronExpression = null,
  cronHumanReadable = null,
  onChange,
}) => {
  const preferences = useLinearStore((s) => s.preferences);
  const isSundayFirst = preferences?.firstDayOfWeek === "sunday";

  const weekdays = useMemo(() => {
    if (isSundayFirst) {
      return [
        { day: 0, label: "D", full: "Dom" },
        { day: 1, label: "L", full: "Lun" },
        { day: 2, label: "M", full: "Mar" },
        { day: 3, label: "M", full: "Mer" },
        { day: 4, label: "G", full: "Gio" },
        { day: 5, label: "V", full: "Ven" },
        { day: 6, label: "S", full: "Sab" },
      ];
    }
    return [
      { day: 1, label: "L", full: "Lun" },
      { day: 2, label: "M", full: "Mar" },
      { day: 3, label: "M", full: "Mer" },
      { day: 4, label: "G", full: "Gio" },
      { day: 5, label: "V", full: "Ven" },
      { day: 6, label: "S", full: "Sab" },
      { day: 0, label: "D", full: "Dom" },
    ];
  }, [isSundayFirst]);

  const [selectedDueDate, setSelectedDueDate] = useState<string>(dueDate || "");
  const [selectedDueTime, setSelectedDueTime] = useState<string>(dueTime || "");
  const [selectedReminderDate, setSelectedReminderDate] = useState<string>(reminderDate || "");
  const [selectedReminderTime, setSelectedReminderTime] = useState<string>(reminderTime || "");
  const [selectedRecurrence, setSelectedRecurrence] = useState<IssueRecurrence>(recurrence || "none");
  const [selectedDays, setSelectedDays] = useState<number[]>(recurrenceDays || []);
  const [currentCron, setCurrentCron] = useState<string>(cronExpression || "0 9 * * 1-5");
  const [currentCronText, setCurrentCronText] = useState<string>(cronHumanReadable || "Giorni lavorativi alle 09:00");

  const [notifPermission, setNotifPermission] = useState<NotificationPermissionState>("default");
  const addToast = useLinearStore((s) => s.addToast);

  useEffect(() => {
    setNotifPermission(getNotificationPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === "granted") {
      playNotificationChime();
      sendDesktopNotification("Notifiche Chrono Attivate", {
        body: "Riceverai avvisi desktop sonori per scadenze e promemoria delle tue issue.",
      });
      addToast({
        title: "Notifiche Desktop Abilitate",
        description: "Riceverai avvisi sonori e popup di sistema per le tue scadenze",
        type: "success",
      });
    } else if (res === "denied") {
      addToast({
        title: "Permesso Notifiche Rifiutato",
        description: "Abilita le notifiche dalle impostazioni del browser (icona del lucchetto)",
        type: "warning",
      });
    }
  };

  const handleTestNotification = () => {
    playNotificationChime();
    sendDesktopNotification("Test Notifica Chrono", {
      body: "Il motore di notifica di Chrono è perfettamente attivo e funzionante.",
    });
    addToast({
      title: "Notifica Inviata",
      description: "Audio chime riprodotto e popup desktop mostrato",
      type: "info",
    });
  };

  // Quick Preset Helper for Due Date
  const applyQuickDueDate = (offsetDays: number, timeStr: string = "18:00") => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split("T")[0];

    setSelectedDueDate(dateStr);
    setSelectedDueTime(timeStr);

    onChange({
      dueDate: dateStr,
      dueTime: timeStr,
      reminderDate: selectedReminderDate,
      reminderTime: selectedReminderTime,
      recurrence: selectedRecurrence,
      recurrenceDays: selectedDays,
      cronExpression: currentCron,
      cronHumanReadable: currentCronText,
    });
  };

  // Quick Preset Helper for Reminder
  const applyQuickReminder = (offsetHours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    const dateStr = d.toISOString().split("T")[0];
    const timeStr = d.toTimeString().slice(0, 5);

    setSelectedReminderDate(dateStr);
    setSelectedReminderTime(timeStr);

    onChange({
      dueDate: selectedDueDate,
      dueTime: selectedDueTime,
      reminderDate: dateStr,
      reminderTime: timeStr,
      recurrence: selectedRecurrence,
      recurrenceDays: selectedDays,
      cronExpression: currentCron,
      cronHumanReadable: currentCronText,
    });
  };

  const clearDueDate = () => {
    setSelectedDueDate("");
    setSelectedDueTime("");
    onChange({
      dueDate: null,
      dueTime: null,
      reminderDate: selectedReminderDate,
      reminderTime: selectedReminderTime,
      recurrence: selectedRecurrence,
      recurrenceDays: selectedDays,
      cronExpression: currentCron,
      cronHumanReadable: currentCronText,
    });
  };

  const clearReminder = () => {
    setSelectedReminderDate("");
    setSelectedReminderTime("");
    onChange({
      dueDate: selectedDueDate,
      dueTime: selectedDueTime,
      reminderDate: null,
      reminderTime: null,
      recurrence: selectedRecurrence,
      recurrenceDays: selectedDays,
      cronExpression: currentCron,
      cronHumanReadable: currentCronText,
    });
  };

  const handleToggleDay = (day: number) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
    onChange({
      dueDate: selectedDueDate || null,
      dueTime: selectedDueTime || null,
      reminderDate: selectedReminderDate || null,
      reminderTime: selectedReminderTime || null,
      recurrence: selectedRecurrence,
      recurrenceDays: updated,
      cronExpression: currentCron,
      cronHumanReadable: currentCronText,
    });
  };

  const recurrenceOptions: SelectOption[] = [
    { value: "none", label: "Nessuna Ripetizione" },
    { value: "daily", label: "Ogni Giorno" },
    { value: "weekly", label: "Ogni Settimana (giorni selezionati)" },
    { value: "monthly", label: "Ogni Mese" },
    { value: "custom", label: "Personalizzata (Convertitore Cron Job)" },
  ];

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      {/* Notification Status */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-[6px] bg-zinc-900 border border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-400">
            {notifPermission === "granted"
              ? "Notifiche attive"
              : notifPermission === "denied"
              ? "Notifiche bloccate"
              : "Notifiche non abilitate"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {notifPermission === "granted" ? (
            <button
              type="button"
              onClick={handleTestNotification}
              className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-[10px] cursor-pointer"
              title="Test suono di notifica"
            >
              <Volume2 className="w-3 h-3" />
              <span>Test</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white transition-colors text-[10px] font-semibold cursor-pointer"
            >
              <Bell className="w-3 h-3" />
              <span>Abilita</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ========================================================================= */}
        {/* 1. SCADENZA (DUE DATE & TIME) */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-2.5 p-3 rounded-[8px] bg-zinc-900/60 border border-white/10">
          <div className="flex items-center justify-between text-white font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Data di scadenza</span>
            </div>
            {selectedDueDate && (
              <button
                type="button"
                onClick={clearDueDate}
                className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Rimuovi</span>
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => applyQuickDueDate(0, "18:00")}
              className="px-2 py-0.5 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              Oggi
            </button>
            <button
              type="button"
              onClick={() => applyQuickDueDate(1, "18:00")}
              className="px-2 py-0.5 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              Domani
            </button>
            <button
              type="button"
              onClick={() => applyQuickDueDate(7, "18:00")}
              className="px-2 py-0.5 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              +1 Settimana
            </button>
          </div>

          {/* Clean styled input row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-500">Giorno</span>
              <DateTimePicker
                mode="date"
                value={selectedDueDate}
                onChange={(value) => {
                  setSelectedDueDate(value);
                  onChange({
                    dueDate: value || null,
                    dueTime: selectedDueTime,
                    reminderDate: selectedReminderDate,
                    reminderTime: selectedReminderTime,
                    recurrence: selectedRecurrence,
                    recurrenceDays: selectedDays,
                    cronExpression: currentCron,
                    cronHumanReadable: currentCronText,
                  });
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-500">Orario</span>
              <DateTimePicker
                mode="time"
                value={selectedDueTime}
                onChange={(value) => {
                  setSelectedDueTime(value);
                  onChange({
                    dueDate: selectedDueDate,
                    dueTime: value,
                    reminderDate: selectedReminderDate,
                    reminderTime: selectedReminderTime,
                    recurrence: selectedRecurrence,
                    recurrenceDays: selectedDays,
                    cronExpression: currentCron,
                    cronHumanReadable: currentCronText,
                  });
                }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. PROMEMORIA (REMINDER & ALERT) */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-2.5 p-3 rounded-[8px] bg-zinc-900/60 border border-white/10">
          <div className="flex items-center justify-between text-white font-semibold">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-zinc-400" />
              <span>Promemoria</span>
            </div>
            {selectedReminderDate && (
              <button
                type="button"
                onClick={clearReminder}
                className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Rimuovi</span>
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => applyQuickReminder(1)}
              className="px-2 py-0.5 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              Tra 1 ora
            </button>
            <button
              type="button"
              onClick={() => applyQuickReminder(3)}
              className="px-2 py-0.5 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              Tra 3 ore
            </button>
            <button
              type="button"
              onClick={() => applyQuickReminder(24)}
              className="px-2 py-0.5 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              Domani
            </button>
          </div>

          {/* Clean styled input row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-500">Data Avviso</span>
              <DateTimePicker
                mode="date"
                value={selectedReminderDate}
                accent="amber"
                onChange={(value) => {
                  setSelectedReminderDate(value);
                  onChange({
                    dueDate: selectedDueDate,
                    dueTime: selectedDueTime,
                    reminderDate: value || null,
                    reminderTime: selectedReminderTime,
                    recurrence: selectedRecurrence,
                    recurrenceDays: selectedDays,
                    cronExpression: currentCron,
                    cronHumanReadable: currentCronText,
                  });
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-500">Orario Avviso</span>
              <DateTimePicker
                mode="time"
                value={selectedReminderTime}
                accent="amber"
                onChange={(value) => {
                  setSelectedReminderTime(value);
                  onChange({
                    dueDate: selectedDueDate,
                    dueTime: selectedDueTime,
                    reminderDate: selectedReminderDate,
                    reminderTime: value,
                    recurrence: selectedRecurrence,
                    recurrenceDays: selectedDays,
                    cronExpression: currentCron,
                    cronHumanReadable: currentCronText,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIPETITIVITÀ & CRON JOB CONVERTER */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3 p-3.5 rounded-[12px] bg-zinc-950 border border-white/10">
        <div className="flex items-center justify-between text-white font-semibold">
          <div className="flex items-center gap-2">
            <Repeat className="w-3.5 h-3.5 text-zinc-400" />
            <span>Ripetitività Automatica Task</span>
          </div>

          {selectedRecurrence === "custom" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white border border-white/20 font-bold">
              Cron Engine Attivo
            </span>
          )}
        </div>

        <LinearSelect
          options={recurrenceOptions}
          value={selectedRecurrence}
          onChange={(val) => {
            const nextRec = val as IssueRecurrence;
            setSelectedRecurrence(nextRec);
            onChange({
              dueDate: selectedDueDate,
              dueTime: selectedDueTime,
              reminderDate: selectedReminderDate,
              reminderTime: selectedReminderTime,
              recurrence: nextRec,
              recurrenceDays: selectedDays,
              cronExpression: currentCron,
              cronHumanReadable: currentCronText,
            });
          }}
          triggerClassName="w-full justify-between py-2 px-3 bg-zinc-900 border-white/10 text-xs text-white"
        />

        {/* Weekday Selection Pills if Weekly */}
        {selectedRecurrence === "weekly" && (
          <div className="flex flex-col gap-2 p-3 rounded-[10px] bg-zinc-900/60 border border-white/5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">
              Giorni di Ripetizione Settimanale
            </span>
            <div className="flex items-center justify-between gap-1.5">
              {weekdays.map((wd) => {
                const isSelected = selectedDays.includes(wd.day);
                return (
                  <button
                    key={wd.day}
                    type="button"
                    onClick={() => handleToggleDay(wd.day)}
                    className={cn(
                      "flex-1 h-8 rounded-[8px] font-bold text-xs flex items-center justify-center transition-all cursor-pointer",
                      isSelected
                        ? "bg-white text-zinc-950 font-bold shadow-sm"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5"
                    )}
                    title={wd.full}
                  >
                    {wd.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CRON JOB BUILDER & CONVERTER if "custom" */}
        {selectedRecurrence === "custom" && (
          <div className="mt-1">
            <CronJobBuilder
              initialCron={currentCron}
              onChange={(newCron, newHuman) => {
                setCurrentCron(newCron);
                setCurrentCronText(newHuman);
                onChange({
                  dueDate: selectedDueDate,
                  dueTime: selectedDueTime,
                  reminderDate: selectedReminderDate,
                  reminderTime: selectedReminderTime,
                  recurrence: "custom",
                  recurrenceDays: selectedDays,
                  cronExpression: newCron,
                  cronHumanReadable: newHuman,
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
