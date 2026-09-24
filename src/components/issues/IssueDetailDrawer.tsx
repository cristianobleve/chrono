"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import Link from "next/link";
import {
  X,
  Trash2,
  Copy,
  Check,
  Calendar,
  Clock,
  Tag,
  Plus,
  Box,
  ArrowRight,
  UserX,
  Bell,
  Volume2,
  ExternalLink,
} from "lucide-react";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { IssueStatus, IssuePriority, IssueRecurrence } from "@/types";
import { CronJobBuilder } from "@/components/issues/CronJobBuilder";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendDesktopNotification,
  playNotificationChime,
  NotificationPermissionState,
} from "@/lib/notificationService";
import { useTranslation } from "@/i18n";


export const IssueDetailDrawer: React.FC = () => {
  const {
    selectedIssueId,
    setSelectedIssueId,
    issues,
    projects,
    accounts,
    currentUser,
    preferences,
    updateIssue,
    deleteIssue,
    addToast,
    timelineEvents,
  } = useLinearStore();

  const [copied, setCopied] = useState(false);
  const [descMode, setDescMode] = useState<"write" | "preview">("write");
  const [newLabelInput, setNewLabelInput] = useState("");
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionState>("default");
  const { t } = useTranslation();

  const issue = issues.find((i) => i.id === selectedIssueId || i.identifier === selectedIssueId);

  useEffect(() => {
    setNotifPermission(getNotificationPermissionStatus());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedIssueId) {
        setSelectedIssueId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIssueId, setSelectedIssueId]);

  const isSundayFirst = preferences?.firstDayOfWeek === "sunday";
  const weekdays = useMemo(() => {
    const lang = preferences?.language || "it";
    const names: Record<string, string[]> = {
      it: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
      en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    };
    const labels: Record<string, string[]> = {
      it: ["D", "L", "M", "M", "G", "V", "S"],
      en: ["S", "M", "T", "W", "T", "F", "S"],
      de: ["S", "M", "D", "M", "D", "F", "S"],
      fr: ["D", "L", "M", "M", "J", "V", "S"],
      es: ["D", "L", "M", "X", "J", "V", "S"],
      ru: ["В", "П", "В", "С", "Ч", "П", "С"],
    };
    const n = names[lang] || names["en"];
    const lbl = labels[lang] || labels["en"];
    const order = isSundayFirst ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];
    return order.map((d) => ({ day: d, label: lbl[d], full: n[d] }));
  }, [isSundayFirst, preferences?.language]);

  if (!issue) return null;

  const statusOptions: SelectOption[] = [
    { value: "backlog", label: t.issueDrawer.statusBacklog, icon: <StatusIcon status="backlog" /> },
    { value: "todo", label: t.issueDrawer.statusTodo, icon: <StatusIcon status="todo" /> },
    { value: "in_progress", label: t.issueDrawer.statusInProgress, icon: <StatusIcon status="in_progress" /> },
    { value: "done", label: t.issueDrawer.statusDone, icon: <StatusIcon status="done" /> },
    { value: "canceled", label: t.issueDrawer.statusCanceled, icon: <StatusIcon status="canceled" /> },
  ];

  const priorityOptions: SelectOption[] = [
    { value: "urgent", label: t.issueDrawer.priorityUrgent, icon: <PriorityIcon priority="urgent" /> },
    { value: "high", label: t.issueDrawer.priorityHigh, icon: <PriorityIcon priority="high" /> },
    { value: "medium", label: t.issueDrawer.priorityMedium, icon: <PriorityIcon priority="medium" /> },
    { value: "low", label: t.issueDrawer.priorityLow, icon: <PriorityIcon priority="low" /> },
    { value: "none", label: t.issueDrawer.priorityNone, icon: <PriorityIcon priority="none" /> },
  ];

  const projectOptions: SelectOption[] = [
    {
      value: "none",
      label: t.issueDrawer.noProject,
      icon: <Box className="w-3.5 h-3.5 text-zinc-400" />,
    },
    ...projects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: <Box className="w-3.5 h-3.5 text-zinc-300" />,
    })),
  ];

  const estimateOptions: SelectOption[] = [
    { value: "none", label: t.issueDrawer.noEstimate },
    { value: "1", label: `1 ${t.issueDrawer.estimatePoint}` },
    { value: "2", label: `2 ${t.issueDrawer.estimatePoints}` },
    { value: "3", label: `3 ${t.issueDrawer.estimatePoints}` },
    { value: "5", label: `5 ${t.issueDrawer.estimatePoints}` },
    { value: "8", label: `8 ${t.issueDrawer.estimatePoints}` },
  ];

  const assigneeOptions: SelectOption[] = [
    {
      value: "unassigned",
      label: t.issueDrawer.unassigned,
      icon: <UserX className="w-3.5 h-3.5 text-zinc-400" />,
    },
    ...accounts.map((acc) => ({
      value: acc.id,
      label: acc.name,
      icon: (
        <UserAvatar
          name={acc.name}
          avatarUrl={acc.avatarUrl}
          size="xs"
          className="w-3.5 h-3.5 rounded-[4px] text-[8px]"
        />
      ),
    })),
  ];

  const recurrenceOptions: SelectOption[] = [
    { value: "none", label: t.issueDrawer.noRecurrence },
    { value: "daily", label: t.issueDrawer.daily },
    { value: "weekly", label: t.issueDrawer.weeklyChosen },
    { value: "monthly", label: t.issueDrawer.monthly },
    { value: "custom", label: t.issueDrawer.customCron },
  ];

  const handleCopyId = () => {
    navigator.clipboard.writeText(issue.identifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ title: "Identificatore copiato negli appunti", type: "info" });
  };

  const handleAddLabel = () => {
    if (!newLabelInput.trim()) return;
    const currentLabels = issue.labels || [];
    if (!currentLabels.includes(newLabelInput.trim())) {
      updateIssue(issue.id, { labels: [...currentLabels, newLabelInput.trim()] });
    }
    setNewLabelInput("");
    setShowAddLabel(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const currentLabels = issue.labels || [];
    updateIssue(issue.id, { labels: currentLabels.filter((l) => l !== labelToRemove) });
  };

  const handleDelete = () => {
    deleteIssue(issue.id);
    setSelectedIssueId(null);
    addToast({ title: `Issue ${issue.identifier} eliminata`, type: "info" });
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === "granted") {
      playNotificationChime();
      sendDesktopNotification("Notifiche attivate", {
        body: "Riceverai avvisi desktop per scadenze e promemoria.",
      });
      addToast({
        title: "Notifiche desktop abilitate",
        type: "success",
      });
    } else if (res === "denied") {
      addToast({
        title: "Permesso notifiche rifiutato",
        description: "Abilita le notifiche dalle impostazioni del browser.",
        type: "warning",
      });
    }
  };

  const handleTestNotification = () => {
    playNotificationChime();
    sendDesktopNotification("Test notifica", {
      body: "Avviso sonoro e notifica desktop attivi.",
    });
    addToast({
      title: "Audio chime riprodotto",
      type: "info",
    });
  };

  const applyQuickDueDate = (offsetDays: number, timeStr: string = "18:00") => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split("T")[0];
    updateIssue(issue.id, {
      dueDate: dateStr,
      dueTime: timeStr,
    });
  };

  const applyQuickReminder = (offsetHours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    const dateStr = d.toISOString().split("T")[0];
    const timeStr = d.toTimeString().slice(0, 5);
    updateIssue(issue.id, {
      reminderDate: dateStr,
      reminderTime: timeStr,
    });
  };

  const handleToggleRecurrenceDay = (day: number) => {
    const cur = issue.recurrenceDays || [];
    const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
    updateIssue(issue.id, {
      recurrenceDays: next,
    });
  };

  const issueEvents = (timelineEvents || []).filter(
    (e) => e.entityId === issue.id || e.entityIdentifier === issue.identifier
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-[4px] animate-fade-in select-none">
      {/* Click outside backdrop */}
      <div
        className="flex-1 h-full cursor-pointer"
        onClick={() => setSelectedIssueId(null)}
      />

      {/* Slide-over Drawer Panel: Linear/Plane wide 2-column layout */}
      <aside className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl h-full bg-[#0c0d0e] border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-slide-up text-xs z-50">
        {/* Drawer Header */}
        <header className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-[#0c0d0e] shrink-0">
          <div className="flex items-center gap-2.5">
            <InternalIdBadge
              id={issue.identifier}
              internalId={issue.internalId || issue.id}
              size="sm"
            />
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300 font-medium text-xs truncate max-w-[280px]">
              {issue.project ? issue.project.name : "Workspace"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyId}
              className="px-2.5 py-1.5 rounded-[6px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
              title={t.issueDrawer.copyId}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-xs">{copied ? t.issueDrawer.copied : t.issueDrawer.copyId}</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded-[6px] text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedIssueId(null)}
              className="p-1.5 rounded-[6px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2-Column Responsive Body */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT COLUMN: Main Issue Content (Title, Description, Activity) */}
          <div className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8 flex flex-col gap-8">
            {/* Title */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={issue.title}
                onChange={(e) => updateIssue(issue.id, { title: e.target.value })}
                placeholder={t.modals.issueTitlePlaceholder}
                className="w-full bg-transparent text-2xl font-bold font-heading text-white placeholder:text-zinc-600 focus:outline-none border-b border-transparent focus:border-white/15 pb-2 transition-colors select-text tracking-tight"
              />
            </div>

            {/* Description Section with Write / Preview Tabs */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {t.issueDrawer.description}
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-[6px] bg-zinc-900 border border-white/10 text-[11px]">
                  <button
                    onClick={() => setDescMode("write")}
                    className={cn(
                      "px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer",
                      descMode === "write"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {t.issueDrawer.writeTab}
                  </button>
                  <button
                    onClick={() => setDescMode("preview")}
                    className={cn(
                      "px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer",
                      descMode === "preview"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {t.issueDrawer.previewTab}
                  </button>
                </div>
              </div>

              {descMode === "write" ? (
                <textarea
                  value={issue.description || ""}
                  onChange={(e) => updateIssue(issue.id, { description: e.target.value })}
                  placeholder={t.modals.issueDescriptionPlaceholder}
                  rows={10}
                  className="w-full min-h-[220px] p-4 rounded-[8px] bg-white/[0.02] border border-white/10 focus:border-white/20 text-white text-sm leading-relaxed resize-y focus:outline-none select-text placeholder:text-zinc-600 font-sans"
                />
              ) : (
                <div className="p-4 rounded-[8px] bg-white/[0.02] border border-white/10 min-h-[220px] text-sm text-zinc-200 leading-relaxed overflow-y-auto">
                  {issue.description ? (
                    <MarkdownContent content={issue.description} />
                  ) : (
                    <span className="text-zinc-600 italic">{t.issueDrawer.noDescription}</span>
                  )}
                </div>
              )}
            </div>

            {/* Timeline / Activity Section */}
            <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.issueDrawer.changeHistory}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {issueEvents.length} {issueEvents.length === 1 ? t.issueDrawer.event : t.issueDrawer.events}
                </span>
              </div>

              {issueEvents.length === 0 ? (
                <div className="p-4 rounded-[8px] bg-white/[0.02] border border-white/5 text-center text-xs text-zinc-500">
                  {t.issueDrawer.noChanges}
                </div>
              ) : (
                <div className="space-y-2">
                  {issueEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-[8px] bg-white/[0.02] border border-white/5 flex flex-col gap-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 text-white border border-white/10 flex items-center justify-center text-[10px] font-bold">
                            {evt.authorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white text-xs">{evt.authorName}</span>
                        </div>
                        <span
                          className="text-[10px] font-mono text-zinc-500"
                          title={new Date(evt.timestamp).toLocaleString("it-IT")}
                        >
                          {new Date(evt.timestamp).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{evt.description}</p>

                      {evt.diff && evt.diff.length > 0 && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 pt-0.5 flex-wrap">
                          {evt.diff.map((d, i) => (
                            <span key={i} className="flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                              <span>{d.label || d.field}:</span>
                              <span className="line-through text-zinc-500">{String(d.oldValue)}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-zinc-400" />
                              <span className="text-white font-medium">{String(d.newValue)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Properties, Labels, and Scheduling Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#090a0b] flex flex-col overflow-y-auto p-5 gap-6 select-none">
            {/* Core Properties */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                {t.issueDrawer.properties}
              </span>

              <div className="flex flex-col gap-2.5">
                {/* Status */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 w-24 shrink-0 font-medium">{t.issueDrawer.status}</span>
                  <div className="flex-1 min-w-0">
                    <LinearSelect
                      options={statusOptions}
                      value={issue.status}
                      onChange={(val) => updateIssue(issue.id, { status: val as IssueStatus })}
                      fullWidth
                      size="sm"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 w-24 shrink-0 font-medium">{t.issueDrawer.priority}</span>
                  <div className="flex-1 min-w-0">
                    <LinearSelect
                      options={priorityOptions}
                      value={issue.priority}
                      onChange={(val) => updateIssue(issue.id, { priority: val as IssuePriority })}
                      fullWidth
                      size="sm"
                    />
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 w-24 shrink-0">
                    <span className="text-xs text-zinc-400 font-medium">{t.issueDrawer.assignee}</span>
                    {issue.assigneeId && issue.assigneeId !== "unassigned" && (
                      <Link
                        href={`/u/@${accounts.find((a) => a.id === issue.assigneeId)?.username || issue.assigneeId}`}
                        className="text-zinc-500 hover:text-white transition-colors"
                        title="Vedi profilo membro"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <LinearSelect
                      options={assigneeOptions}
                      value={issue.assigneeId || "unassigned"}
                      onChange={(val) => {
                        const assignedAcc = accounts.find((a) => a.id === val);
                        updateIssue(issue.id, {
                          assigneeId: val === "unassigned" ? null : val,
                          assignee:
                            val === "unassigned"
                              ? null
                              : assignedAcc
                              ? {
                                  id: assignedAcc.id,
                                  name: assignedAcc.name,
                                  email: assignedAcc.email,
                                  username: assignedAcc.username,
                                  avatarUrl: assignedAcc.avatarUrl || undefined,
                                }
                              : currentUser,
                        });
                      }}
                      fullWidth
                      size="sm"
                    />
                  </div>
                </div>

                {/* Project */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 w-24 shrink-0 font-medium">{t.issueDrawer.project}</span>
                  <div className="flex-1 min-w-0">
                    <LinearSelect
                      options={projectOptions}
                      value={issue.projectId || "none"}
                      onChange={(val) => {
                        const proj = projects.find((p) => p.id === val);
                        updateIssue(issue.id, {
                          projectId: val === "none" ? null : val,
                          project: proj || null,
                        });
                      }}
                      fullWidth
                      size="sm"
                    />
                  </div>
                </div>

                {/* Estimate */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400 w-24 shrink-0 font-medium">{t.issueDrawer.estimate}</span>
                  <div className="flex-1 min-w-0">
                    <LinearSelect
                      options={estimateOptions}
                      value={issue.estimate ? String(issue.estimate) : "none"}
                      onChange={(val) =>
                        updateIssue(issue.id, {
                          estimate: val === "none" ? undefined : parseInt(val, 10),
                        })
                      }
                      fullWidth
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-white/5" />

            {/* Labels Manager */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-zinc-400" />
                  <span>{t.issueDrawer.labels}</span>
                </div>
                <button
                  onClick={() => setShowAddLabel(!showAddLabel)}
                  className="text-zinc-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t.issueDrawer.addLabel}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(issue.labels || []).length === 0 && !showAddLabel && (
                  <span className="text-xs text-zinc-600 italic">{t.issueDrawer.noLabels}</span>
                )}
                {(issue.labels || []).map((lbl, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] bg-zinc-900 border border-white/10 text-zinc-300 text-xs"
                  >
                    <span>{lbl}</span>
                    <button
                      onClick={() => handleRemoveLabel(lbl)}
                      className="text-zinc-500 hover:text-white ml-0.5 cursor-pointer"
                      title="Rimuovi etichetta"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {showAddLabel && (
                  <div className="flex items-center gap-1.5 w-full pt-1">
                    <input
                      type="text"
                      value={newLabelInput}
                      onChange={(e) => setNewLabelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddLabel();
                        }
                      }}
                      placeholder="Nuovo tag..."
                      autoFocus
                      className="flex-1 px-2.5 py-1 rounded-[6px] bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                    />
                    <button
                      onClick={handleAddLabel}
                      className="px-2.5 py-1 rounded-[6px] bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Salva
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-white/5" />

            {/* Scheduling, Due Date & Recurrence Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  <span>Pianificazione</span>
                </div>

                {notifPermission === "granted" ? (
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
                    title="Test audio notifica"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="text-zinc-400 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Abilita notifiche desktop"
                  >
                    <Bell className="w-3 h-3" />
                    <span>{t.issueDrawer.enableAlerts}</span>
                  </button>
                )}
              </div>

              {/* Due Date & Time */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium">{t.issueDrawer.dueDate}</span>
                  {issue.dueDate && (
                    <button
                      type="button"
                      onClick={() => updateIssue(issue.id, { dueDate: null, dueTime: null })}
                      className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>{t.issueDrawer.remove}</span>
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyQuickDueDate(0, "18:00")}
                    className="px-2 py-0.5 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {t.issueDrawer.today}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickDueDate(1, "18:00")}
                    className="px-2 py-0.5 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {t.issueDrawer.tomorrow}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickDueDate(7, "18:00")}
                    className="px-2 py-0.5 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {t.issueDrawer.plusWeek}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DateTimePicker mode="date" value={issue.dueDate || ""} onChange={(value) => updateIssue(issue.id, { dueDate: value || null })} />
                  <DateTimePicker mode="time" value={issue.dueTime || ""} onChange={(value) => updateIssue(issue.id, { dueTime: value || null })} />
                </div>
              </div>

              {/* Reminder Date & Time */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium">{t.issueDrawer.reminder}</span>
                  {issue.reminderDate && (
                    <button
                      type="button"
                      onClick={() => updateIssue(issue.id, { reminderDate: null, reminderTime: null })}
                      className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>{t.issueDrawer.remove}</span>
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyQuickReminder(1)}
                    className="px-2 py-0.5 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {t.issueDrawer.plusHour}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickReminder(3)}
                    className="px-2 py-0.5 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {t.issueDrawer.plusThreeHours}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickReminder(24)}
                    className="px-2 py-0.5 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    {t.issueDrawer.tomorrow}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DateTimePicker mode="date" value={issue.reminderDate || ""} accent="amber" onChange={(value) => updateIssue(issue.id, { reminderDate: value || null })} />
                  <DateTimePicker mode="time" value={issue.reminderTime || ""} accent="amber" onChange={(value) => updateIssue(issue.id, { reminderTime: value || null })} />
                </div>
              </div>

              {/* Recurrence & Cron */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium">{t.issueDrawer.recurrence}</span>
                  {issue.cronExpression && (
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10">
                      {issue.cronExpression}
                    </span>
                  )}
                </div>

                <LinearSelect
                  options={recurrenceOptions}
                  value={issue.recurrence || "none"}
                  onChange={(val) => {
                    const nextRec = val as IssueRecurrence;
                    updateIssue(issue.id, { recurrence: nextRec });
                  }}
                  fullWidth
                  size="sm"
                />

                {issue.recurrence === "weekly" && (
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {weekdays.map((wd) => {
                      const isSelected = (issue.recurrenceDays || []).includes(wd.day);
                      return (
                        <button
                          key={wd.day}
                          type="button"
                          onClick={() => handleToggleRecurrenceDay(wd.day)}
                          className={cn(
                            "flex-1 h-7 rounded-[4px] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer",
                            isSelected
                              ? "bg-white text-zinc-950 font-bold"
                              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5"
                          )}
                          title={wd.full}
                        >
                          {wd.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {issue.recurrence === "custom" && (
                  <div className="pt-2">
                    <CronJobBuilder
                      initialCron={issue.cronExpression}
                      onChange={(cron, human) => {
                        updateIssue(issue.id, {
                          cronExpression: cron,
                          cronHumanReadable: human,
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
