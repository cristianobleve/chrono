"use client";

import React from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { ShieldCheck, Clock, Key, Database, Sparkles, CheckCircle2, Globe, Server, LogOut, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import { removeLocalAvatar, saveLocalAvatar } from "@/lib/storage";
import { useTranslation } from "@/i18n";
import { LinearSelect } from "@/components/ui/LinearSelect";

const SESSION_TIMEOUT_OPTIONS = [
  { value: "1 hour", label: "1 hour" },
  { value: "4 hours", label: "4 hours" },
  { value: "8 hours", label: "8 hours" },
  { value: "24 hours", label: "24 hours" },
];

export default function SettingsGeneralPage() {
  const { workspace, currentUser, team, updateCurrentUser, addToast } = useLinearStore();
  const { t } = useTranslation();

  const [name, setName] = React.useState(currentUser.name || "");
  const [username, setUsername] = React.useState(currentUser.username || "");
  const [email, setEmail] = React.useState(currentUser.email || "");
  const [role, setRole] = React.useState(currentUser.role || "Member");
  const [avatarUrl, setAvatarUrl] = React.useState<string>(currentUser.avatarUrl || currentUser.avatar || "");
  const [sessionTimeout, setSessionTimeout] = React.useState("1 hour");
  const [mfaEnabled, setMfaEnabled] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      void saveLocalAvatar(currentUser.id || "user-1", reader.result)
        .then((localAvatarReference) => {
          setAvatarUrl(localAvatarReference);
          updateCurrentUser({ avatarUrl: localAvatarReference });
          addToast({
            title: "Immagine caricata",
            description: "Foto profilo aggiornata e sincronizzata.",
            type: "success",
          });
        })
        .catch(() => addToast({
          title: "Caricamento non riuscito",
          description: "Il browser non ha potuto salvare l'immagine.",
          type: "error",
        }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateCurrentUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      role: role.trim(),
      avatarUrl: avatarUrl.trim() || null,
    });
    setTimeout(() => {
      setIsSaving(false);
      addToast({
        title: t.generalSettings.savedToast,
        description: t.generalSettings.savedToastDesc,
        type: "success",
      });
    }, 250);
  };

  return (
    <div className="flex-1 p-6 md:p-10 w-full max-w-5xl flex flex-col gap-8 text-ink select-none pb-24 bg-[#09090b]">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.generalSettings.title}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {t.generalSettings.subtitle}
        </p>
      </div>

      {/* Profile & Network Identity Form */}
      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {t.generalSettings.profileTitle}
          </h2>
          <div className="rounded-[16px] bg-zinc-900/60 border border-white/5 p-6 flex flex-col gap-5">
            {/* Avatar & User Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div className="flex items-center gap-4 min-w-0">
                <UserAvatar
                  name={name}
                  avatarUrl={avatarUrl}
                  size="xl"
                  className="w-16 h-16 rounded-[12px] text-xl shadow-lg border-white/15 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{name || "Utente"}</span>
                    <InternalIdBadge
                      id={currentUser.identifier || "USR-1"}
                      internalId={currentUser.internalId || "usr_01"}
                      size="xs"
                    />
                  </div>
                  <span className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                    {username || "user"}.chrono.engineering
                  </span>
                </div>
              </div>

              {/* Avatar Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-[6px] bg-zinc-800 hover:bg-zinc-750 border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.generalSettings.uploadPhoto}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      void removeLocalAvatar(currentUser.id || "user-1");
                      setAvatarUrl("");
                      updateCurrentUser({ avatarUrl: null });
                      addToast({
                        title: "Foto rimossa",
                        description: "La foto del profilo è stata eliminata.",
                        type: "info",
                      });
                    }}
                    className="h-8 px-2.5 rounded-[6px] bg-zinc-900/60 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={t.generalSettings.removePhoto}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.generalSettings.removePhoto}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Avatar URL Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {t.generalSettings.avatarUrlLabel}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={avatarUrl.startsWith("data:") || avatarUrl.startsWith("local-avatar:") ? "" : avatarUrl}
                    placeholder={t.generalSettings.avatarUrlPlaceholder}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-zinc-950 border border-white/10 focus:border-white/30 text-white text-xs placeholder:text-zinc-600 focus:outline-none transition-colors font-mono"
                  />
                </div>
                {avatarUrl && !avatarUrl.startsWith("data:") && !avatarUrl.startsWith("local-avatar:") && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="h-9 px-3 rounded-[8px] border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white text-xs transition-colors shrink-0"
                  >
                    {t.common.cancel}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t.generalSettings.fullNameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-zinc-950 border border-white/10 focus:border-white/30 text-white text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t.generalSettings.usernameLabel}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-zinc-950 border border-white/10 focus:border-white/30 text-white text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t.generalSettings.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-zinc-950 border border-white/10 focus:border-white/30 text-white text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t.generalSettings.roleLabel}
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-zinc-950 border border-white/10 focus:border-white/30 text-white text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-[10px] bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? t.generalSettings.saving : t.generalSettings.saveProfile}
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {t.generalSettings.securityTitle}
          </h2>
          <div className="rounded-[16px] bg-zinc-900/60 border border-white/5 p-6 flex flex-col gap-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[12px] bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{t.generalSettings.sessionTimeout}</span>
                  <span className="text-[11px] text-zinc-400">{t.generalSettings.sessionTimeoutDesc}</span>
                </div>
              </div>

              <LinearSelect
                value={sessionTimeout}
                onChange={setSessionTimeout}
                options={SESSION_TIMEOUT_OPTIONS}
                align="right"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[12px] bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Key className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{t.generalSettings.twoFactor}</span>
                  <span className="text-[11px] text-zinc-400">{t.generalSettings.twoFactorDesc}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                  mfaEnabled ? "bg-white" : "bg-zinc-800"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full transition-transform absolute top-1",
                    mfaEnabled ? "right-1 bg-zinc-950" : "left-1 bg-white"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Cloud & AI Infrastructure */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          {t.generalSettings.infrastructureTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-[16px] bg-zinc-900/60 border border-white/5 p-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase PostgreSQL</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-zinc-400 font-mono truncate">
              bicoxqwmpznpjjgwmrgw.supabase.co
            </span>
          </div>

          <div className="rounded-[16px] bg-zinc-900/60 border border-white/5 p-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Gemini 2.5 Flash AI</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              gemini-flash-lite-latest (Active)
            </span>
          </div>
        </div>
      </div>

      {/* Session & Logout Section */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          {t.generalSettings.sessionTitle}
        </h2>
        <div className="rounded-[16px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-red-500/20 bg-red-950/10">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-white text-xs">{t.generalSettings.logoutDevice}</span>
            <span className="text-[11px] text-zinc-400">
              {t.generalSettings.logoutDeviceDesc}
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const { supabase } = await import("@/lib/supabase");
                await supabase.auth.signOut();
              } catch (e) {}
              window.location.href = "/login";
            }}
            className="px-4 py-2 rounded-[10px] bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>{t.generalSettings.logoutButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
