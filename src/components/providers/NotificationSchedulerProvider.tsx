"use client";

import React, { useEffect, useRef } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  sendDesktopNotification,
  playNotificationChime,
  getNotificationPermissionStatus,
} from "@/lib/notificationService";

export const NotificationSchedulerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const issues = useLinearStore((s) => s.issues);
  const addToast = useLinearStore((s) => s.addToast);
  const setSelectedIssueId = useLinearStore((s) => s.setSelectedIssueId);
  const notifiedRemindersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check every 30 seconds for due reminders and notifications
    const interval = setInterval(() => {
      if (typeof window === "undefined") return;

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const currentTimeStr = now.toTimeString().slice(0, 5); // "HH:MM"

      issues.forEach((issue) => {
        // Skip completed or canceled issues
        if (issue.status === "done" || issue.status === "canceled") return;

        // 1. Check Reminder Date & Time
        if (issue.reminderDate) {
          const reminderKey = `reminder-${issue.id}-${issue.reminderDate}-${issue.reminderTime || "09:00"}`;
          if (notifiedRemindersRef.current.has(reminderKey)) return;

          // Check if due
          const isToday = issue.reminderDate === todayStr;
          const isPastDate = issue.reminderDate < todayStr;
          const isTimeDue = !issue.reminderTime || issue.reminderTime <= currentTimeStr;

          if (isPastDate || (isToday && isTimeDue)) {
            notifiedRemindersRef.current.add(reminderKey);

            // Trigger sound
            playNotificationChime();

            // Trigger Desktop OS Notification
            sendDesktopNotification(`⏰ Promemoria: ${issue.identifier}`, {
              body: `${issue.title}\nPriorità: ${issue.priority.toUpperCase()}`,
              onClick: () => {
                setSelectedIssueId(issue.id);
              },
            });

            // Trigger In-App Toast
            addToast({
              title: `⏰ Promemoria: ${issue.identifier}`,
              description: issue.title,
              actionLabel: "Apri Issue",
              actionHref: `/issues`,
              type: "warning",
            });
          }
        }

        // 2. Check Due Date & Time expiration
        if (issue.dueDate) {
          const dueKey = `due-${issue.id}-${issue.dueDate}-${issue.dueTime || "18:00"}`;
          if (notifiedRemindersRef.current.has(dueKey)) return;

          const isToday = issue.dueDate === todayStr;
          const isTimeDue = issue.dueTime && issue.dueTime <= currentTimeStr;

          if (isToday && isTimeDue) {
            notifiedRemindersRef.current.add(dueKey);

            playNotificationChime();

            sendDesktopNotification(`Scadenza raggiunta: ${issue.identifier}`, {
              body: `La task "${issue.title}" è in scadenza adesso.`,
              onClick: () => {
                setSelectedIssueId(issue.id);
              },
            });

            addToast({
              title: `Scadenza Task: ${issue.identifier}`,
              description: `"${issue.title}" scade adesso.`,
              actionLabel: "Vedi Task",
              actionHref: `/issues`,
              type: "warning",
            });
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [issues, addToast, setSelectedIssueId]);

  return <>{children}</>;
};
