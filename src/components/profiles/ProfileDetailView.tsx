"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLinearStore } from "@/store/useLinearStore";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LinearSelect } from "@/components/ui/LinearSelect";
import { ProjectCoverPicker } from "@/components/projects/ProjectCoverPicker";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import {
  saveLocalAvatar,
  removeLocalAvatar,
  saveLocalCover,
  getLocalCover,
  removeLocalCover,
} from "@/lib/storage";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Account, AccountRole, Issue, Project } from "@/types";
import {
  Camera,
  Trash2,
  Upload,
  Mail,
  Calendar,
  Building2,
  MapPin,
  Globe,
  Briefcase,
  Edit3,
  Plus,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  CheckSquare,
  Box,
  Clock,
  ExternalLink,
  ChevronRight,
  UserX,
  Key,
  FolderKanban,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUpRight,
  Github,
  Twitter,
  Sparkles,
  Phone,
} from "lucide-react";

export interface ProfileDetailViewProps {
  userId?: string;
}

const DEPARTMENT_OPTIONS = [
  { value: "Engineering", label: "Engineering" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Operations", label: "Operations" },
  { value: "Marketing", label: "Marketing" },
  { value: "Security", label: "Security & Compliance" },
  { value: "Research", label: "Research & AI" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Executive", label: "Leadership & Exec" },
];

export const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({ userId }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentUser,
    accounts,
    workspace,
    issues,
    projects,
    timelineEvents,
    setSelectedIssueId,
    setActiveModal,
    updateAccount,
    updateCurrentUser,
    deleteAccount,
    addToast,
  } = useLinearStore();

  // Active tab state
  const [activeTab, setActiveTab] = useState<"tasks" | "projects" | "activity" | "admin">("tasks");
  const [taskFilter, setTaskFilter] = useState<"all" | "in_progress" | "todo" | "done">("all");

  // Modals state
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Identify target account/user
  const targetAccount = useMemo(() => {
    const decoded = userId ? decodeURIComponent(userId) : "";
    const cleanHandle = decoded.startsWith("@") ? decoded.slice(1).toLowerCase() : decoded.toLowerCase();

    const isSelfMatch =
      !userId ||
      userId === "me" ||
      userId === currentUser.id ||
      userId === currentUser.email ||
      (currentUser.username && cleanHandle === currentUser.username.toLowerCase());

    if (isSelfMatch) {
      const found = accounts.find(
        (a) =>
          a.id === currentUser.id ||
          a.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
          (a.username && currentUser.username && a.username.toLowerCase() === currentUser.username.toLowerCase())
      );
      return {
        id: currentUser.id || found?.id || "user-1",
        identifier: currentUser.identifier || found?.identifier || "USR-1",
        internalId: currentUser.internalId || found?.internalId || `usr_${currentUser.id}`,
        name: currentUser.name || found?.name || "Utente",
        username: currentUser.username || found?.username || "utente",
        email: currentUser.email || found?.email || "",
        avatarUrl: currentUser.avatarUrl || currentUser.avatar || found?.avatarUrl || null,
        role: (currentUser.role as AccountRole) || found?.role || "member",
        department: currentUser.department || found?.department || "Engineering",
        title: currentUser.title || found?.title || "Collaboratore del team",
        bio: currentUser.bio || found?.bio || null,
        location: currentUser.location || found?.location || null,
        timezone: currentUser.timezone || found?.timezone || "Europe/Rome (UTC+1)",
        coverUrl: currentUser.coverUrl || found?.coverUrl || null,
        coverGradient: currentUser.coverGradient || found?.coverGradient || null,
        createdAt: found?.createdAt || new Date().toISOString(),
        phone: currentUser.phone || found?.phone || null,
        github: currentUser.github || found?.github || null,
        twitter: currentUser.twitter || found?.twitter || null,
        website: currentUser.website || found?.website || null,
      };
    }

    return (
      accounts.find(
        (a) =>
          a.id === decoded ||
          a.internalId === decoded ||
          a.id === userId ||
          (a.username && a.username.toLowerCase() === cleanHandle) ||
          (a.identifier && a.identifier.toLowerCase() === cleanHandle) ||
          (a.email && a.email.toLowerCase() === decoded.toLowerCase()) ||
          (a.name && a.name.toLowerCase() === cleanHandle)
      ) ||
      accounts[0] || {
        id: userId,
        identifier: "USR",
        internalId: `usr_${userId}`,
        name: cleanHandle || "Membro Workspace",
        username: cleanHandle || "membro",
        email: "",
        role: "member" as AccountRole,
        department: "Engineering",
        title: "Collaboratore",
        createdAt: new Date().toISOString(),
      }
    );
  }, [userId, currentUser, accounts]);

  // Permissions
  const isSelf =
    targetAccount.id === currentUser.id ||
    targetAccount.email?.toLowerCase() === currentUser.email?.toLowerCase();

  const currentRole = (currentUser.role as AccountRole) || "member";
  const viewerIsAdmin = currentRole === "admin" || currentRole === "owner";
  const viewerIsOwner = currentRole === "owner";
  const canEdit = isSelf || viewerIsAdmin;

  // Assigned issues
  const assignedIssues = useMemo(() => {
    return issues.filter(
      (iss) =>
        iss.assigneeId === targetAccount.id ||
        iss.assignee?.id === targetAccount.id ||
        (targetAccount.email && iss.assignee?.email?.toLowerCase() === targetAccount.email.toLowerCase())
    );
  }, [issues, targetAccount]);

  const filteredIssues = useMemo(() => {
    if (taskFilter === "all") return assignedIssues;
    if (taskFilter === "in_progress") return assignedIssues.filter((i) => i.status === "in_progress");
    if (taskFilter === "todo") return assignedIssues.filter((i) => i.status === "todo" || i.status === "backlog");
    if (taskFilter === "done") return assignedIssues.filter((i) => i.status === "done");
    return assignedIssues;
  }, [assignedIssues, taskFilter]);

  // Associated projects (Lead or Member)
  const associatedProjects = useMemo(() => {
    return projects.filter((p) => {
      const isLead =
        p.lead?.id === targetAccount.id ||
        (targetAccount.email && p.lead?.email?.toLowerCase() === targetAccount.email.toLowerCase());
      const isMember = p.members?.some(
        (m) =>
          m.id === targetAccount.id ||
          (targetAccount.email && m.email?.toLowerCase() === targetAccount.email.toLowerCase())
      );
      return isLead || isMember;
    });
  }, [projects, targetAccount]);

  // Recent timeline activities
  const recentActivities = useMemo(() => {
    return timelineEvents.filter(
      (ev) =>
        ev.authorId === targetAccount.id ||
        (targetAccount.name && ev.authorName?.toLowerCase() === targetAccount.name.toLowerCase())
    );
  }, [timelineEvents, targetAccount]);

  // Metrics
  const totalTasksCount = assignedIssues.length;
  const completedTasksCount = assignedIssues.filter((i) => i.status === "done").length;
  const inProgressTasksCount = assignedIssues.filter((i) => i.status === "in_progress").length;
  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Handlers
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      addToast({
        title: "File troppo grande",
        description: "L'immagine selezionata supera il limite di 2.5MB.",
        type: "warning",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const dataUrl = reader.result;
      const targetId = targetAccount.id || currentUser.id || "user-1";
      void saveLocalAvatar(targetId, dataUrl)
        .then((localRef) => {
          if (isSelf) {
            updateCurrentUser({ avatarUrl: localRef });
          }
          updateAccount(targetId, { avatarUrl: localRef });
          addToast({
            title: "Foto profilo aggiornata",
            description: "Immagine del profilo salvata e sincronizzata.",
            type: "success",
          });
        })
        .catch(() => {
          addToast({
            title: "Errore di caricamento",
            description: "Impossibile salvare l'immagine.",
            type: "error",
          });
        });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    const targetId = targetAccount.id || currentUser.id || "user-1";
    void removeLocalAvatar(targetId);
    if (isSelf) {
      updateCurrentUser({ avatarUrl: null });
    }
    updateAccount(targetId, { avatarUrl: null });
    addToast({
      title: "Foto profilo rimossa",
      type: "info",
    });
  };

  const [resolvedCoverUrl, setResolvedCoverUrl] = useState<string | null>(
    targetAccount.coverUrl || null
  );

  useEffect(() => {
    let active = true;
    const cover = targetAccount.coverUrl;
    if (cover) {
      if (cover.startsWith("local-cover:")) {
        const id = cover.replace("local-cover:", "");
        void getLocalCover(id).then((val) => {
          if (active && val) setResolvedCoverUrl(val);
        });
      } else {
        setResolvedCoverUrl(cover);
      }
    } else {
      void getLocalCover(targetAccount.id).then((val) => {
        if (active && val) {
          setResolvedCoverUrl(val);
        } else if (active) {
          setResolvedCoverUrl(null);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [targetAccount.coverUrl, targetAccount.id]);

  const handleUpdateCover = async (coverUrl: string | null, coverGradient: string | null) => {
    let finalCoverUrl = coverUrl;
    if (coverUrl) {
      finalCoverUrl = await saveLocalCover(targetAccount.id, coverUrl);
      setResolvedCoverUrl(coverUrl);
    } else {
      await removeLocalCover(targetAccount.id);
      setResolvedCoverUrl(null);
    }

    if (isSelf) {
      updateCurrentUser({ coverUrl: finalCoverUrl, coverGradient });
    }
    updateAccount(targetAccount.id, { coverUrl: finalCoverUrl, coverGradient });
    addToast({
      title: t.profilePage.profileUpdated,
      description: "Copertina del profilo aggiornata.",
      type: "success",
    });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const handle = targetAccount.username ? `@${targetAccount.username}` : targetAccount.id;
      const profileUrl = `${window.location.origin}/u/${handle}`;
      navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      addToast({
        title: t.profilePage.linkCopied,
        description: profileUrl,
        type: "info",
      });
    }
  };

  const handleCopyId = (idVal: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(idVal);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      addToast({
        title: "ID copiato",
        description: idVal,
        type: "info",
      });
    }
  };

  const handleRoleChange = (newRole: string) => {
    if (!viewerIsAdmin) return;
    updateAccount(targetAccount.id, { role: newRole as AccountRole });
    addToast({
      title: "Ruolo aggiornato",
      description: `Il ruolo di ${targetAccount.name} è ora impostato su ${newRole}.`,
      type: "success",
    });
  };

  const handleDepartmentChange = (newDept: string) => {
    if (!canEdit) return;
    if (isSelf) {
      updateCurrentUser({ department: newDept });
    }
    updateAccount(targetAccount.id, { department: newDept });
    addToast({
      title: "Dipartimento aggiornato",
      description: `Dipartimento: ${newDept}`,
      type: "success",
    });
  };

  // Edit Modal Form State
  const [formName, setFormName] = useState(targetAccount.name || "");
  const [formTitle, setFormTitle] = useState(targetAccount.title || "");
  const [formDept, setFormDept] = useState(targetAccount.department || "Engineering");
  const [formBio, setFormBio] = useState(targetAccount.bio || "");
  const [formLocation, setFormLocation] = useState(targetAccount.location || "");
  const [formPhone, setFormPhone] = useState(targetAccount.phone || "");
  const [formGithub, setFormGithub] = useState(targetAccount.github || "");
  const [formTwitter, setFormTwitter] = useState(targetAccount.twitter || "");
  const [formWebsite, setFormWebsite] = useState(targetAccount.website || "");

  const openEditModal = () => {
    setFormName(targetAccount.name || "");
    setFormTitle(targetAccount.title || "");
    setFormDept(targetAccount.department || "Engineering");
    setFormBio(targetAccount.bio || "");
    setFormLocation(targetAccount.location || "");
    setFormPhone(targetAccount.phone || "");
    setFormGithub(targetAccount.github || "");
    setFormTwitter(targetAccount.twitter || "");
    setFormWebsite(targetAccount.website || "");
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      name: formName.trim() || targetAccount.name,
      title: formTitle.trim() || null,
      department: formDept.trim() || "Engineering",
      bio: formBio.trim() || null,
      location: formLocation.trim() || null,
      phone: formPhone.trim() || null,
      github: formGithub.trim() || null,
      twitter: formTwitter.trim() || null,
      website: formWebsite.trim() || null,
    };

    if (isSelf) {
      updateCurrentUser(updates);
    }
    updateAccount(targetAccount.id, updates);
    setShowEditModal(false);
    addToast({
      title: t.profilePage.profileUpdated,
      description: "Tutte le informazioni del profilo sono state salvate.",
      type: "success",
    });
  };

  // Role Badge Styling
  const getRoleBadge = (role: AccountRole = "member") => {
    const roleColors: Record<AccountRole, string> = {
      owner: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      admin: "bg-sky-500/10 border-sky-500/30 text-sky-300",
      member: "bg-zinc-800 border-white/10 text-zinc-300",
      guest: "bg-zinc-900 border-white/5 text-zinc-500",
    };
    const roleLabel: Record<AccountRole, string> = {
      owner: "Owner",
      admin: "Admin",
      member: "Associato",
      guest: "Ospite",
    };
    return (
      <span
        className={cn(
          "px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border select-none",
          roleColors[role] || roleColors.member
        )}
      >
        {roleLabel[role] || role}
      </span>
    );
  };

  const hasCover = Boolean(resolvedCoverUrl || targetAccount.coverGradient);

  return (
    <div className="flex-1 w-full flex flex-col select-none text-ink pb-24 bg-[#08090a]">
      {/* 1. Profile Background Cover Banner */}
      {hasCover ? (
        <div className="w-full h-64 sm:h-72 md:h-88 lg:h-[26rem] relative overflow-hidden group select-none shrink-0 bg-[#08090a]">
          {resolvedCoverUrl ? (
            <img
              src={resolvedCoverUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: targetAccount.coverGradient! }}
            />
          )}

          {/* Ambient Dark Bottom Shade for smooth blending without obscuring artwork */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#08090a] via-[#08090a]/40 to-transparent pointer-events-none" />

          {/* Change Cover Buttons (Accessible at bottom right of cover) */}
          {canEdit && (
            <div className="absolute bottom-5 right-6 sm:right-10 flex items-center gap-2 z-10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setShowCoverPicker(true)}
                className="h-7 px-2.5 rounded-md bg-black/70 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-300" />
                <span>{t.profilePage.changeCover}</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateCover(null, null)}
                className="h-7 px-2 rounded-md bg-black/70 hover:bg-black text-zinc-400 hover:text-rose-400 text-xs font-medium border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer"
                title={t.profilePage.removeCover}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Top spacer when no cover is set to account for floating navbar */
        <div className="w-full pt-20 md:pt-24 shrink-0" />
      )}

      {/* 2. Main Profile Content Deck (Overlapping Cover if present) */}
      <div
        className={cn(
          "w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col gap-7 relative z-10 pb-28",
          hasCover ? "-mt-8 sm:-mt-10 md:-mt-12" : "pt-8"
        )}
      >
        {/* Profile Header Row: Avatar + Info side by side */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 w-full">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <UserAvatar
              name={targetAccount.name}
              avatarUrl={targetAccount.avatarUrl}
              size="2xl"
              className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-[#08090a] shadow-2xl bg-zinc-900 border border-white/10 rounded-[22px] sm:rounded-[24px]"
            />
            {canEdit && (
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="absolute inset-0 rounded-[22px] sm:rounded-[24px] bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-medium transition-opacity cursor-pointer gap-1 shadow-inner"
                title="Carica o cambia foto profilo"
              >
                <Camera className="w-5 h-5 text-white" />
                <span>Foto</span>
              </button>
            )}
          </div>

          <input
            ref={avatarFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            className="hidden"
          />

          {/* Name & Subtitle hierarchy */}
          <div className="flex flex-col items-start text-left gap-2 min-w-0">
            {/* Title / Name (H1) - Clean and uncluttered */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">
              {targetAccount.name}
            </h1>

            {/* Subtitle & Role Chips - Logical hierarchy placed right with the identity info */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-400">
              <span className="font-mono text-zinc-300">
                @{targetAccount.username || "utente"}
              </span>
              {targetAccount.title && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-300">{targetAccount.title}</span>
                </>
              )}
              {targetAccount.department && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">{targetAccount.department}</span>
                </>
              )}
              {/* Chips: Role & Self */}
              <div className="flex items-center gap-1.5 ml-1">
                {isSelf && (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15 text-[10px] font-semibold uppercase tracking-wider">
                    Tu
                  </span>
                )}
                {getRoleBadge(targetAccount.role)}
              </div>
            </div>
          </div>
        </div>

        {/* Bio (if present, rendered cleanly left-aligned) */}
        {targetAccount.bio && (
          <p className="max-w-3xl text-xs sm:text-sm text-zinc-300 leading-relaxed text-left -mt-2">
            {targetAccount.bio}
          </p>
        )}

        {/* Metadata + Social + Actions */}
        <div className="flex flex-col gap-4">
          {/* Unified Metadata & Social Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
            {targetAccount.email && (
              <a
                href={`mailto:${targetAccount.email}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title={targetAccount.email}
              >
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-mono text-[11px] text-zinc-300">{targetAccount.email}</span>
              </a>
            )}
            {targetAccount.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{targetAccount.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>{targetAccount.timezone || "Europe/Rome (UTC+1)"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>
                {t.profilePage.joinedDate}:{" "}
                {new Date(targetAccount.createdAt || Date.now()).toLocaleDateString("it-IT", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </span>

            {/* Social Links inline if present */}
            {(targetAccount.github || targetAccount.twitter || targetAccount.website) && (
              <>
                <span className="text-zinc-700 hidden sm:inline">|</span>
                <div className="flex items-center gap-3">
                  {targetAccount.github && (
                    <a
                      href={`https://github.com/${targetAccount.github.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1"
                      title={`GitHub: ${targetAccount.github}`}
                    >
                      <Github className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                      <span className="text-[11px] text-zinc-400">GitHub</span>
                    </a>
                  )}
                  {targetAccount.twitter && (
                    <a
                      href={`https://twitter.com/${targetAccount.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1"
                      title={`Twitter: ${targetAccount.twitter}`}
                    >
                      <Twitter className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                      <span className="text-[11px] text-zinc-400">Twitter</span>
                    </a>
                  )}
                  {targetAccount.website && (
                    <a
                      href={targetAccount.website.startsWith("http") ? targetAccount.website : `https://${targetAccount.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1"
                      title="Sito web"
                    >
                      <Globe className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                      <span className="text-[11px] text-zinc-400">Sito web</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={openEditModal}
                className="h-8 px-3.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t.profilePage.editProfile}</span>
              </button>
            )}

            {canEdit && !hasCover && (
              <button
                type="button"
                onClick={() => setShowCoverPicker(true)}
                className="h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Aggiungi una copertina personalizzata"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                <span>Aggiungi copertina</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveModal("new_issue")}
              className="h-8 px-3.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.profilePage.assignTask}</span>
            </button>

            {targetAccount.email && (
              <a
                href={`mailto:${targetAccount.email}`}
                className="h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                title={t.profilePage.sendEmail}
              >
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t.profilePage.sendEmail}</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t.profilePage.copyProfileLink}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiato</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.profilePage.copyProfileLink}</span>
                </>
              )}
            </button>

            {/* Subtle ID Copy Button */}
            <button
              type="button"
              onClick={() => handleCopyId(targetAccount.internalId || targetAccount.id)}
              className="h-8 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title={targetAccount.internalId ? `ID: ${targetAccount.internalId}` : `ID: ${targetAccount.id}`}
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">ID copiato</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copia ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Toolbar & Content */}
        <div className="w-full flex flex-col gap-6 pt-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Segmented Pills - strictly left-aligned */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121316] border border-white/5 w-fit select-none overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("tasks")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all cursor-pointer shrink-0",
                  activeTab === "tasks"
                    ? "bg-white/10 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{t.profilePage.assignedTasks}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[10px] font-mono">
                  {totalTasksCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all cursor-pointer shrink-0",
                  activeTab === "projects"
                    ? "bg-white/10 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{t.profilePage.associatedProjects}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[10px] font-mono">
                  {associatedProjects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("activity")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all cursor-pointer shrink-0",
                  activeTab === "activity"
                    ? "bg-white/10 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.profilePage.recentActivity}</span>
              </button>

              {viewerIsAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab("admin")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all cursor-pointer shrink-0",
                    activeTab === "admin"
                      ? "bg-sky-500/20 text-sky-300 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-sky-300 hover:bg-sky-500/10"
                  )}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t.profilePage.adminDetails}</span>
                </button>
              )}
            </div>

            {/* Sub-filters for Tasks - strictly left-aligned */}
            {activeTab === "tasks" && totalTasksCount > 0 && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121316]/60 border border-white/5 w-fit overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setTaskFilter("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0",
                    taskFilter === "all"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {t.profilePage.allTasks} ({totalTasksCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter("in_progress")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0",
                    taskFilter === "in_progress"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {t.profilePage.inProgress} ({inProgressTasksCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter("todo")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0",
                    taskFilter === "todo"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {t.profilePage.todo} ({assignedIssues.filter((i) => i.status === "todo" || i.status === "backlog").length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter("done")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0",
                    taskFilter === "done"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {t.profilePage.completed} ({completedTasksCount})
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: Assigned Issues */}
          {activeTab === "tasks" && (
            <div className="flex flex-col gap-4">
              {filteredIssues.length === 0 ? (
                <div className="py-10 px-6 sm:px-8 rounded-xl bg-[#121316]/40 border border-white/5 flex flex-col items-start text-left gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                    <CheckSquare className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex flex-col items-start text-left gap-1">
                    <span className="text-sm font-semibold text-white">
                      {t.profilePage.noTasksAssigned}
                    </span>
                    <span className="text-xs text-zinc-400 leading-relaxed max-w-lg">
                      Usa il pulsante in alto per assegnare una nuova issue a questo profilo.
                    </span>
                  </div>
                </div>
              ) : (
              <div className="rounded-xl bg-[#121316]/50 border border-white/5 divide-y divide-white/5 overflow-hidden">
                {filteredIssues.map((issue) => {
                  const proj = projects.find((p) => p.id === issue.projectId);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Status Icon */}
                        {issue.status === "done" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : issue.status === "in_progress" ? (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500 shrink-0" />
                        )}

                        <span className="font-mono text-xs text-zinc-500 shrink-0">
                          {issue.identifier}
                        </span>

                        <span className="text-xs font-medium text-white group-hover:text-sky-300 transition-colors truncate">
                          {issue.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {proj && (
                          <span className="hidden sm:inline text-[11px] text-zinc-400 font-medium px-2 py-0.5 rounded bg-white/[0.04] border border-white/5">
                            {proj.name}
                          </span>
                        )}

                        {issue.dueDate && (
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {new Date(issue.dueDate).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        )}

                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Associated Projects */}
        {activeTab === "projects" && (
          <div className="flex flex-col gap-4">
            {associatedProjects.length === 0 ? (
              <div className="py-10 px-6 sm:px-8 rounded-xl bg-[#121316]/40 border border-white/5 flex flex-col items-start text-left gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                  <Box className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex flex-col items-start text-left gap-1">
                  <span className="text-sm font-semibold text-white">
                    {t.profilePage.noProjectsAssociated}
                  </span>
                  <span className="text-xs text-zinc-400 leading-relaxed max-w-lg">
                    Questo utente non risulta attualmente lead o collaboratore di progetti attivi.
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {associatedProjects.map((project) => {
                  const isLead =
                    project.lead?.id === targetAccount.id ||
                    (targetAccount.email &&
                      project.lead?.email?.toLowerCase() === targetAccount.email.toLowerCase());
                  const completedMs = (project.milestones || []).filter((m) => m.completed).length;
                  const totalMs = (project.milestones || []).length;

                  return (
                    <Link
                      key={project.id}
                      href={`/project/${project.id}`}
                      className="p-5 rounded-xl bg-[#121316] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between gap-4 group"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <ProjectIconBadge project={project} size="md" />
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-semibold border",
                              isLead
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                                : "bg-white/[0.04] border-white/10 text-zinc-300"
                            )}
                          >
                            {isLead ? t.profilePage.leadOn : t.profilePage.collaboratorOn}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-white group-hover:text-sky-300 transition-colors text-sm">
                            {project.name}
                          </span>
                          <span className="text-xs text-zinc-500 line-clamp-2">
                            {project.description || "Nessuna descrizione del progetto."}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                        <span>
                          {totalMs > 0 ? `${completedMs}/${totalMs} milestone` : project.status}
                        </span>
                        <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-zinc-300 font-medium text-[11px]">
                          <span>Apri</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Recent Activity */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-4">
            {recentActivities.length === 0 ? (
              <div className="py-10 px-6 sm:px-8 rounded-xl bg-[#121316]/40 border border-white/5 flex flex-col items-start text-left gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                  <Clock className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex flex-col items-start text-left gap-1">
                  <span className="text-sm font-semibold text-white">
                    {t.profilePage.noRecentActivity}
                  </span>
                  <span className="text-xs text-zinc-400 leading-relaxed max-w-lg">
                    Le azioni svolte nel workspace verranno registrate automaticamente qui.
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#121316]/50 border border-white/5 divide-y divide-white/5">
                {recentActivities.map((ev) => (
                  <div key={ev.id} className="p-4 flex items-start gap-3.5 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">
                          {ev.action} - {ev.entityTitle}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {new Date(ev.timestamp).toLocaleString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {ev.description && (
                        <span className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {ev.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Admin & Owner Details & Security Controls */}
        {activeTab === "admin" && viewerIsAdmin && (
          <div className="flex flex-col gap-6">
            {/* Notice header */}
            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-sky-200">
                  {t.profilePage.adminDetails}
                </span>
                <span className="text-xs text-sky-300/80 mt-0.5">
                  {t.profilePage.adminNotice}
                </span>
              </div>
            </div>

            {/* Technical Identifiers & Database Keys */}
            <div className="p-5 rounded-xl bg-[#121316] border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Identificativi di Sistema & Accesso
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {/* Account ID */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-950/80 border border-white/5">
                  <span className="text-[11px] text-zinc-400">{t.profilePage.accountId}</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-zinc-200 truncate">{targetAccount.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(targetAccount.id)}
                      className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      title="Copia ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Internal ID */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-950/80 border border-white/5">
                  <span className="text-[11px] text-zinc-400">{t.profilePage.internalId}</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-zinc-200 truncate">
                      {targetAccount.internalId || `usr_${targetAccount.id}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(targetAccount.internalId || `usr_${targetAccount.id}`)}
                      className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      title="Copia Internal ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Verified Email */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-950/80 border border-white/5">
                  <span className="text-[11px] text-zinc-400">{t.profilePage.verifiedEmail}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-mono text-zinc-200 truncate">
                      {targetAccount.email || "Non impostata"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Department Management */}
            <div className="p-5 rounded-xl bg-[#121316] border border-white/5 flex flex-col gap-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Gestione Privilegi Workspace
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role Level Changer */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    {t.profilePage.manageRole}
                  </label>
                  <LinearSelect
                    options={[
                      ...(viewerIsOwner ? [{ value: "owner", label: "Owner (Proprietario)" }] : []),
                      ...(viewerIsOwner ? [{ value: "admin", label: "Admin (Amministratore)" }] : []),
                      { value: "member", label: "Associato (Collaboratore)" },
                      { value: "guest", label: "Ospite (Sola lettura)" },
                    ]}
                    value={targetAccount.role || "member"}
                    onChange={handleRoleChange}
                    size="md"
                    fullWidth
                  />
                  <span className="text-[11px] text-zinc-500">
                    Gli Admin hanno accesso a impostazioni e configurazioni. Gli Owner hanno il pieno controllo del workspace.
                  </span>
                </div>

                {/* Department Changer */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    {t.profilePage.department}
                  </label>
                  <LinearSelect
                    options={DEPARTMENT_OPTIONS}
                    value={targetAccount.department || "Engineering"}
                    onChange={handleDepartmentChange}
                    size="md"
                    fullWidth
                  />
                  <span className="text-[11px] text-zinc-500">
                    Dipartimento funzionale utilizzato per raggruppare i filtri dei membri e la pianificazione.
                  </span>
                </div>
              </div>

              {/* Advanced Security & RLS Capabilities */}
              <div className="pt-4 border-t border-white/5 flex flex-col gap-2.5 text-xs">
                <span className="font-semibold text-zinc-300">Criteri di Sicurezza & Accesso RLS</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/5 flex flex-col gap-1">
                    <span className="text-zinc-500 text-[11px]">Tenant RLS</span>
                    <span className="font-medium text-emerald-400">Attivo su {workspace?.name}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/5 flex flex-col gap-1">
                    <span className="text-zinc-500 text-[11px]">Protocollo MCP</span>
                    <span className="font-medium text-white">Accesso standard autorizzato</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/5 flex flex-col gap-1">
                    <span className="text-zinc-500 text-[11px]">Esportazione CSV / Dump</span>
                    <span className="font-medium text-white">
                      {targetAccount.role === "guest" ? "Disabilitata" : "Abilitata"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger Zone Actions (Only if not self and not target owner) */}
              {!isSelf && targetAccount.role !== "owner" && (
                <div className="pt-4 border-t border-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-red-400">
                      Revoca Accesso al Workspace
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Rimuove il profilo da questo workspace. Le issue assegnate rimarranno storicizzate.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Sei sicuro di voler rimuovere ${targetAccount.name} da questo workspace?`)) {
                        deleteAccount(targetAccount.id);
                        addToast({
                          title: "Membro rimosso",
                          description: `${targetAccount.name} è stato rimosso dal workspace.`,
                          type: "info",
                        });
                        router.push("/settings/members");
                      }
                    }}
                    className="h-8 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-300 text-xs font-medium transition-colors cursor-pointer shrink-0"
                  >
                    {t.profilePage.removeFromWorkspace}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Cover Picker Modal */}
      <ProjectCoverPicker
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        currentCoverUrl={targetAccount.coverUrl}
        currentCoverGradient={targetAccount.coverGradient}
        onSave={({ coverUrl, coverGradient }) => {
          handleUpdateCover(coverUrl, coverGradient);
          setShowCoverPicker(false);
        }}
      />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#121316] border border-white/10 shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.profilePage.editProfile}
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs">
              {/* Profile Photo Control */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-950 border border-white/10">
                <UserAvatar
                  name={formName || targetAccount.name}
                  avatarUrl={targetAccount.avatarUrl}
                  size="xl"
                  className="w-14 h-14 rounded-[14px] ring-2 ring-white/10 shrink-0"
                />
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-zinc-200 font-semibold text-xs">Foto del profilo</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Carica foto</span>
                    </button>
                    {targetAccount.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-2.5 py-1.5 rounded-md bg-transparent hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Rimuovi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 font-semibold">Nome Completo</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="h-9 px-3 rounded-lg bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 font-semibold">{t.profilePage.jobTitle}</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Software Engineer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 font-semibold">{t.profilePage.department}</label>
                <LinearSelect
                  options={DEPARTMENT_OPTIONS}
                  value={formDept}
                  onChange={setFormDept}
                  size="md"
                  fullWidth
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 font-semibold">{t.profilePage.bio}</label>
                <textarea
                  rows={3}
                  placeholder="Una breve descrizione del tuo ruolo e delle tue aree di competenza..."
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="p-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-white/30 leading-relaxed"
                />
              </div>

              {/* Location & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 font-semibold">{t.profilePage.location}</label>
                  <input
                    type="text"
                    placeholder="Milano, Italia"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 font-semibold">Telefono</label>
                  <input
                    type="text"
                    placeholder="+39 02 1234567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Links: GitHub, Twitter, Website */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 font-semibold">GitHub</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formGithub}
                    onChange={(e) => setFormGithub(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 font-semibold">Twitter / X</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formTwitter}
                    onChange={(e) => setFormTwitter(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 font-semibold">Sito Web</label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t.profilePage.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  {t.profilePage.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
