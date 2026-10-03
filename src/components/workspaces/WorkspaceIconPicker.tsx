"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  WorkspaceIcon,
  WORKSPACE_ICON_LIST,
} from "@/components/workspaces/WorkspaceIcon";
import { searchReicons } from "@/lib/icons/reiconRegistry";
import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export const WORKSPACE_COLOR_PALETTES = [
  { name: "Chrono Indigo", bg: "#121419", color: "#5e6ad2" },
  { name: "Emerald Cyber", bg: "#062316", color: "#34d399" },
  { name: "Crimson Forge", bg: "#2a0808", color: "#e53e3e" },
  { name: "Solar Amber", bg: "#231206", color: "#f59e0b" },
  { name: "Amethyst Pulse", bg: "#1e0b29", color: "#c084fc" },
  { name: "Deep Cyan", bg: "#081d27", color: "#38bdf8" },
  { name: "Neon Rose", bg: "#260a1a", color: "#f43f5e" },
  { name: "Teal Matrix", bg: "#042422", color: "#14b8a6" },
];



export interface WorkspaceIconPickerProps {
  selectedIcon: string;
  selectedBg: string;
  selectedColor: string;
  logoUrl?: string | null;
  name?: string;
  onChange: (updates: {
    icon: string;
    iconBg: string;
    iconColor: string;
    logoUrl?: string | null;
  }) => void;
}

export const WorkspaceIconPicker: React.FC<WorkspaceIconPickerProps> = ({
  selectedIcon,
  selectedBg,
  selectedColor,
  logoUrl,
  name,
  onChange,
}) => {
  const [tab, setTab] = useState<"icons" | "reicon" | "upload" | "initial">(
    logoUrl ? "upload" : "icons"
  );
  const [reiconQuery, setReiconQuery] = useState("");
  const reiconList = useMemo(() => searchReicons(reiconQuery), [reiconQuery]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Selected image exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onChange({
        icon: selectedIcon,
        iconBg: selectedBg,
        iconColor: selectedColor,
        logoUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onChange({
      icon: selectedIcon,
      iconBg: selectedBg,
      iconColor: selectedColor,
      logoUrl: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-[14px] bg-[#0c0d10] border border-white/10 text-white w-[340px] max-w-full shadow-2xl select-none">
      {/* Live Preview Header */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-white/5">
        <WorkspaceIcon
          icon={selectedIcon}
          iconBg={selectedBg}
          iconColor={selectedColor}
          logoUrl={logoUrl}
          name={name}
          size="lg"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white truncate">
            {logoUrl ? "Custom Image" : "Workspace Icon"}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono truncate">
            {logoUrl ? "Uploaded logo" : `${selectedIcon} · ${selectedColor}`}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-white/5 text-[11px]">
        <button
          type="button"
          onClick={() => setTab("icons")}
          className={cn(
            "flex-1 py-1 rounded-[6px] font-medium transition-all cursor-pointer",
            tab === "icons"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Icons
        </button>
        <button
          type="button"
          onClick={() => setTab("reicon")}
          className={cn(
            "flex-1 py-1 rounded-[6px] font-medium transition-all cursor-pointer",
            tab === "reicon"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Libreria (331)
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex-1 py-1 rounded-[6px] font-medium transition-all cursor-pointer",
            tab === "upload"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("initial");
            onChange({
              icon: name ? name.charAt(0).toUpperCase() : "W",
              iconBg: selectedBg,
              iconColor: selectedColor,
              logoUrl: null,
            });
          }}
          className={cn(
            "flex-1 py-1 rounded-[6px] font-medium transition-all cursor-pointer",
            tab === "initial"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Letter
        </button>
      </div>

      {/* Tab: Vector Icons */}
      {tab === "icons" && (
        <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
          {WORKSPACE_ICON_LIST.map((item) => {
            const isSelected = !logoUrl && selectedIcon.toLowerCase() === item.id;
            const IconComponent = item.component;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onChange({
                    icon: item.id,
                    iconBg: selectedBg,
                    iconColor: selectedColor,
                    logoUrl: null,
                  })
                }
                className={cn(
                  "p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                  isSelected
                    ? "bg-white/10 border-white/30 text-white ring-1 ring-white/20 shadow-sm"
                    : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                )}
                title={item.label}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="text-[8px] truncate w-full text-center opacity-70">
                  {item.id}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab: Custom Image Upload */}
      {tab === "upload" && (
        <div className="flex flex-col gap-3 py-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {logoUrl ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={logoUrl}
                  alt="Workspace logo"
                  className="w-8 h-8 rounded-md object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs text-white font-medium block truncate">
                    Custom image loaded
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Base64 / Web image
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 rounded-lg border border-dashed border-white/15 hover:border-white/30 bg-zinc-900/40 hover:bg-zinc-900 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-zinc-300 font-medium">
                  Click to upload image
                </span>
                <span className="text-[10px] text-zinc-500">
                  PNG, JPG, SVG, WebP up to 5MB
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Tab: Reicon Library (331 Icons) */}
      {tab === "reicon" && (
        <div className="flex flex-col gap-2 py-1">
          <input
            type="text"
            value={reiconQuery}
            onChange={(e) => setReiconQuery(e.target.value)}
            placeholder="Cerca tra 331 icone (es. server, database, code)..."
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-[11px] placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
          />
          <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {reiconList.map((item) => {
              const isSelected = !logoUrl && selectedIcon.toLowerCase() === item.id;
              const IconComponent = item.component;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      icon: item.id,
                      iconBg: selectedBg,
                      iconColor: selectedColor,
                      logoUrl: null,
                    })
                  }
                  className={cn(
                    "p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                    isSelected
                      ? "bg-white/10 border-white/30 text-white ring-1 ring-white/20 shadow-sm"
                      : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                  )}
                  title={item.name}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="text-[7.5px] truncate w-full text-center opacity-70">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Initial Letter */}
      {tab === "initial" && (
        <div className="flex items-center gap-3 py-2">
          <input
            type="text"
            maxLength={2}
            value={!logoUrl && selectedIcon.length <= 2 ? selectedIcon : ""}
            onChange={(e) =>
              onChange({
                icon: e.target.value.toUpperCase() || "W",
                iconBg: selectedBg,
                iconColor: selectedColor,
                logoUrl: null,
              })
            }
            placeholder="W"
            className="w-14 h-10 rounded-lg bg-zinc-900 border border-white/10 focus:border-white/30 text-white text-center font-bold text-sm focus:outline-none"
          />
          <span className="text-xs text-zinc-400 leading-tight">
            1 or 2 characters for the workspace monogram.
          </span>
        </div>
      )}

      {/* Palette Color Selection */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Background & Accent
        </span>
        <div className="grid grid-cols-8 gap-1.5">
          {WORKSPACE_COLOR_PALETTES.map((c) => {
            const isSelected = selectedColor === c.color;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() =>
                  onChange({
                    icon: selectedIcon,
                    iconBg: c.bg,
                    iconColor: c.color,
                    logoUrl,
                  })
                }
                className={cn(
                  "h-7 rounded-md border flex items-center justify-center transition-all cursor-pointer",
                  isSelected
                    ? "border-white ring-2 ring-white/30 shadow"
                    : "border-transparent opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: c.bg }}
                title={c.name}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shadow"
                  style={{ backgroundColor: c.color }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
