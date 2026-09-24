"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  X,
  Plus,
  User as UserIcon,
  Calendar,
  Tag,
  Box,
  UserX,
} from "lucide-react";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { IssueStatus, Priority, IssueRecurrence } from "@/types";
import { RecurrenceReminderPicker } from "@/components/issues/RecurrenceReminderPicker";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export const NewIssueModal: React.FC = () => {
  const { t } = useTranslation();
  const { activeModal, setActiveModal, createIssue, projects, team, accounts, currentUser, getUserDisplayName } = useLinearStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("todo");
  const [priority, setPriority] = useState<Priority>("none");
  const [projectId, setProjectId] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [labels, setLabels] = useState<string[]>(["Frontend"]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [reminderDate, setReminderDate] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<IssueRecurrence>("none");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (activeModal !== "new_issue") return null;

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedAcc = accounts.find((a) => a.id === assigneeId);

    createIssue({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId: projectId || null,
      dueDate,
      dueTime,
      reminderDate,
      reminderTime,
      recurrence,
      recurrenceDays,
      assigneeId: assigneeId === "unassigned" ? null : assigneeId,
      assignee:
        assigneeId === "unassigned"
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
      labels,
    });

    handleClose();
  };

  const statusOptions: SelectOption[] = [
    { value: "backlog", label: t.issues.backlog, icon: <StatusIcon status="backlog" /> },
    { value: "todo", label: t.issues.todo, icon: <StatusIcon status="todo" /> },
    { value: "in_progress", label: t.issues.inProgress, icon: <StatusIcon status="in_progress" /> },
    { value: "done", label: t.issues.done, icon: <StatusIcon status="done" /> },
    { value: "canceled", label: t.issues.canceled, icon: <StatusIcon status="canceled" /> },
  ];

  const priorityOptions: SelectOption[] = [
    { value: "urgent", label: t.issues.urgent, icon: <PriorityIcon priority="urgent" /> },
    { value: "high", label: t.issues.high, icon: <PriorityIcon priority="high" /> },
    { value: "medium", label: t.issues.medium, icon: <PriorityIcon priority="medium" /> },
    { value: "low", label: t.issues.low, icon: <PriorityIcon priority="low" /> },
    { value: "none", label: t.modals.noProject === "No project" ? "No priority" : "Nessuna priorità", icon: <PriorityIcon priority="none" /> },
  ];

  const assigneeOptions: SelectOption[] = [
    {
      value: "unassigned",
      label: t.modals.unassigned,
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

  const projectOptions: SelectOption[] = [
    {
      value: "",
      label: t.modals.noProject,
      icon: <Box className="w-3.5 h-3.5 text-ink-tertiary" />,
    },
    ...projects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: <Box className="w-3.5 h-3.5 text-primary" />,
    })),
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[680px] bg-zinc-950 border border-white/10 rounded-[16px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-5 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[7px] bg-zinc-850 border border-white/10 text-white flex items-center justify-center text-[10px] font-bold">
              {team.key}
            </div>
            <span className="text-zinc-500">{team.key}</span>
            <span className="text-zinc-600">›</span>
            <span className="font-semibold text-white">{t.modals.newIssueTitle}</span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 text-xs">
          <input
            type="text"
            placeholder={t.modals.issueTitlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-xl font-bold text-white placeholder:text-zinc-500 focus:outline-none tracking-tight"
          />

          <textarea
            placeholder={t.modals.issueDescriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 bg-zinc-900/40 p-3.5 rounded-[12px] border border-white/5 text-white placeholder:text-zinc-500 resize-none focus:outline-none leading-relaxed text-xs font-normal"
          />

          {/* Properties row with Standard LinearSelect */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            {/* Status Selector */}
            <LinearSelect
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as IssueStatus)}
              size="sm"
            />

            {/* Priority Selector */}
            <LinearSelect
              options={priorityOptions}
              value={priority}
              onChange={(val) => setPriority(val as Priority)}
              size="sm"
            />

            {/* Assignee Selector with Profile Icons */}
            <LinearSelect
              options={assigneeOptions}
              value={assigneeId}
              onChange={setAssigneeId}
              size="sm"
            />

            {/* Project Selector with Custom Logo, Truncation & Search Bar */}
            <LinearSelect
              options={projectOptions}
              value={projectId}
              onChange={setProjectId}
              placeholder={t.modals.selectProject}
              searchable={true}
              size="sm"
              triggerClassName="max-w-[200px]"
            />

            {/* Recurrence & Due Date Trigger */}
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={cn(
                "h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer",
                dueDate || recurrence !== "none"
                  ? "bg-[#202227] border-white/30 text-white shadow-sm ring-1 ring-white/10"
                  : "bg-[#18191d] hover:bg-[#202227] text-zinc-300 hover:text-white border-white/10 hover:border-white/20"
              )}
            >
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                {dueDate ? `${t.modals.dueDatePrefix} ${dueDate}` : t.modals.dueAndRecurrence}
              </span>
            </button>
          </div>

          {/* Recurrence & Reminder Picker Panel */}
          {showDatePicker && (
            <div className="pt-2 animate-slide-down">
              <RecurrenceReminderPicker
                dueDate={dueDate}
                dueTime={dueTime}
                reminderDate={reminderDate}
                reminderTime={reminderTime}
                recurrence={recurrence}
                recurrenceDays={recurrenceDays}
                onChange={(data) => {
                  setDueDate(data.dueDate);
                  setDueTime(data.dueTime || null);
                  setReminderDate(data.reminderDate || null);
                  setReminderTime(data.reminderTime || null);
                  setRecurrence(data.recurrence || "none");
                  setRecurrenceDays(data.recurrenceDays || []);
                }}
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="h-14 px-6 border-t border-white/5 bg-zinc-900/80 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            {t.modals.assignedTo} <span className="text-white font-medium">{getUserDisplayName(currentUser)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-[10px] bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim()}
              className="px-5 py-2 rounded-[10px] bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              {t.modals.createIssueSubmit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
