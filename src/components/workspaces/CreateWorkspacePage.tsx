"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { supabase } from "@/lib/supabase";
import { WorkspaceIcon } from "@/components/workspaces/WorkspaceIcon";
import {
  WorkspaceIconPicker,
  WORKSPACE_COLOR_PALETTES,
} from "@/components/workspaces/WorkspaceIconPicker";
import { LogOut, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWorkspacePageProps {
  onBack?: () => void;
}

export const CreateWorkspacePage: React.FC<CreateWorkspacePageProps> = ({ onBack }) => {
  const { createWorkspace, pullFromSupabase, currentUser, addToast } = useLinearStore();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("chrono");
  const [iconBg, setIconBg] = useState(WORKSPACE_COLOR_PALETTES[0].bg);
  const [iconColor, setIconColor] = useState(WORKSPACE_COLOR_PALETTES[0].color);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  // Fetch avatar from Supabase session (IdP photo) or fallback to blobatar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const idpAvatar =
        session?.user?.user_metadata?.avatar_url ||
        session?.user?.user_metadata?.picture ||
        null;
      if (idpAvatar) {
        setAvatarUrl(idpAvatar);
      } else {
        const seed = encodeURIComponent(
          session?.user?.email || session?.user?.id || currentUser.email || "user"
        );
        setAvatarUrl(`https://blobatar.dev/${seed}.svg`);
      }
    });
  }, [currentUser.email]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createWorkspace(
        {
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          icon,
          iconBg,
          iconColor,
          logoUrl,
          plan: "Free",
        },
        false
      );
      await pullFromSupabase();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Impossibile salvare il workspace su Supabase.";
      addToast({
        title: "Creazione workspace non riuscita",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    useLinearStore.setState({
      workspaces: [],
      currentWorkspaceId: "",
      projects: [],
      issues: [],
    });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("chrono_app_store_v8");
      } catch {}
    }
    window.location.assign("/login");
  };

  const userDisplay = currentUser.email || currentUser.name || "user";

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#08090a] text-white select-none">
      {/* Minimal top bar */}
      <header className="w-full h-12 px-5 flex items-center justify-between text-[11px] text-zinc-500">
        {/* Left: back or sign out */}
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign out</span>
          </button>
        )}

        {/* Right: avatar + email */}
        <div className="flex items-center gap-2">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="font-mono text-zinc-500 text-[11px] max-w-[200px] truncate">
            {userDisplay}
          </span>
        </div>
      </header>

      {/* Main centered form */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <form onSubmit={handleCreate} className="w-full max-w-[480px] flex flex-col gap-6">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Create your workspace
          </h1>

          {/* Icon + Name row */}
          <div className="flex items-start gap-3">
            {/* Full Icon / Custom Image Picker Button & Popover */}
            <div className="relative shrink-0" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setShowPicker((v) => !v)}
                title="Change workspace icon or logo"
                className="rounded-lg hover:ring-1 hover:ring-white/30 transition-all cursor-pointer"
              >
                <WorkspaceIcon
                  icon={icon}
                  iconBg={iconBg}
                  iconColor={iconColor}
                  logoUrl={logoUrl}
                  name={name || "W"}
                  size="lg"
                />
              </button>

              {showPicker && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-30 animate-fade-in">
                  <WorkspaceIconPicker
                    selectedIcon={icon}
                    selectedBg={iconBg}
                    selectedColor={iconColor}
                    logoUrl={logoUrl}
                    name={name}
                    onChange={(updates) => {
                      setIcon(updates.icon);
                      setIconBg(updates.iconBg);
                      setIconColor(updates.iconColor);
                      if (updates.logoUrl !== undefined) {
                        setLogoUrl(updates.logoUrl);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Name field */}
            <div className="flex-1">
              <input
                type="text"
                autoFocus
                placeholder="Workspace name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>
          </div>

          {/* URL slug */}
          <div
            className={cn(
              "h-11 px-3.5 rounded-lg bg-zinc-900 border border-white/10 flex items-center text-sm focus-within:border-white/25 transition-colors",
              !slug && "opacity-50"
            )}
          >
            <span className="shrink-0 text-zinc-500 text-xs font-mono select-none">
              chrono.engineering/
            </span>
            <input
              type="text"
              placeholder="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none pl-1 min-w-0"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full h-11 rounded-lg bg-white hover:bg-zinc-100 disabled:opacity-40 text-black font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating workspace...</span>
              </>
            ) : (
              <span>Confirm and create</span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};
