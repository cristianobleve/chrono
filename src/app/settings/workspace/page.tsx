"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { WorkspaceIcon } from "@/components/workspaces/WorkspaceIcon";
import { WORKSPACE_COLOR_PALETTES } from "@/components/workspaces/WorkspaceIconPicker";
import { Save, Upload, X, Palette, Check } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { LinearSelect } from "@/components/ui/LinearSelect";

const FISCAL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function WorkspaceSettingsPage() {
  const { workspace, workspaces, updateWorkspace, deleteWorkspace, addToast } = useLinearStore();
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(workspace?.name || "");
  const [slug, setSlug] = useState(workspace?.slug || "");
  const [icon, setIcon] = useState(workspace?.icon || "chrono");
  const [iconBg, setIconBg] = useState(workspace?.iconBg || "#121419");
  const [iconColor, setIconColor] = useState(workspace?.iconColor || "#5e6ad2");
  const [logoUrl, setLogoUrl] = useState<string | null>(workspace?.logoUrl || null);
  const [fiscalYearStart, setFiscalYearStart] = useState(workspace?.fiscalYearStart || "January");
  const [region] = useState(workspace?.region || "European Union");

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "");
      setSlug(workspace.slug || "");
      setIcon(workspace.icon || "chrono");
      setIconBg(workspace.iconBg || "#121419");
      setIconColor(workspace.iconColor || "#5e6ad2");
      setLogoUrl(workspace.logoUrl || null);
      setFiscalYearStart(workspace.fiscalYearStart || "January");
    }
  }, [workspace]);

  // Handle local image file upload for Workspace Logo
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: "File troppo grande",
        description: "L'immagine selezionata supera il limite di 5MB.",
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoUrl(result);
      if (workspace?.id) {
        updateWorkspace(workspace.id, { logoUrl: result });
      }
      addToast({
        title: "Logo aggiornato",
        description: "Il nuovo logo del workspace è stato caricato.",
        type: "success",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoUrl(null);
    if (workspace?.id) {
      updateWorkspace(workspace.id, { logoUrl: null });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    addToast({
      title: "Logo rimosso",
      description: "Ripristinata l'icona/iniziale predefinita del workspace.",
      type: "info",
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!workspace?.id || !name.trim()) return;

    setIsSaving(true);
    try {
      updateWorkspace(workspace.id, {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        icon,
        iconBg,
        iconColor,
        logoUrl,
        fiscalYearStart,
        region,
      });

      addToast({
        title: "Modifiche salvate",
        description: "Le impostazioni del workspace sono state aggiornate.",
        type: "success",
      });
    } catch (err: any) {
      addToast({
        title: "Errore di salvataggio",
        description: err?.message || "Impossibile aggiornare il workspace.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (workspaces.length <= 1) {
      addToast({
        title: "Impossibile eliminare",
        description: "Devi avere almeno un altro workspace per eliminare questo.",
        type: "error",
      });
      return;
    }

    if (window.confirm(`Sei sicuro di voler eliminare definitivamente il workspace "${workspace.name}"?`)) {
      deleteWorkspace(workspace.id);
      addToast({
        title: "Workspace eliminato",
        description: `Il workspace "${workspace.name}" è stato rimosso.`,
        type: "info",
      });
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl p-6 md:p-10 flex flex-col gap-8 text-white select-none pb-28">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Workspace
        </h1>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Salvataggio..." : "Salva modifiche"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {/* Section 1: Basic Identity (Logo, Name, URL) */}
        <div className="rounded-xl border border-white/5 bg-[#121316]/50 divide-y divide-white/5 overflow-hidden">
          {/* Row 1: Logo */}
          <div className="p-4 md:px-5 md:py-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-medium text-white">Logo</span>
              <span className="text-xs text-zinc-400 mt-0.5">
                Recommended size is 256x256px
              </span>
            </div>

            {/* Logo Badge Container (Larger, Clickable to upload from disk) */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="relative group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Clicca per caricare un'immagine dal tuo computer"
                  className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer flex items-center justify-center shadow-md bg-zinc-900"
                >
                  <WorkspaceIcon
                    icon={icon}
                    iconBg={iconBg}
                    iconColor={iconColor}
                    logoUrl={logoUrl}
                    name={name || "W"}
                    size="xl"
                    className="w-full h-full rounded-xl"
                  />

                  {/* Hover Overlay with Upload Icon */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </button>

                {/* Remove button if custom logo is present */}
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    title="Rimuovi logo personalizzato"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Color picker toggle for default avatar */}
              {!logoUrl && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    title="Tonalità sfondo icona"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Palette className="w-4 h-4" />
                  </button>

                  {showColorPicker && (
                    <div className="absolute right-0 top-10 z-20 p-2 rounded-lg bg-[#18191d] border border-white/10 shadow-xl flex items-center gap-1.5">
                      {WORKSPACE_COLOR_PALETTES.map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => {
                            setIconBg(pal.bg);
                            setIconColor(pal.color);
                            setShowColorPicker(false);
                          }}
                          className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: pal.color }}
                        >
                          {iconColor === pal.color && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Name */}
          <div className="p-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <label className="text-xs md:text-sm font-medium text-white">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full md:max-w-xs h-9 px-3 rounded-lg bg-[#18191d] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Row 3: URL */}
          <div className="p-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <label className="text-xs md:text-sm font-medium text-white">
              URL
            </label>
            <div className="w-full md:max-w-xs h-9 px-3 rounded-lg bg-[#18191d] border border-white/10 flex items-center text-xs text-zinc-500 focus-within:border-white/30 transition-colors">
              <span className="shrink-0 select-none font-mono text-[11px] text-zinc-500">
                chrono.engineering/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs focus:outline-none pl-1"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Time & region */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Time & region
          </h2>

          <div className="rounded-xl border border-white/5 bg-[#121316]/50 divide-y divide-white/5">
            {/* Row 1: Fiscal Year with Linear Custom Dropdown */}
            <div className="p-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 relative">
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-medium text-white">
                  First month of the fiscal year
                </span>
                <span className="text-xs text-zinc-400 mt-0.5">
                  Used when grouping projects and issues quarterly, half-yearly, and yearly
                </span>
              </div>

              <LinearSelect
                options={FISCAL_MONTHS.map((month) => ({ value: month, label: month }))}
                value={fiscalYearStart}
                onChange={setFiscalYearStart}
                align="right"
              />
            </div>

            {/* Row 2: Region */}
            <div className="p-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-medium text-white">
                  Region
                </span>
                <span className="text-xs text-zinc-400 mt-0.5">
                  Set when a workspace is created and cannot be changed.
                </span>
              </div>

              <span className="text-xs font-medium text-zinc-300">
                {region}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Danger zone */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Danger zone
          </h2>

          <div className="rounded-xl border border-white/5 bg-[#121316]/50 p-4 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-medium text-white">
                Delete workspace
              </span>
              <span className="text-xs text-zinc-400 mt-0.5">
                Schedule workspace to be permanently deleted
              </span>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="shrink-0 px-3.5 py-2 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-medium text-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              Delete workspace
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
