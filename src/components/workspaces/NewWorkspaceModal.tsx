"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { X, Sparkles, ChevronDown, Check } from "lucide-react";
import { WorkspaceIcon } from "@/components/workspaces/WorkspaceIcon";
import { WORKSPACE_COLOR_PALETTES } from "@/components/workspaces/WorkspaceIconPicker";
import { useTranslation } from "@/i18n";
import { LinearSelect } from "@/components/ui/LinearSelect";

const REGION_OPTIONS = [
  { value: "European Union", label: "European Union (Frankfurt)" },
  { value: "United States", label: "United States (N. Virginia)" },
];

export const NewWorkspaceModal: React.FC = () => {
  const { t } = useTranslation();
  const { activeModal, setActiveModal, createWorkspace } = useLinearStore();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("chrono");
  const [iconBg, setIconBg] = useState(WORKSPACE_COLOR_PALETTES[0].bg);
  const [iconColor, setIconColor] = useState(WORKSPACE_COLOR_PALETTES[0].color);
  const [region, setRegion] = useState("European Union");
  const [includeDemoData, setIncludeDemoData] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (activeModal !== "new_workspace") return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleClose = () => {
    setActiveModal(null);
    setName("");
    setSlug("");
    setIcon("chrono");
    setShowColorPicker(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createWorkspace(
      {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        icon,
        iconBg,
        iconColor,
        region,
        plan: "Pro",
      },
      includeDemoData
    );

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[440px] bg-[#0c0d10] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-5 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400 bg-[#121316]/70 shrink-0">
          <span className="font-semibold text-white tracking-tight">Create a workspace</span>
          <button
            onClick={handleClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleCreate} className="p-5 flex flex-col gap-4 text-xs">
          {/* Logo & Name Row */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-zinc-400">
              Name
            </label>
            <div className="flex items-center gap-3">
              {/* Clickable compact logo badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  title="Cambia colore logo"
                  className="rounded-lg p-0.5 hover:ring-1 hover:ring-white/30 transition-all cursor-pointer"
                >
                  <WorkspaceIcon
                    icon={icon}
                    iconBg={iconBg}
                    iconColor={iconColor}
                    name={name || "W"}
                    size="md"
                  />
                </button>

                {/* Color Palette Popover */}
                {showColorPicker && (
                  <div className="absolute left-0 top-11 z-20 p-2 rounded-lg bg-[#18191d] border border-white/10 shadow-xl flex items-center gap-1.5">
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

              <input
                type="text"
                autoFocus
                placeholder="e.g. Acme Corp"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg bg-[#141518] border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-zinc-400">
              URL
            </label>
            <div className="h-9 px-3 rounded-lg bg-[#141518] border border-white/10 flex items-center text-xs text-zinc-500 focus-within:border-white/30 transition-colors">
              <span className="shrink-0 select-none font-mono text-[11px] text-zinc-500">
                chrono.engineering/
              </span>
              <input
                type="text"
                placeholder="acme"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs focus:outline-none pl-1"
              />
            </div>
          </div>

          {/* Region */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-zinc-400">
              Region
            </label>
            <LinearSelect
              size="md"
              fullWidth
              value={region}
              onChange={setRegion}
              options={REGION_OPTIONS}
            />
          </div>

          {/* Include Showcase Demo Data Option */}
          <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-[#141518]/60 hover:bg-[#141518] transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDemoData}
              onChange={(e) => setIncludeDemoData(e.target.checked)}
              className="rounded border-white/20 bg-zinc-900 text-white focus:ring-0 cursor-pointer accent-white"
            />
            <span className="text-[11px] text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Includi dati dimostrativi (Nebula Core)
            </span>
          </label>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold text-xs transition-colors cursor-pointer"
            >
              Crea workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
