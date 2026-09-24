"use client";

import React, { useState } from "react";
import { Project, ProjectLink, ProjectStatus, IssuePriority, Milestone } from "@/types";
import { useLinearStore } from "@/store/useLinearStore";
import {
  X,
  Settings,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  Github,
  Figma,
  FileText,
  Layers,
  Calendar,
  User as UserIcon,
  Sparkles,
  Check,
  Palette,
  Image as ImageIcon,
  AlertTriangle,
  FolderGit2,
  Clock,
  Shield,
  Tag,
} from "lucide-react";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { useRouter } from "next/navigation";
import { cn, sortMilestones } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export function detectLinkCategory(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) return "github";
  if (lower.includes("gitlab.com")) return "gitlab";
  if (lower.includes("figma.com")) return "figma";
  if (lower.includes("docs.") || lower.includes("notion.so") || lower.includes("gitbook.io") || lower.includes("readme.io")) return "docs";
  if (lower.includes("x.com") || lower.includes("twitter.com")) return "twitter";
  if (lower.includes("discord.gg") || lower.includes("discord.com")) return "discord";
  return "web";
}

export function getLinkIcon(category?: string) {
  switch (category) {
    case "github":
    case "gitlab":
      return <FolderGit2 className="w-3.5 h-3.5 text-ink" />;
    case "figma":
      return <Figma className="w-3.5 h-3.5 text-[#f24e1e]" />;
    case "docs":
      return <FileText className="w-3.5 h-3.5 text-zinc-300" />;
    default:
      return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
  }
}

interface ProjectSettingsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onOpenIconPicker?: () => void;
  onOpenCoverPicker?: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenIconPicker,
  onOpenCoverPicker,
}) => {
  const { t } = useTranslation();
  const { projects, team, updateProject, deleteProject, currentUser, addToast, getUserDisplayName } =
    useLinearStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "general" | "milestones" | "members" | "links" | "cv" | "relations" | "danger"
  >("general");

  const [name, setName] = useState(project.name);
  const [slug, setSlug] = useState(project.slug || "");
  const [summary, setSummary] = useState(project.summary || "");
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ProjectStatus>(project.status || "Planned");
  const [priority, setPriority] = useState<IssuePriority>(project.priority || "high");
  const [startDate, setStartDate] = useState(project.startDate || "");
  const [targetDate, setTargetDate] = useState(project.targetDate || "");
  const [parentProjectId, setParentProjectId] = useState<string | null>(project.parentProjectId || null);
  const [relatedProjectIds, setRelatedProjectIds] = useState<string[]>(project.relatedProjectIds || []);

  const [milestones, setMilestones] = useState<Milestone[]>(sortMilestones(project.milestones || []));
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  const [links, setLinks] = useState<ProjectLink[]>(project.links || []);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState<ProjectLink["category"]>("web");

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const otherProjects = projects.filter((p) => p.id !== project.id);

  const statusOptions: SelectOption[] = [
    { value: "Planned", label: `${t.projects.planned} (To Do)`, icon: <StatusIcon status="todo" />, toneClassName: "text-zinc-200" },
    { value: "In Progress", label: t.projects.inProgress, icon: <StatusIcon status="in_progress" />, toneClassName: "text-amber-300" },
    { value: "Completed", label: `${t.projects.completed} (Done)`, icon: <StatusIcon status="done" />, toneClassName: "text-emerald-300" },
    { value: "Backlog", label: t.projects.backlog, icon: <StatusIcon status="backlog" />, toneClassName: "text-sky-300" },
    { value: "Canceled", label: t.projects.canceled, icon: <StatusIcon status="canceled" />, toneClassName: "text-red-300" },
  ];

  const priorityOptions: SelectOption[] = [
    { value: "urgent", label: t.issueDrawer.priorityUrgent, icon: <PriorityIcon priority="urgent" /> },
    { value: "high", label: t.issueDrawer.priorityHigh, icon: <PriorityIcon priority="high" /> },
    { value: "medium", label: t.issueDrawer.priorityMedium, icon: <PriorityIcon priority="medium" /> },
    { value: "low", label: t.issueDrawer.priorityLow, icon: <PriorityIcon priority="low" /> },
    { value: "none", label: t.issueDrawer.priorityNone, icon: <PriorityIcon priority="none" /> },
  ];

  const parentProjectOptions: SelectOption[] = [
    { value: "none", label: "Nessuno (Progetto Standalone)", icon: <Globe className="w-3.5 h-3.5 text-zinc-500" /> },
    ...otherProjects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: <ProjectIconBadge project={p} size="sm" />,
    })),
  ];

  const leadOptions: SelectOption[] = [
    {
      value: currentUser.id,
      label: `${getUserDisplayName(currentUser)} (${currentUser.username || "me"})`,
      icon: <div className="w-4 h-4 rounded-full bg-zinc-800 text-white border border-white/10 flex items-center justify-center text-[9px] font-bold">CB</div>,
    },
  ];

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as ProjectStatus);
    updateProject(project.id, { status: newStatus as ProjectStatus });
    addToast({
      title: "Stato Progetto Aggiornato",
      description: `Il progetto è ora in stato ${newStatus}`,
      type: "success",
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority as IssuePriority);
    updateProject(project.id, { priority: newPriority as IssuePriority });
    addToast({
      title: "Priorità Aggiornata",
      description: `Priorità impostata su ${newPriority.toUpperCase()}`,
      type: "info",
    });
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const category = detectLinkCategory(formattedUrl);
    let title = newLinkTitle.trim();
    if (!title) {
      try {
        const domain = new URL(formattedUrl).hostname.replace(/^www\./, "");
        title = category !== "web" ? category.toUpperCase() : domain;
      } catch {
        title = "Collegamento Esterno";
      }
    }

    const newLink: ProjectLink = {
      id: `link-${Date.now()}`,
      title,
      url: formattedUrl,
      category,
    };

    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    setNewLinkTitle("");
    setNewLinkUrl("");

    updateProject(project.id, { links: updatedLinks });
    addToast({
      title: "Link aggiunto",
      description: `${title} aggiunto al CV del progetto`,
      type: "success",
    });
  };

  const handleRemoveLink = (linkId: string) => {
    const updated = links.filter((l) => l.id !== linkId);
    setLinks(updated);
    updateProject(project.id, { links: updated });
    addToast({ title: "Link rimosso", type: "info" });
  };

  const handleToggleRelatedProject = (otherProjId: string) => {
    let updated: string[];
    if (relatedProjectIds.includes(otherProjId)) {
      updated = relatedProjectIds.filter((id) => id !== otherProjId);
    } else {
      updated = [...relatedProjectIds, otherProjId];
    }
    setRelatedProjectIds(updated);
    updateProject(project.id, { relatedProjectIds: updated });
  };

  const handleSaveGeneral = () => {
    updateProject(project.id, {
      name,
      summary,
      description,
      status,
      priority,
      targetDate: targetDate || null,
      startDate: startDate || null,
      parentProjectId: parentProjectId === "none" ? null : parentProjectId,
      relatedProjectIds,
      links,
    });
    addToast({
      title: "Impostazioni Progetto Salvate",
      description: "Tutti i dati e collegamenti sono stati aggiornati con successo.",
      type: "success",
    });
    onClose();
  };

  const handleDeleteProject = () => {
    deleteProject(project.id);
    addToast({
      title: "Progetto eliminato",
      description: `Il progetto ${project.name} è stato rimosso.`,
      type: "info",
    });
    onClose();
    router.push("/projects");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[4px] p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Matching Platform Settings) */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-zinc-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <ProjectIconBadge project={project} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight font-heading">
                  {project.name}
                </h2>
                <InternalIdBadge
                  id={project.identifier || "PRJ-1"}
                  internalId={project.internalId || project.id}
                  size="xs"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Impostazioni generali, CV, collegamenti e relazioni del progetto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Matching User/Platform Settings) */}
        <div className="px-6 py-2.5 bg-zinc-950 border-b border-white/5 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer",
              activeTab === "general"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Generale</span>
          </button>

          <button
            onClick={() => setActiveTab("cv")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer",
              activeTab === "cv"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Brief & CV</span>
          </button>

          <button
            onClick={() => setActiveTab("links")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer",
              activeTab === "links"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Collegamenti ({links.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("relations")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer",
              activeTab === "relations"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Associazioni ({relatedProjectIds.length + (parentProjectId && parentProjectId !== "none" ? 1 : 0)})</span>
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ml-auto",
              activeTab === "danger"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-zinc-400 hover:text-rose-400"
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Elimina</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <div className="flex flex-col gap-6">
              {/* Identity & Visual Branding Card */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                  Identità & Branding
                </h3>
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ProjectIconBadge project={project} size="lg" />
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm font-heading">{project.name}</span>
                      <span className="text-[11px] text-zinc-400 mt-0.5">
                        {project.slug}.{team.key.toLowerCase()}.chrono.engineering
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenIconPicker && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenIconPicker();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Palette className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Icona</span>
                      </button>
                    )}

                    {onOpenCoverPicker && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCoverPicker();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copertina</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Summary */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                  Dati Principali
                </h3>
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      Nome Progetto
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      Sommario Esecutivo (Pitch sintetico)
                    </label>
                    <input
                      type="text"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Obiettivo principale del progetto..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Status, Priority & Dates (Using Custom LinearSelect) */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                  Stato, Priorità & Roadmap
                </h3>
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status with LinearSelect */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      Stato del Progetto
                    </label>
                    <LinearSelect
                      options={statusOptions}
                      value={status}
                      onChange={handleStatusChange}
                      fullWidth
                      size="md"
                    />
                  </div>

                  {/* Priority with LinearSelect */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      Priorità
                    </label>
                    <LinearSelect
                      options={priorityOptions}
                      value={priority}
                      onChange={handlePriorityChange}
                      fullWidth
                      size="md"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      Data di Inizio
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none"
                    />
                  </div>

                  {/* Target Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      Scadenza Target
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRIEF & CV */}
          {activeTab === "cv" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                  Brief Tecnico & Descrizione Completa (CV del Progetto)
                </h3>
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col gap-3">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Inserisci gli obiettivi di business, i requisiti architetturali, lo stack tecnologico e le metriche di successo che definiscono l'iniziativa.
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    placeholder="Specifiche tecniche dettagliate, deliverable attesi e vincoli..."
                    className="w-full p-4 rounded-xl bg-zinc-900 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none transition-colors resize-none leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LINKS & RESOURCES */}
          {activeTab === "links" && (
            <div className="flex flex-col gap-6">
              {/* Add Link Bar */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                  Aggiungi Collegamento
                </h3>
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      placeholder="URL (es. https://github.com/my-repo o figma.com/...)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-white/20 text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Etichetta (es. Repo GitHub)"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                      className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-white/20 text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={handleAddLink}
                      disabled={!newLinkUrl.trim()}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-40 text-black font-bold text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Aggiungi</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Links List */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                  Risorse & Link Attivi ({links.length})
                </h3>

                {links.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2 bg-zinc-900/40">
                    <Globe className="w-6 h-6 text-zinc-600" />
                    <span>Nessun link associato a questo progetto.</span>
                    <span className="text-[11px]">
                      Aggiungi GitHub, Figma, Documentazione, Server Discord o il link di produzione.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {links.map((lnk) => (
                      <div
                        key={lnk.id}
                        className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                            {getLinkIcon(lnk.category)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white text-xs truncate">
                              {lnk.title}
                            </span>
                            <a
                              href={lnk.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-zinc-400 hover:text-white transition-colors truncate flex items-center gap-1"
                            >
                              <span>{lnk.url}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLink(lnk.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                          title="Rimuovi link"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ASSOCIATED & RELATIONS */}
          {activeTab === "relations" && (
            <div className="flex flex-col gap-6">
              {/* Parent Project Selector */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                  Progetto Padre (Gerarchia)
                </h3>
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col gap-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Collega questo progetto a un'iniziativa o programma principale per raggrupparli nella vista ad albero.
                  </p>
                  <LinearSelect
                    options={parentProjectOptions}
                    value={parentProjectId || "none"}
                    onChange={(val) => setParentProjectId(val === "none" ? null : val)}
                    fullWidth
                    size="md"
                  />
                </div>
              </div>

              {/* Related / Sibling Projects */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
                    Progetti Correlati ({relatedProjectIds.length})
                  </h3>
                  <span className="text-[11px] text-zinc-500">
                    Seleziona i progetti legati a questo flusso
                  </span>
                </div>

                {otherProjects.length === 0 ? (
                  <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5 text-center text-xs text-zinc-500">
                    Nessun altro progetto disponibile nel workspace.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {otherProjects.map((p) => {
                      const isRelated = relatedProjectIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleRelatedProject(p.id)}
                          className={cn(
                            "p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer",
                            isRelated
                              ? "bg-zinc-800 border-white/30 text-white shadow-sm"
                              : "bg-zinc-900/60 hover:bg-zinc-800 border-white/5 text-zinc-400 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ProjectIconBadge project={p} size="sm" />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-xs truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {p.status} • {p.identifier || "PRJ"}
                              </span>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0",
                              isRelated
                                ? "bg-white border-white text-zinc-950"
                                : "border-white/10 bg-transparent"
                            )}
                          >
                            {isRelated && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DANGER ZONE */}
          {activeTab === "danger" && (
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Eliminazione Definitiva del Progetto
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    L'eliminazione rimuoverà il progetto <strong>{project.name}</strong> dal workspace. Tutte le task collegate verranno dissociate. Questa operazione è irreversibile.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    Elimina Progetto...
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteProject}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                    >
                      Conferma Eliminazione
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Annulla
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500">
              ID Interno: <code className="text-white font-sans font-semibold">{project.internalId || project.id}</code>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Chiudi
            </button>

            <button
              onClick={handleSaveGeneral}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Salva Modifiche</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
