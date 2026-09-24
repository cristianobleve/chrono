"use client";

import React, { useState } from "react";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { X, Check, Upload, Sparkles, Image as ImageIcon, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColorPreset {
  id: string;
  name: string;
  bg: string;
  color: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: "crimson", name: "Crimson Red (Screenshot)", bg: "#2a0808", color: "#e53e3e" },
  { id: "white", name: "High Contrast", bg: "#ffffff", color: "#000000" },
  { id: "violet", name: "Cyber Violet", bg: "#1e0b2b", color: "#c084fc" },
  { id: "emerald", name: "Emerald Mint", bg: "#062316", color: "#34d399" },
  { id: "cyan", name: "Electric Cyan", bg: "#061e26", color: "#38bdf8" },
  { id: "amber", name: "Solar Amber", bg: "#2b1c06", color: "#fbbf24" },
  { id: "indigo", name: "Royal Indigo", bg: "#0d102e", color: "#818cf8" },
  { id: "slate", name: "Obsidian Slate", bg: "#15171d", color: "#ffffff" },
];

interface ProjectIconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: string | null;
  iconBg?: string | null;
  iconColor?: string | null;
  projectName: string;
  onSave: (customization: { icon: string; iconBg: string; iconColor: string }) => void;
}

export const ProjectIconPicker: React.FC<ProjectIconPickerProps> = ({
  isOpen,
  onClose,
  icon,
  iconBg,
  iconColor,
  projectName,
  onSave,
}) => {
  const [selectedBg, setSelectedBg] = useState(iconBg || "#2a0808");
  const [selectedColor, setSelectedColor] = useState(iconColor || "#e53e3e");
  const [letterText, setLetterText] = useState(
    icon && !icon.startsWith("http") && !icon.startsWith("/") && !icon.startsWith("data:")
      ? icon
      : projectName.charAt(0).toUpperCase() || "L"
  );
  const [imageUrl, setImageUrl] = useState(
    icon && (icon.startsWith("http") || icon.startsWith("/") || icon.startsWith("data:"))
      ? icon
      : ""
  );
  const [mode, setMode] = useState<"presets" | "image">("presets");

  if (!isOpen) return null;

  const handleApplyPreset = (preset: ColorPreset) => {
    setSelectedBg(preset.bg);
    setSelectedColor(preset.color);
    setImageUrl("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setImageUrl(dataUrl);
        setMode("image");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    onSave({
      icon: imageUrl.trim() ? imageUrl.trim() : (letterText.trim().toUpperCase() || "L"),
      iconBg: selectedBg,
      iconColor: selectedColor,
    });
    onClose();
  };

  // Preview display character (first letter if longer)
  const displayChar = letterText ? letterText.charAt(0).toUpperCase() : "L";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[4px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[18px] p-6 flex flex-col gap-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[12px] bg-zinc-800 text-white border border-white/10 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Personalizza Icona Progetto
              </h2>
              <p className="text-[11px] text-zinc-400">
                Scegli il superquadrato, i colori del tema o carica un'immagine.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Superquadrato */}
        <div className="p-5 rounded-[14px] bg-zinc-900/60 border border-white/5 flex items-center gap-4">
          <ProjectIconBadge
            size="xl"
            icon={imageUrl || letterText}
            iconBg={selectedBg}
            iconColor={selectedColor}
            name={projectName}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-base truncate">
              {projectName || "Nome Progetto"}
            </span>
            <span className="text-xs text-zinc-400 font-mono mt-0.5">
              Badge Superquadrato Edge-Style
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-[12px] bg-zinc-900/60 border border-white/5">
          <button
            type="button"
            onClick={() => setMode("presets")}
            className={cn(
              "flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              mode === "presets"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Temi & Lettera</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("image")}
            className={cn(
              "flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              mode === "image"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Immagine / File</span>
          </button>
        </div>

        {mode === "presets" ? (
          <div className="flex flex-col gap-4">
            {/* Custom Letter / Symbol */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Lettera o Simbolo</label>
              <input
                type="text"
                maxLength={4}
                value={letterText}
                onChange={(e) => {
                  setLetterText(e.target.value);
                  setImageUrl("");
                }}
                placeholder="Es. L, C, AI..."
                className="px-3.5 py-2 rounded-[12px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-bold font-mono uppercase focus:outline-none"
              />
            </div>

            {/* Presets Grid */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Preset Colori Superquadrato</label>
              <div className="grid grid-cols-4 gap-2.5">
                {COLOR_PRESETS.map((p) => {
                  const isSelected = selectedBg === p.bg && selectedColor === p.color && !imageUrl;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={cn(
                        "h-16 rounded-[12px] flex flex-col items-center justify-center gap-1 transition-all border relative cursor-pointer",
                        isSelected
                          ? "ring-2 ring-white border-white"
                          : "border-white/5 hover:border-white/20"
                      )}
                      style={{ backgroundColor: p.bg }}
                    >
                      <span className="font-bold text-base leading-none" style={{ color: p.color }}>
                        {displayChar}
                      </span>
                      <span
                        className="text-[9px] font-medium leading-none truncate max-w-[70px]"
                        style={{ color: p.color }}
                      >
                        {p.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* File Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Carica Immagine da Computer</label>
              <label className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-[14px] p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/40 transition-all">
                <Upload className="w-5 h-5 text-zinc-400" />
                <span className="text-xs text-white font-medium">Seleziona immagine...</span>
                <span className="text-[10px] text-zinc-500">PNG, JPG, SVG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Custom URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Oppure Incolla URL Immagine</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... o /avatars/project.png"
                className="px-3.5 py-2 rounded-[12px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-[12px] text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-[12px] bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Salva Icona</span>
          </button>
        </div>
      </div>
    </div>
  );
};
