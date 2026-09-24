"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLinearStore } from "@/store/useLinearStore";
import { Plus, SlidersHorizontal, ChevronRight, UploadCloud } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumbs, actions }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { setActiveModal } = useLinearStore();

  return (
    <header className="h-11 px-4 border-b border-hairline bg-canvas flex items-center justify-between shrink-0 text-xs select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-ink-subtle">
        {breadcrumbs ? (
          breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-tertiary" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-ink transition-colors font-medium text-ink-muted"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{crumb.label}</span>
              )}
            </React.Fragment>
          ))
        ) : (
          <span className="font-semibold text-ink text-[13px]">
            {title || "Chrono"}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {actions ? (
          actions
        ) : (
          <>
            <button
              onClick={() => setActiveModal("import_project")}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-surface-1 hover:bg-surface-2 text-ink-subtle hover:text-ink border border-hairline rounded-md transition-colors text-xs font-medium"
              title={t.projects.importProject}
            >
              <UploadCloud className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.projectsList.importMd}</span>
            </button>

            <button
              onClick={() => setActiveModal("new_project")}
              className="flex items-center gap-1 px-2.5 py-1 bg-surface-1 hover:bg-surface-2 text-ink border border-hairline hover:border-hairline-strong rounded-md transition-colors text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 text-ink-subtle" />
              <span>{t.projects.newProject}</span>
              <span className="kbd-shortcut ml-1 text-[10px]">N then P</span>
            </button>

            <button
              onClick={() => setActiveModal("command_menu")}
              className="p-1.5 text-ink-subtle hover:text-ink hover:bg-surface-2 rounded transition-colors"
              title={t.commandMenu.actions}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
