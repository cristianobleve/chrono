"use client";

import React from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { CheckCircle2, X, AlertTriangle, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLinearStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case "success":
              return <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0" />;
            case "error":
              return <AlertCircle className="w-4 h-4 text-priority-urgent shrink-0" />;
            case "warning":
              return <AlertTriangle className="w-4 h-4 text-priority-high shrink-0" />;
            default:
              return <Info className="w-4 h-4 text-primary shrink-0" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 p-3 bg-surface-1 border border-hairline-strong rounded-md shadow-toast animate-slide-up text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getIcon()}
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-ink truncate">{toast.title}</span>
                {toast.description && (
                  <span className="text-ink-subtle text-[11px] truncate">{toast.description}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.actionLabel && toast.actionHref && (
                <Link
                  href={toast.actionHref}
                  className="text-primary hover:text-primary-hover font-medium text-[11px] underline underline-offset-2"
                >
                  {toast.actionLabel}
                </Link>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-tertiary hover:text-ink transition-colors p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
