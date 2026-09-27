"use client";

import React, { useState, useMemo } from "react";
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import {
  X,
  Check,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Search,
  Database,
  Server,
  Bolt,
  Layers,
  Box,
  Shield,
  BrowserTerminal,
  Globe,
  Cpu,
  Flame,
  Activity,
  Compass,
  Code,
  Rocket,
  Lock,
  Key,
  Folder,
  HardDrive,
  Star,
  Bookmark,
  ChartBar,
  Cloud,
  Route,
  Camera,
  CheckCircle,
  Hashtag,
  ArchiveBox,
} from "reicon-react";
import { cn } from "@/lib/utils";

export interface ColorPreset {
  id: string;
  name: string;
  bg: string;
  color: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: "crimson", name: "Crimson Red", bg: "#2a0808", color: "#e53e3e" },
  { id: "white", name: "High Contrast", bg: "#ffffff", color: "#000000" },
  { id: "violet", name: "Cyber Violet", bg: "#1e0b2b", color: "#c084fc" },
  { id: "emerald", name: "Emerald Mint", bg: "#062316", color: "#34d399" },
  { id: "cyan", name: "Electric Cyan", bg: "#061e26", color: "#38bdf8" },
  { id: "amber", name: "Solar Amber", bg: "#2b1c06", color: "#fbbf24" },
  { id: "indigo", name: "Royal Indigo", bg: "#0d102e", color: "#818cf8" },
  { id: "slate", name: "Obsidian Slate", bg: "#15171d", color: "#ffffff" },
];

export const CURATED_REICON_ICONS = [
  { id: "database", name: "Database", icon: Database },
  { id: "server", name: "Server", icon: Server },
  { id: "bolt", name: "Bolt", icon: Bolt },
  { id: "layers", name: "Layers", icon: Layers },
  { id: "box", name: "Box", icon: Box },
  { id: "shield", name: "Shield", icon: Shield },
  { id: "terminal", name: "Terminal", icon: BrowserTerminal },
  { id: "globe", name: "Globe", icon: Globe },
  { id: "sparkles", name: "Sparkles", icon: Sparkles },
  { id: "cpu", name: "CPU", icon: Cpu },
  { id: "flame", name: "Flame", icon: Flame },
  { id: "activity", name: "Activity", icon: Activity },
  { id: "compass", name: "Compass", icon: Compass },
  { id: "code", name: "Code", icon: Code },
  { id: "rocket", name: "Rocket", icon: Rocket },
  { id: "lock", name: "Lock", icon: Lock },
  { id: "key", name: "Key", icon: Key },
  { id: "folder", name: "Folder", icon: Folder },
  { id: "harddrive", name: "Hard Drive", icon: HardDrive },
  { id: "star", name: "Star", icon: Star },
  { id: "bookmark", name: "Bookmark", icon: Bookmark },
  { id: "chartbar", name: "Chart", icon: ChartBar },
  { id: "cloud", name: "Cloud", icon: Cloud },
  { id: "route", name: "Route", icon: Route },
  { id: "camera", name: "Camera", icon: Camera },
  { id: "checkcircle", name: "Check", icon: CheckCircle },
  { id: "hashtag", name: "Tag", icon: Hashtag },
  { id: "archivebox", name: "Archive", icon: ArchiveBox },
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
  const [currentSelectedIcon, setCurrentSelectedIcon] = useState(
    icon && !icon.startsWith("http") && !icon.startsWith("/") && !icon.startsWith("data:")
      ? icon
      : "database"
  );
  const [imageUrl, setImageUrl] = useState(
    icon && (icon.startsWith("http") || icon.startsWith("/") || icon.startsWith("data:"))
      ? icon
      : ""
  );
  const [mode, setMode] = useState<"reicon" | "presets" | "image">("reicon");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return CURATED_REICON_ICONS;
    const q = searchQuery.toLowerCase().trim();
    return CURATED_REICON_ICONS.filter(
      (item) => item.id.includes(q) || item.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: ColorPreset) => {
    setSelectedBg(preset.bg);
    setSelectedColor(preset.color);
  };

  const handleSelectReicon = (iconId: string) => {
    setCurrentSelectedIcon(iconId);
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
      icon: imageUrl.trim() ? imageUrl.trim() : (currentSelectedIcon.trim() || "database"),
      iconBg: selectedBg,
      iconColor: selectedColor,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[4px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[18px] p-6 flex flex-col gap-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[12px] bg-zinc-800 text-white border border-white/10 flex items-center justify-center">
              <Bolt size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Personalizza Icona Progetto
              </h2>
              <p className="text-[11px] text-zinc-400">
                Seleziona icone Reicon, temi colore o carica una grafica personalizzata.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Preview Superquadrato */}
        <div className="p-4 rounded-[14px] bg-zinc-900/60 border border-white/5 flex items-center gap-4">
          <ProjectIconBadge
            size="xl"
            icon={imageUrl || currentSelectedIcon}
            iconBg={selectedBg}
            iconColor={selectedColor}
            name={projectName}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-base truncate">
              {projectName || "Nome Progetto"}
            </span>
            <span className="text-xs text-zinc-400 font-mono mt-0.5">
              {imageUrl ? "Immagine personalizzata" : `Icona Reicon: ${currentSelectedIcon}`}
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-[12px] bg-zinc-900/60 border border-white/5">
          <button
            type="button"
            onClick={() => setMode("reicon")}
            className={cn(
              "flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              mode === "reicon"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Bolt size={14} />
            <span>Icone Reicon</span>
          </button>

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
            <Palette size={14} />
            <span>Colori & Tema</span>
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
            <ImageIcon size={14} />
            <span>Immagine / File</span>
          </button>
        </div>

        {/* Tab 1: Reicon Catalog */}
        {mode === "reicon" && (
          <div className="flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca icone Reicon (database, bolt, server, rocket, shield...)"
                className="w-full pl-9 pr-3.5 py-2 rounded-[12px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {/* Reicon Icons Grid */}
            <div className="grid grid-cols-7 gap-2 max-h-[190px] overflow-y-auto p-1 custom-scrollbar">
              {filteredIcons.map((item) => {
                const IconComp = item.icon;
                const isSelected = currentSelectedIcon.toLowerCase() === item.id && !imageUrl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.name}
                    onClick={() => handleSelectReicon(item.id)}
                    className={cn(
                      "h-11 rounded-[10px] flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer",
                      isSelected
                        ? "bg-white text-black border-white shadow-md scale-105"
                        : "bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border-white/5"
                    )}
                  >
                    <IconComp size={18} color="currentColor" />
                  </button>
                );
              })}
            </div>

            {/* Direct Reicon Name Input */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <span className="text-[11px] text-zinc-400 shrink-0">Oppure inserisci nome:</span>
              <input
                type="text"
                value={currentSelectedIcon}
                onChange={(e) => {
                  setCurrentSelectedIcon(e.target.value);
                  setImageUrl("");
                }}
                placeholder="Es. database, rocket, flame..."
                className="flex-1 px-3 py-1.5 rounded-[10px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Color Presets */}
        {mode === "presets" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Preset Colori Superquadrato</label>
              <div className="grid grid-cols-4 gap-2.5">
                {COLOR_PRESETS.map((p) => {
                  const isSelected = selectedBg === p.bg && selectedColor === p.color;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={cn(
                        "h-14 rounded-[12px] flex flex-col items-center justify-center gap-1 transition-all border relative cursor-pointer",
                        isSelected
                          ? "ring-2 ring-white border-white"
                          : "border-white/5 hover:border-white/20"
                      )}
                      style={{ backgroundColor: p.bg }}
                    >
                      <span
                        className="text-[10px] font-semibold leading-none truncate max-w-[80px]"
                        style={{ color: p.color }}
                      >
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-400 font-medium">Colore Sfondo (Hex)</label>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md border border-white/10 shrink-0" style={{ backgroundColor: selectedBg }} />
                  <input
                    type="text"
                    value={selectedBg}
                    onChange={(e) => setSelectedBg(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[10px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-400 font-medium">Colore Icona (Hex)</label>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md border border-white/10 shrink-0" style={{ backgroundColor: selectedColor }} />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[10px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Image Upload */}
        {mode === "image" && (
          <div className="flex flex-col gap-3">
            {/* File Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Carica Immagine da Computer</label>
              <label className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-[14px] p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/40 transition-all">
                <Upload size={20} className="text-zinc-400" />
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
            <Check size={14} strokeWidth={2.5} />
            <span>Salva Icona</span>
          </button>
        </div>
      </div>
    </div>
  );
};
