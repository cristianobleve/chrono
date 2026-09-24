"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { Project, ProjectStatus, Priority, IssueStatus, User, Account } from "@/types";
import {
  Box,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Layers,
  ArrowRight,
  ExternalLink,
  Kanban,
  Check,
  Palette,
  Camera,
  Settings,
  Flag,
  Users,
  X,
} from "lucide-react";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { ProjectIconPicker } from "@/components/projects/ProjectIconPicker";
import { ProjectCoverPicker } from "@/components/projects/ProjectCoverPicker";
import { ProjectSettingsModal, getLinkIcon } from "@/components/projects/ProjectSettingsModal";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn, formatDate, formatFriendlyDate, sortMilestones } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n";

interface ProjectDetailViewProps {
  slug: string;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ slug }) => {
  const { t } = useTranslation();
  const {
    projects,
    updateProject,
    deleteProject,
    issues,
    createIssue,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    addProjectUpdate,
    setActiveModal,
    setSelectedIssueId,
    setTimelineDrawerOpen,
    team,
    currentUser,
    accounts,
    addToast,
  } = useLinearStore();

  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const project =
    projects.find(
      (p) =>
        p.slug === slug ||
        p.id === slug ||
        (p.slug && slug && (p.slug.startsWith(slug) || slug.startsWith(p.slug))) ||
        (p.id && slug && (p.id.startsWith(slug) || slug.startsWith(p.id)))
    ) || projects[0];

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [quickIssueTitle, setQuickIssueTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(project?.name || "CASD");
  const [summary, setSummary] = useState(project?.summary || "");
  const [description, setDescription] = useState(project?.description || "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const statusOptions: SelectOption[] = [
    { value: "Planned", label: `${t.projects.planned} (To Do)`, icon: <StatusIcon status="todo" />, toneClassName: "text-zinc-200" },
    { value: "In Progress", label: t.projects.inProgress, icon: <StatusIcon status="in_progress" />, toneClassName: "text-amber-300" },
    { value: "Completed", label: `${t.projects.completed} (Done)`, icon: <StatusIcon status="done" />, toneClassName: "text-emerald-300" },
    { value: "Backlog", label: t.projects.backlog, icon: <StatusIcon status="backlog" />, toneClassName: "text-sky-300" },
    { value: "Canceled", label: t.projects.canceled, icon: <StatusIcon status="canceled" />, toneClassName: "text-red-300" },
  ];

  const parentProject = projects.find((p) => p.id === project?.parentProjectId);
  const relatedProjects = projects.filter((p) => project?.relatedProjectIds?.includes(p.id));

  // Milestone creation state
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  // Update modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateBody, setUpdateBody] = useState("");
  const [updateStatus, setUpdateStatus] = useState<"on_track" | "at_risk" | "off_track">("on_track");

  // Collaborators section state
  const [showAddMember, setShowAddMember] = useState(false);

  const milestonesList = useMemo(() => {
    return sortMilestones(project?.milestones || []);
  }, [project?.milestones]);

  useEffect(() => {
    if (project) {
      setTitle(project.name);
      setSummary(project.summary || "");
      setDescription(project.description || "");
      if (
        milestonesList.length > 0 &&
        (!selectedMilestoneId || !milestonesList.some((m) => m.id === selectedMilestoneId))
      ) {
        setSelectedMilestoneId(milestonesList[0].id);
      }
    }
  }, [project?.id, project?.name, project?.summary, project?.description, milestonesList, selectedMilestoneId]);

  if (!mounted || !project) {
    return (
      <div className="flex-1 w-full h-full min-h-[70vh] flex items-center justify-center bg-[#09090b] select-none">
        <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-xs text-zinc-400 font-sans shadow-sm">
          <span className="font-medium text-zinc-300">Loading project details</span>
          <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-zinc-700 border-t-zinc-200 animate-spin shrink-0" />
        </div>
      </div>
    );
  }

  // Active cover logic: respects explicit gradient or image selection
  const hasCoverImage = Boolean(project.coverUrl);
  const hasCoverGradient = Boolean(project.coverGradient);

  const projectIssues = issues.filter((i) => i.projectId === project.id);
  const doneIssues = projectIssues.filter((i) => i.status === "done");
  const totalIssues = projectIssues.length;
  const issuesPct =
    totalIssues > 0
      ? Math.round((doneIssues.length / totalIssues) * 100)
      : 0;

  const doneMilestones = milestonesList.filter((m) => m.completed);
  const totalMilestones = milestonesList.length;
  const milestonesPct =
    totalMilestones > 0
      ? Math.round((doneMilestones.length / totalMilestones) * 100)
      : 0;

  const totalItems = totalMilestones + totalIssues;
  const doneItems = doneMilestones.length + doneIssues.length;
  const overallPct =
    totalItems > 0
      ? Math.round((doneItems / totalItems) * 100)
      : 0;

  const isProjectCompleted = project.status === "Completed";

  const activeMilestone =
    milestonesList.find((m) => m.id === selectedMilestoneId) || milestonesList[0] || null;

  // Collaborators & project lead / owner logic
  const projectLead: User = project.lead || currentUser;
  const explicitMembers: User[] = project.members || [];

  // Issue assignees in this project who aren't the lead
  const issueAssigneeIds = new Set(
    projectIssues
      .map((i) => i.assigneeId)
      .filter((id): id is string => Boolean(id) && id !== projectLead.id)
  );

  // Auto-detect assigned accounts that aren't yet in explicitMembers
  const assignedAccountsAsMembers: User[] = (accounts || [])
    .filter(
      (acc) =>
        issueAssigneeIds.has(acc.id) &&
        !explicitMembers.some((m) => m.id === acc.id) &&
        acc.id !== projectLead.id
    )
    .map((acc) => ({
      id: acc.id,
      identifier: acc.identifier,
      internalId: acc.internalId,
      name: acc.name,
      username: acc.username,
      email: acc.email,
      avatarUrl: acc.avatarUrl,
    }));

  const allCollaborators = [
    {
      ...projectLead,
      isOwner: true,
      roleLabel: "Owner",
    },
    ...explicitMembers
      .filter((m) => m.id !== projectLead.id)
      .map((m) => ({
        ...m,
        isOwner: false,
        roleLabel: "Associato",
      })),
    ...assignedAccountsAsMembers.map((m) => ({
      ...m,
      isOwner: false,
      roleLabel: "Associato",
    })),
  ];

  // Available accounts that can be added to the project
  const existingMemberIds = new Set(allCollaborators.map((c) => c.id));
  const availableAccountsToAdd = (accounts || []).filter(
    (acc) => !existingMemberIds.has(acc.id)
  );

  const handleAddCollaborator = (account: Account) => {
    const currentMembers = project.members || [];
    if (!currentMembers.some((m) => m.id === account.id)) {
      const newMember: User = {
        id: account.id,
        identifier: account.identifier,
        internalId: account.internalId,
        name: account.name,
        username: account.username,
        email: account.email,
        avatarUrl: account.avatarUrl,
      };
      updateProject(project.id, {
        members: [...currentMembers, newMember],
      });
      addToast({ title: `${account.name} associato al progetto`, type: "success" });
    }
    setShowAddMember(false);
  };

  const handleRemoveCollaborator = (memberId: string) => {
    const currentMembers = project.members || [];
    updateProject(project.id, {
      members: currentMembers.filter((m) => m.id !== memberId),
    });
    addToast({ title: "Collaboratore rimosso dal progetto", type: "info" });
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== project.name) {
      updateProject(project.id, { name: title.trim() });
    }
  };

  const handleSummaryBlur = () => {
    updateProject(project.id, { summary: summary.trim() });
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    addMilestone(project.id, {
      name: newMilestoneTitle.trim(),
      targetDate: newMilestoneDate || null,
      completed: false,
      sortOrder: milestonesList.length + 1,
    });
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setShowAddMilestone(false);
    addToast({ title: "Milestone aggiunta", type: "success" });
  };

  const handleAddQuickIssue = () => {
    if (!quickIssueTitle.trim()) return;
    createIssue({
      title: quickIssueTitle.trim(),
      description: `Task creata per la fase: ${activeMilestone?.name || "Generale"}`,
      status: "todo",
      priority: "high",
      projectId: project.id,
      labels: ["Feature", team.name],
    });
    setQuickIssueTitle("");
    addToast({ title: "Nuova issue collegata al progetto", type: "success" });
  };

  const handleSaveCustomIcon = (customization: { icon: string; iconBg: string; iconColor: string }) => {
    updateProject(project.id, {
      icon: customization.icon,
      iconBg: customization.iconBg,
      iconColor: customization.iconColor,
    });
    addToast({ title: "Icona progetto aggiornata con successo", type: "success" });
  };

  const handleSaveCover = (cover: { coverUrl: string | null; coverGradient: string | null }) => {
    updateProject(project.id, {
      coverUrl: cover.coverUrl,
      coverGradient: cover.coverGradient,
    });
    addToast({ title: "Copertina progetto aggiornata con successo", type: "success" });
  };

  return (
    <div className="flex-1 w-full flex flex-col select-none text-ink pb-24 bg-[#09090b]">
      {/* 1. Cover Banner with Vibrant Gradient & Unsplash Image */}
      <div className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden group bg-[#09090b] shrink-0">
        {hasCoverImage ? (
          <img
            src={project.coverUrl!}
            alt="Project Cover"
            className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
          />
        ) : hasCoverGradient ? (
          <div className="w-full h-full" style={{ background: project.coverGradient! }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#0f172a] via-[#09090b] to-[#1e1b4b]" />
        )}

        {/* Overlay scuro per lo sfondo della pagina */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent pointer-events-none" />

        {/* Cover Action Toolbar */}
        <div className="absolute top-6 right-6 md:right-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            type="button"
            onClick={() => setShowCoverPicker(true)}
            className="h-8 px-3 rounded-[8px] bg-black/80 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 border border-white/20 shadow-lg transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.projectDetail.changeCover}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Page Content Container (Overlapping Header) */}
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 flex flex-col gap-8 -mt-12 md:-mt-16 relative z-10">
        {/* Project Identity Deck */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Custom Superquadrato Project Badge */}
            <div className="relative group cursor-pointer shrink-0" onClick={() => setShowIconPicker(true)}>
              <ProjectIconBadge
                project={project}
                size="xl"
                className="ring-4 ring-[#09090b] shadow-2xl transition-transform"
              />
              <div className="absolute inset-0 rounded-[18px] bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                <Palette className="w-4 h-4" />
              </div>
            </div>

            {/* Title & Domain Slug / Metadata Block */}
            <div className="flex flex-col min-w-0 flex-1 gap-1">
              <div className="flex items-center gap-3 min-w-0">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                    autoFocus
                    className="text-xl md:text-2xl font-bold font-heading text-white bg-transparent focus:outline-none tracking-tight border-b border-white flex-1 min-w-0"
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-xl md:text-2xl font-bold font-heading text-white tracking-tight hover:text-zinc-300 cursor-text transition-colors truncate min-w-0"
                    title={project.name}
                  >
                    {project.name}
                  </h1>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <InternalIdBadge
                    id={project.identifier || "PRJ-1"}
                    internalId={project.internalId || project.id}
                    size="sm"
                  />

                    <LinearSelect
                      options={statusOptions}
                      value={project.status || "Planned"}
                      onChange={(val) => {
                        updateProject(project.id, { status: val as ProjectStatus });
                        addToast({
                          title: t.projectDetail.projectUpdated,
                          description: `${t.common.status}: ${val}`,
                          type: "success",
                        });
                      }}
                      size="md"
                    />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span className="font-mono text-zinc-400 truncate max-w-[360px] text-[11px]">
                  {project.slug}.{team.key.toLowerCase()}.chrono.engineering
                </span>
                {project.lead && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <span className="text-zinc-500">Lead:</span>
                    <UserAvatar
                      name={project.lead.name}
                      avatarUrl={project.lead.avatarUrl}
                      size="xs"
                      className="w-4 h-4 rounded-[4px]"
                    />
                    <span>{project.lead.name}</span>
                  </div>
                )}
                {project.targetDate && (
                  <span className="text-[11px] text-zinc-300 flex items-center gap-1.5 shrink-0 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{formatFriendlyDate(project.targetDate)}</span>
                  </span>
                )}
              </div>

              {/* Links & Associated Projects Ribbon */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {/* Parent Project Pill */}
                {parentProject && (
                  <Link
                    href={`/project/${parentProject.slug}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] font-medium transition-colors"
                    title={`Parte del progetto principale: ${parentProject.name}`}
                  >
                    <Layers className="w-3 h-3 text-zinc-300" />
                    <span>Parte di: {parentProject.name}</span>
                  </Link>
                )}

                {/* Related Projects */}
                {relatedProjects.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/project/${rp.slug}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors"
                    title={`Progetto correlato: ${rp.name}`}
                  >
                    <Box className="w-3 h-3 text-zinc-400" />
                    <span>{rp.name}</span>
                  </Link>
                ))}

                {/* Project Links (GitHub, Figma, Docs, Web) */}
                {project.links && project.links.length > 0 && (
                  project.links.map((lnk) => (
                    <a
                      key={lnk.id}
                      href={lnk.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors group/lnk"
                      title={lnk.url}
                    >
                      {getLinkIcon(lnk.category)}
                      <span>{lnk.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover/lnk:text-white transition-colors" />
                    </a>
                  ))
                )}

                {/* Quick Add Link Trigger */}
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/15 hover:border-white/30 text-zinc-400 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                  title="Aggiungi link (GitHub, Figma, Docs, ecc.)"
                >
                  <Plus className="w-3 h-3 text-zinc-400" />
                  <span>Aggiungi link</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Right: Settings & Cronoprogramma Timeline */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setTimelineDrawerOpen(true)}
              className="h-8 px-3 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.projectDetail.schedule}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="h-8 px-3 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.projectDetail.projectSettings}</span>
            </button>
          </div>
        </div>

        {/* 3. Section Heading & Stepper Track */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-white tracking-tight">
                {t.projectDetail.roadmapMilestones}
              </h2>
              <span className="px-2 py-0.5 rounded-[4px] bg-white/[0.06] text-zinc-300 border border-white/10 text-[11px] font-mono">
                {doneMilestones.length}/{totalMilestones} {t.projectDetail.completed}
              </span>
            </div>

            <Link
              href="/issues"
              className="h-7 px-2.5 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Kanban className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.projectDetail.kanbanBoard}</span>
            </Link>
          </div>

          {/* Stepper Breadcrumb Track: Sleek horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-fine pb-2 pt-1">
            {milestonesList.length === 0 ? (
              <span className="text-xs text-zinc-500 py-2">
                {t.projectDetail.noMilestoneDefined}
              </span>
            ) : (
              milestonesList.map((ms, idx) => {
                const isCurrent = activeMilestone && ms.id === activeMilestone.id;
                return (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={() => setSelectedMilestoneId(ms.id)}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-xs font-medium shrink-0 transition-all cursor-pointer border text-left",
                      isCurrent
                        ? "bg-white/[0.1] border-white/20 text-white shadow-sm"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                        ms.completed
                          ? "bg-emerald-500 text-zinc-950 font-bold"
                          : isCurrent
                          ? "bg-white text-zinc-950 font-bold"
                          : "bg-zinc-800 text-zinc-400"
                      )}
                    >
                      {ms.completed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                    </span>
                    <span className="truncate max-w-[180px]">{ms.name}</span>
                    {ms.targetDate && (
                      <span className="text-[10px] text-zinc-400 font-mono tabular-nums shrink-0 ml-1">
                        {formatFriendlyDate(ms.targetDate, { twoDigitDay: true })}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Fluid Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Milestone Focus & Project Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Active Milestone Focus Card */}
            <div className="rounded-[8px] bg-zinc-900/50 border border-white/10 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    {t.projectDetail.milestoneSelected}
                  </span>
                  <h3 className="text-sm font-semibold text-white tracking-tight leading-snug">
                    {activeMilestone ? activeMilestone.name : project.name}
                  </h3>
                </div>

                {activeMilestone && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-[4px] text-[10px] font-medium shrink-0 border uppercase font-mono",
                      activeMilestone.completed
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : "bg-white/[0.04] border-white/10 text-zinc-400"
                    )}
                  >
                    {activeMilestone.completed ? t.projectDetail.milestoneCompleted : t.projectDetail.milestoneInProgress}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {activeMilestone?.description ||
                  project.summary ||
                  "Questa fase definisce le tappe e i requisiti di rilascio del progetto. Monitora lo stato di avanzamento associando task e issue dedicate."}
              </p>

              {activeMilestone?.targetDate && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1 border-t border-white/5 font-sans">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.projectDetail.deadline}</span>
                  <span className="text-zinc-200 font-medium">
                    {formatFriendlyDate(activeMilestone.targetDate)}
                  </span>
                </div>
              )}

              {activeMilestone && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMilestone(project.id, activeMilestone.id)}
                    className={cn(
                      "h-7 px-3 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border",
                      activeMilestone.completed
                        ? "bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white"
                        : "bg-white hover:bg-zinc-200 text-zinc-950 font-semibold border-transparent shadow-sm"
                    )}
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>{activeMilestone.completed ? t.projectDetail.reopen : t.projectDetail.markComplete}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Project Progress & Metrics Card */}
            <div className="rounded-[8px] bg-zinc-900/50 border border-white/10 p-5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{t.projectDetail.overallProgress}</span>
                <span className="font-mono text-white font-bold text-sm">
                  {overallPct}%
                </span>
              </div>

              {/* Dual Split Track: [Milestones (Emerald)] [Issues (White/Blue)] */}
              <div className="w-full flex items-center gap-2">
                <div
                  className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden"
                  title={`Milestone completate: ${doneMilestones.length}/${totalMilestones} (${milestonesPct}%)`}
                >
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${milestonesPct}%` }}
                  />
                </div>

                <div
                  className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden"
                  title={`Issue completate: ${doneIssues.length}/${totalIssues} (${issuesPct}%)`}
                >
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${issuesPct}%` }}
                  />
                </div>
              </div>

              {/* Legend & Breakdown */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>{doneMilestones.length}/{totalMilestones} Milestone ({milestonesPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white inline-block" />
                  <span>{doneIssues.length}/{totalIssues} Issue ({issuesPct}%)</span>
                </div>
              </div>
            </div>

            {/* Team e Collaboratori di Progetto */}
            <div className="rounded-[8px] bg-zinc-900/50 border border-white/10 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{t.projectDetail.teamCollaborators}</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-white/[0.04] border border-white/10 text-zinc-400 font-mono text-[10px]">
                    {allCollaborators.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="h-7 px-2.5 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.projectDetail.addMember}</span>
                </button>
              </div>

              {/* Add Member Dropdown / Selector */}
              {showAddMember && (
                <div className="p-3 rounded-[6px] bg-[#0c0d0e] border border-white/10 flex flex-col gap-2 animate-slide-up">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-white">{t.projectDetail.associateMember}</span>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="text-zinc-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {availableAccountsToAdd.length === 0 ? (
                    <span className="text-xs text-zinc-500 italic py-1">
                      {t.projectDetail.allMembersAlreadyAdded}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                      {availableAccountsToAdd.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleAddCollaborator(acc)}
                          className="flex items-center justify-between p-2 rounded-[6px] hover:bg-white/5 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar
                              name={acc.name}
                              avatarUrl={acc.avatarUrl}
                              size="xs"
                              className="w-5 h-5 rounded-[4px]"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-medium text-white truncate">
                                {acc.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 truncate">
                                {acc.email}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium group-hover:text-white border border-white/10 px-2 py-0.5 rounded-[4px]">
                            {t.projectDetail.associate}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Collaborators List */}
              <div className="flex flex-col gap-2">
                {allCollaborators.map((member) => {
                  const memberTasksCount = projectIssues.filter(
                    (i) => i.assigneeId === member.id
                  ).length;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-[6px] bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          name={member.name}
                          avatarUrl={member.avatarUrl}
                          size="sm"
                          className="w-7 h-7 rounded-[6px] shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white text-xs truncate">
                              {member.name}
                            </span>
                            {currentUser && member.id === currentUser.id && (
                              <span className="text-[10px] text-zinc-500 font-mono">(tu)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <span className="truncate">
                              {member.email || `@${member.username}`}
                            </span>
                            {memberTasksCount > 0 && (
                              <span className="text-zinc-400 font-mono text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                                {memberTasksCount} {memberTasksCount === 1 ? "task" : "task"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-[4px] text-[10px] font-medium border uppercase tracking-wider font-mono",
                            member.isOwner
                              ? "bg-white/10 text-white border-white/20"
                              : "bg-white/[0.04] text-zinc-400 border-white/10"
                          )}
                        >
                          {member.roleLabel}
                        </span>

                        {!member.isOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(member.id)}
                            className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                            title="Rimuovi collaboratore"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Milestones Roadmap Checklist & Quick Task Creator */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Header with Add Milestone */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {t.projectDetail.roadmapMilestones}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-[4px] bg-white/[0.04] text-zinc-300 border border-white/10">
                  {doneMilestones.length}/{totalMilestones} {t.projectDetail.completed}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="h-7 px-2.5 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.projectDetail.newMilestone}</span>
              </button>
            </div>

            {/* Add Milestone Inline Box */}
            {showAddMilestone && (
              <div className="rounded-[8px] bg-[#0c0d0e] border border-white/10 p-4 flex flex-col gap-3 animate-slide-up shadow-xl">
                <span className="font-semibold text-white text-xs">{t.projectDetail.addNewMilestone}</span>
                <input
                  type="text"
                  placeholder={t.projectDetail.milestoneNamePlaceholder}
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="px-3 py-1.5 rounded-[6px] bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-[6px] bg-white/[0.04] border border-white/10 text-zinc-300 text-xs focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMilestone(false)}
                      className="px-3 py-1 rounded-[6px] text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="px-3.5 py-1 rounded-[6px] bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow-sm cursor-pointer"
                    >
                      {t.common.save}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vertical Stepper Timeline */}
            <div className="rounded-[8px] bg-zinc-900/50 border border-white/10 p-4 sm:p-5">
              {milestonesList.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-9 h-9 rounded-[8px] bg-zinc-800/80 flex items-center justify-center text-zinc-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-xs">{t.projectDetail.noMilestoneDefined}</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5">
                      {t.projectDetail.addMilestonePlan}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMilestone(true)}
                    className="mt-1 px-3 py-1.5 rounded-[6px] bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                  >
                    {t.projectDetail.addFirstMilestone}
                  </button>
                </div>
              ) : (
                <div className="relative pl-8 space-y-4">
                  {/* Continuous Vertical Connector Line */}
                  <div className="absolute left-[10px] top-3 bottom-3 w-[1px] bg-zinc-800" />

                  {milestonesList.map((ms) => {
                    const isSelected = activeMilestone && ms.id === activeMilestone.id;

                    return (
                      <div
                        key={ms.id}
                        onClick={() => setSelectedMilestoneId(ms.id)}
                        className="relative group cursor-pointer"
                      >
                        {/* Circular Step Node */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMilestone(project.id, ms.id);
                          }}
                          className={cn(
                            "absolute -left-8 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center transition-all z-10 cursor-pointer shadow-sm",
                            ms.completed
                              ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                              : "border-zinc-700 bg-zinc-950 text-transparent hover:border-zinc-400"
                          )}
                          title={ms.completed ? "Segna come incompleta" : "Segna come completata"}
                        >
                          {ms.completed ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-zinc-400 transition-colors" />
                          )}
                        </button>

                        {/* Content Row */}
                        <div
                          className={cn(
                            "p-3 rounded-[6px] transition-all border flex items-center justify-between gap-4",
                            isSelected
                              ? "bg-white/[0.08] border-white/20 shadow-sm"
                              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                          )}
                        >
                          {/* Left: Title & Status */}
                          <div className="flex flex-col min-w-0 flex-1 gap-1">
                            <span
                              className={cn(
                                "text-xs font-semibold tracking-tight transition-colors truncate min-w-0",
                                ms.completed ? "text-zinc-300" : "text-white"
                              )}
                            >
                              {ms.name}
                            </span>

                            <div className="flex items-center gap-2 text-[11px]">
                              <span className={ms.completed ? "text-emerald-400 font-medium" : "text-zinc-500"}>
                                {ms.completed ? "Completata" : "In programma"}
                              </span>
                              {ms.description && (
                                <span className="text-zinc-400 line-clamp-1">{ms.description}</span>
                              )}
                            </div>
                          </div>

                          {/* Right: Date Centered in Block without Border or Background */}
                          <div className="flex items-center gap-3 shrink-0 self-center">
                            {ms.targetDate && (
                              <div
                                className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 flex items-center gap-1.5 shrink-0 select-none tabular-nums"
                                title={`Scadenza: ${formatFriendlyDate(ms.targetDate)}`}
                              >
                                <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span>{formatFriendlyDate(ms.targetDate, { twoDigitDay: true })}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMilestone(project.id, ms.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity cursor-pointer shrink-0"
                              title="Elimina milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Terminal Node: Project Conclusion & Closed Timeline */}
                  {isProjectCompleted ? (
                    <div className="relative group pt-2">
                      <div className="absolute -left-8 top-3.5 w-5 h-5 rounded-full border border-emerald-500 bg-zinc-950 flex items-center justify-center text-emerald-400 z-10 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>

                      <div className="p-3.5 rounded-[8px] bg-emerald-500/[0.06] border border-emerald-500/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{t.projectDetail.projectClosed}</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                              {t.projectDetail.timelineClosed}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              updateProject(project.id, { status: "In Progress" });
                              addToast({
                                title: t.projectDetail.projectReopened,
                                description: `${project.name}`,
                                type: "info",
                              });
                            }}
                            className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                          >
                            {t.projectDetail.reopenProject}
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {t.projectDetail.projectClosedDesc}
                        </p>
                      </div>
                    </div>
                  ) : overallPct === 100 && totalItems > 0 ? (
                    <div className="relative group pt-2">
                      <div className="absolute -left-8 top-3.5 w-5 h-5 rounded-full border-2 border-emerald-500 bg-zinc-950 flex items-center justify-center text-emerald-400 z-10 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>

                      <div className="p-3.5 rounded-[8px] bg-zinc-900/90 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-white">
                            {t.projectDetail.allCompleted} (100%)
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {t.projectDetail.concludeProjectDesc}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateProject(project.id, { status: "Completed" });
                            addToast({
                              title: t.projectDetail.projectConcluded,
                              description: `${project.name}`,
                              type: "success",
                            });
                          }}
                          className="px-3 py-1.5 rounded-[6px] bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.projectDetail.concludeProject}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group pt-1">
                      <div className="absolute -left-8 top-2 w-5 h-5 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-600 z-10">
                        <Flag className="w-3 h-3" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 p-2">
                        <span>{t.projectDetail.finalRelease}</span>
                        <button
                          type="button"
                          onClick={() => {
                            updateProject(project.id, { status: "Completed" });
                            addToast({
                              title: t.projectDetail.projectConcluded,
                              description: `${project.name}`,
                              type: "success",
                            });
                          }}
                          className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          {t.projectDetail.concludeNow}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Task Dispatcher for this Phase */}
            <div className="rounded-[8px] bg-zinc-900/50 border border-white/10 p-3.5 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {t.projectDetail.quickTaskLabel}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.projectDetail.quickTaskPlaceholder}
                  value={quickIssueTitle}
                  onChange={(e) => setQuickIssueTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddQuickIssue()}
                  className="flex-1 h-8 px-3 rounded-[6px] bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors font-sans"
                />
                <button
                  type="button"
                  onClick={handleAddQuickIssue}
                  disabled={!quickIssueTitle.trim()}
                  className="h-8 px-3 rounded-[6px] bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-semibold text-xs transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t.projectDetail.createTask}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Project Issues Roster Table */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 tracking-tight uppercase">
              {t.projectDetail.projectIssues} ({projectIssues.length})
            </h3>
            <Link
              href="/issues"
              className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
            >
              <span>{t.projectDetail.seeAllKanban}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-[8px] bg-zinc-900/50 border border-white/10 overflow-hidden divide-y divide-white/5">
            {projectIssues.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                {t.projectDetail.noTasksYet}
              </div>
            ) : (
              projectIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="p-3.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PriorityIcon priority={issue.priority} />
                    <InternalIdBadge
                      id={issue.identifier}
                      internalId={issue.internalId || issue.id}
                      size="xs"
                    />
                    <span className="text-zinc-200 font-medium truncate group-hover:text-white transition-colors">
                      {issue.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-[4px] text-[10px] bg-white/[0.04] text-zinc-300 border border-white/5 uppercase font-mono font-medium tracking-tight">
                      {issue.status}
                    </span>
                    <UserAvatar
                      name={issue.assignee?.name || currentUser.name}
                      avatarUrl={issue.assignee?.avatarUrl || currentUser.avatarUrl}
                      size="xs"
                      className="w-5 h-5 rounded-[4px]"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Icon Picker Modal */}
      <ProjectIconPicker
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        icon={project.icon}
        iconBg={project.iconBg}
        iconColor={project.iconColor}
        projectName={project.name}
        onSave={handleSaveCustomIcon}
      />

      {/* Cover Picker Modal */}
      <ProjectCoverPicker
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        currentCoverUrl={project.coverUrl}
        currentCoverGradient={project.coverGradient}
        onSave={handleSaveCover}
      />

      {/* Project Settings & CV Modal */}
      <ProjectSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        project={project}
        onOpenCoverPicker={() => setShowCoverPicker(true)}
        onOpenIconPicker={() => setShowIconPicker(true)}
      />
    </div>
  );
};
