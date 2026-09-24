"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useLinearStore } from "@/store/useLinearStore";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Box,
  CheckSquare,
  Plus,
  Settings,
  Search,
  SlidersHorizontal,
  Home,
  User,
  Zap,
  UploadCloud,
  Trash2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { useTranslation } from "@/i18n";

export const CommandMenu: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    projects,
    issues,
    setSelectedIssueId,
    setTimelineDrawerOpen,
  } = useLinearStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setOpen(activeModal === "command_menu");
  }, [activeModal]);

  const handleClose = () => {
    setActiveModal(null);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[4px] flex items-start justify-center pt-[15vh] px-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-xs select-none animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Menu" className="w-full flex flex-col">
          {/* Search bar input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-zinc-900/80 backdrop-blur-md">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <Command.Input
              placeholder={t.commandMenu.searchPlaceholder}
              className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none text-[13px]"
              autoFocus
            />
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[10px]">ESC</span>
          </div>

          {/* Results list */}
          <Command.List className="max-h-80 overflow-y-auto p-2 flex flex-col gap-0.5">
            <Command.Empty className="py-6 text-center text-zinc-500 text-xs">
              {t.commandMenu.noResults}
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading={<span className="px-2 py-1 text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">{t.commandMenu.actions}</span>}>
              <Command.Item
                onSelect={() => {
                  handleClose();
                  setActiveModal("new_issue");
                }}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.commandMenu.newIssue}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[10px]">C</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  setActiveModal("new_project");
                }}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.commandMenu.newProject}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[10px]">N P</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  setActiveModal("import_project");
                }}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.commandMenu.importProject}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[10px]">I</span>
              </Command.Item>
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading={<span className="px-2 py-1 text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">{t.commandMenu.navigation}</span>}>
              <Command.Item
                onSelect={() => {
                  handleClose();
                  router.push("/agent");
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Vai a Chrono Agent</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  router.push("/projects");
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <Box className="w-3.5 h-3.5 text-zinc-500" />
                <span>Vai ai Progetti</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  router.push("/issues");
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
                <span>Vai a Issues</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  setTimelineDrawerOpen(true);
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Apri Cronologia Rapida (Timeline Drawer)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  router.push("/timeline");
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vai a Cronoprogramma & Audit Storico</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  router.push("/settings/preferences");
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-500" />
                <span>Vai a Impostazioni & Preferenze</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  handleClose();
                  router.push("/trash");
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Vai al Cestino</span>
              </Command.Item>
            </Command.Group>

            {/* Projects list */}
            {projects.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1 text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">Progetti</span>}>
                {projects.map((proj) => (
                  <Command.Item
                    key={proj.id}
                    onSelect={() => {
                      handleClose();
                      router.push(`/project/${proj.slug}`);
                    }}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <StatusIcon status={proj.status} />
                      <span className="truncate font-medium text-white">{proj.name}</span>
                      {proj.summary && (
                        <span className="text-zinc-500 truncate text-[11px]">
                          {proj.summary}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 shrink-0">Progetto</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Issues list */}
            {issues.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1 text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">Issue</span>}>
                {issues.map((issue) => (
                  <Command.Item
                    key={issue.id}
                    onSelect={() => {
                      handleClose();
                      setSelectedIssueId(issue.id);
                    }}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <PriorityIcon priority={issue.priority} />
                      <span
                        className="font-mono text-[11px] text-zinc-400"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {issue.identifier}
                      </span>
                      <span className="truncate text-white">{issue.title}</span>
                    </div>
                    <StatusIcon status={issue.status} />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer toolbar info */}
          <div className="px-4 py-2.5 border-t border-white/5 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-3">
              <span>Naviga <span className="px-1 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[9px]">↑</span> <span className="px-1 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[9px]">↓</span></span>
              <span>Seleziona <span className="px-1 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-mono text-[9px]">↵</span></span>
            </div>
            <span>Chrono Command Palette</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
