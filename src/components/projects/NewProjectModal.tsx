"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Users,
  User as UserIcon,
  Calendar,
  Tag,
  GitFork,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { ProjectIconPicker } from "@/components/projects/ProjectIconPicker";
import { ProjectCoverPicker } from "@/components/projects/ProjectCoverPicker";
import { Priority, ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export const NewProjectModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeModal,
    setActiveModal,
    createProject,
    currentWorkspaceId,
    team,
    currentUser,
  } = useLinearStore();
  const router = useRouter();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Backlog");
  const [priority, setPriority] = useState<Priority>("none");
  const [targetDate, setTargetDate] = useState("");
  const [startDate, setStartDate] = useState("");

  // Superquadrato Customization
  const [icon, setIcon] = useState("L");
  const [iconBg, setIconBg] = useState("#2a0808");
  const [iconColor, setIconColor] = useState("#e53e3e");
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Cover Image / Gradient Customization
  const [coverUrl, setCoverUrl] = useState<string | null>("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80");
  const [coverGradient, setCoverGradient] = useState<string | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);

  if (activeModal !== "new_project") return null;

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProj = createProject({
      name: name.trim(),
      summary: summary.trim(),
      description: description.trim(),
      status,
      priority,
      icon,
      iconSymbol: icon,
      iconBg,
      iconColor,
      coverUrl,
      coverGradient,
      workspaceId: currentWorkspaceId,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
    });

    handleClose();
    router.push(`/project/${newProj.slug}`);
  };

  const statuses: ProjectStatus[] = ["Backlog", "Planned", "In Progress", "Completed", "Canceled"];
  const priorities: Priority[] = ["urgent", "high", "medium", "low", "none"];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in select-none"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-[720px] bg-zinc-950 border border-white/10 rounded-[16px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="h-12 px-5 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-[7px] bg-zinc-850 border border-white/10 text-white flex items-center justify-center text-[10px] font-bold">
                {team.key.substring(0, 3)}
              </div>
              <span className="text-zinc-500">{team.key}</span>
              <span className="text-zinc-600">›</span>
              <span className="font-semibold text-white">{t.modals.newProjectTitle}</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Optional Cover Banner Header */}
          <div
            className="w-full h-24 relative overflow-hidden border-b border-white/5 flex items-end p-4 group cursor-pointer"
            onClick={() => setShowCoverPicker(true)}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            ) : coverGradient ? (
              <div className="absolute inset-0 w-full h-full" style={{ background: coverGradient }} />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500 text-xs">
                {t.modals.noCover}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCoverPicker(true);
              }}
              className="relative z-10 px-3 py-1 rounded-[8px] bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <ImageIcon className="w-3 h-3 text-primary" />
              <span>{t.modals.changeCover}</span>
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-xs">
            {/* Project icon and name */}
            <div className="flex items-start gap-4">
              {/* Clickable Custom Superquadrato Badge */}
              <div className="flex flex-col items-center gap-1 group">
                <ProjectIconBadge
                  icon={icon || (name ? name.charAt(0).toUpperCase() : "L")}
                  iconBg={iconBg}
                  iconColor={iconColor}
                  name={name || "Project"}
                  size="lg"
                  onClick={() => setShowIconPicker(true)}
                  className="cursor-pointer"
                />
                <span
                  className="text-[10px] text-primary font-medium cursor-pointer"
                  onClick={() => setShowIconPicker(true)}
                >
                  Icona ▾
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder={t.modals.projectNamePlaceholder}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!icon || icon.length <= 1) {
                      setIcon(e.target.value.charAt(0).toUpperCase());
                    }
                  }}
                  autoFocus
                  className="w-full bg-transparent text-2xl font-bold text-white placeholder:text-zinc-500 focus:outline-none tracking-tight"
                />
                <input
                  type="text"
                  placeholder={t.modals.projectSummaryPlaceholder}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-400 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Property pills row */}
            <div className="flex flex-wrap items-center gap-2 py-1 text-zinc-400 border-y border-white/5">
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setStatusMenuOpen(!statusMenuOpen);
                    setPriorityMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/5 transition-colors text-xs font-normal cursor-pointer"
                >
                  <StatusIcon status={status} />
                  <span>{status}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500 ml-0.5" />
                </button>

                {statusMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-zinc-950 border border-white/10 rounded-[14px] shadow-2xl py-1 z-30 flex flex-col">
                    {statuses.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setStatus(st);
                          setStatusMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer",
                          status === st && "bg-zinc-900 text-white font-medium"
                        )}
                      >
                        <StatusIcon status={st} />
                        <span>{st}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setPriorityMenuOpen(!priorityMenuOpen);
                    setStatusMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/5 transition-colors text-xs font-normal cursor-pointer"
                >
                  <PriorityIcon priority={priority} />
                  <span className="capitalize">{priority === "none" ? "No priority" : priority}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500 ml-0.5" />
                </button>

                {priorityMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-zinc-950 border border-white/10 rounded-[14px] shadow-2xl py-1 z-30 flex flex-col">
                    {priorities.map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => {
                          setPriority(pr);
                          setPriorityMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer",
                          priority === pr && "bg-zinc-900 text-white font-medium"
                        )}
                      >
                        <PriorityIcon priority={pr} />
                        <span className="capitalize">{pr === "none" ? "No priority" : pr}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Date button */}
              <button
                type="button"
                onClick={() => {
                  const target = new Date();
                  target.setDate(target.getDate() + 30);
                  setTargetDate(target.toISOString().split("T")[0]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors text-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{targetDate ? targetDate : t.modals.targetDateLabel}</span>
              </button>

              {/* Personalize Icon button */}
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-zinc-900/80 hover:bg-zinc-800 text-primary border border-white/5 transition-colors text-xs cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{t.modals.customizeIcon}</span>
              </button>

              {/* Cover Image button */}
              <button
                type="button"
                onClick={() => setShowCoverPicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-zinc-900/80 hover:bg-zinc-800 text-emerald-400 border border-white/5 transition-colors text-xs cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t.modals.changeCover}</span>
              </button>
            </div>

            {/* Description text area */}
            <div className="min-h-[120px]">
              <textarea
                placeholder={t.modals.projectDescriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-28 bg-zinc-900/40 p-3.5 rounded-[12px] border border-white/5 text-white placeholder:text-zinc-500 resize-none focus:outline-none leading-relaxed text-xs font-normal"
              />
            </div>
          </form>

          {/* Modal Footer */}
          <div className="h-14 px-6 border-t border-white/5 bg-zinc-900/80 flex items-center justify-end gap-3">
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
              disabled={!name.trim()}
              className="px-5 py-2 rounded-[10px] bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              {t.modals.createProjectSubmit}
            </button>
          </div>
        </div>
      </div>

      {/* Project Icon Customizer Modal */}
      <ProjectIconPicker
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        icon={icon}
        iconBg={iconBg}
        iconColor={iconColor}
        projectName={name || "Nuovo Progetto"}
        onSave={(customization) => {
          setIcon(customization.icon);
          setIconBg(customization.iconBg);
          setIconColor(customization.iconColor);
        }}
      />

      {/* Project Cover Picker Modal */}
      <ProjectCoverPicker
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        currentCoverUrl={coverUrl}
        currentCoverGradient={coverGradient}
        onSave={(cover) => {
          setCoverUrl(cover.coverUrl);
          setCoverGradient(cover.coverGradient);
        }}
      />
    </>
  );
};
