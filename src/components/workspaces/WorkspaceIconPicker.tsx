"use client";

import React, { useState } from "react";
import {
  WorkspaceIcon,
  WORKSPACE_ICON_LIST,
} from "@/components/workspaces/WorkspaceIcon";
import { cn } from "@/lib/utils";
import { Sparkles, Palette, Smile } from "lucide-react";

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

export const WORKSPACE_EMOJIS = ["🚀", "⚡", "💎", "🛡️", "🌐", "📦", "🔥", "🧠", "🎯", "⚙️", "🌟", "💡"];

interface WorkspaceIconPickerProps {
  selectedIcon: string;
  selectedBg: string;
  selectedColor: string;
  name?: string;
  onChange: (updates: { icon: string; iconBg: string; iconColor: string }) => void;
}

export const WorkspaceIconPicker: React.FC<WorkspaceIconPickerProps> = ({
  selectedIcon,
  selectedBg,
  selectedColor,
  name,
  onChange,
}) => {
  const [tab, setTab] = useState<"icons" | "emojis" | "initial">("icons");

  return (
    <div className="flex flex-col gap-4 p-4 rounded-[14px] bg-zinc-950 border border-white/10">
      {/* Live Preview Header */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-white/5">
        <WorkspaceIcon
          icon={selectedIcon}
          iconBg={selectedBg}
          iconColor={selectedColor}
          name={name}
          size="lg"
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white">Anteprima Icona Workspace</span>
          <span className="text-[10px] text-zinc-400">
            Icona: <span className="text-white font-mono">{selectedIcon}</span> · Colore: <span className="text-white font-mono">{selectedColor}</span>
          </span>
        </div>
      </div>

      {/* Tabs (Icons, Emojis, Initials) */}
      <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-zinc-900/60 border border-white/5">
        <button
          type="button"
          onClick={() => setTab("icons")}
          className={cn(
            "flex-1 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer",
            tab === "icons"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Icone Vettoriali ({WORKSPACE_ICON_LIST.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("emojis")}
          className={cn(
            "flex-1 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer",
            tab === "emojis"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Emoji
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("initial");
            onChange({
              icon: name ? name.charAt(0).toUpperCase() : "C",
              iconBg: selectedBg,
              iconColor: selectedColor,
            });
          }}
          className={cn(
            "flex-1 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer",
            tab === "initial"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Iniziale Lettera
        </button>
      </div>

      {/* Icon Choices Grid */}
      {tab === "icons" && (
        <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
          {WORKSPACE_ICON_LIST.map((item) => {
            const isSelected = selectedIcon.toLowerCase() === item.id;
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
                  })
                }
                className={cn(
                  "p-2 rounded-[10px] border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group",
                  isSelected
                    ? "bg-white/10 border-white/30 text-white ring-1 ring-white/20 shadow-sm"
                    : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                )}
                title={item.label}
              >
                <IconComponent className="w-4 h-4 shrink-0 transition-transform" />
                <span className="text-[9px] truncate w-full text-center opacity-70">
                  {item.id}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid */}
      {tab === "emojis" && (
        <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
          {WORKSPACE_EMOJIS.map((emoji) => {
            const isSelected = selectedIcon === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  onChange({
                    icon: emoji,
                    iconBg: selectedBg,
                    iconColor: selectedColor,
                  })
                }
                className={cn(
                  "p-2.5 rounded-[10px] border text-lg flex items-center justify-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-white/10 border-white/30 ring-1 ring-white/20 shadow-sm"
                    : "bg-zinc-900 border-white/5 hover:border-white/20"
                )}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Text Letter */}
      {tab === "initial" && (
        <div className="flex items-center gap-3">
          <input
            type="text"
            maxLength={2}
            value={selectedIcon.length <= 2 ? selectedIcon : ""}
            onChange={(e) =>
              onChange({
                icon: e.target.value.toUpperCase() || "W",
                iconBg: selectedBg,
                iconColor: selectedColor,
              })
            }
            placeholder="W"
            className="w-16 px-3 py-2 rounded-[10px] bg-zinc-900 border border-white/10 focus:border-white/30 text-white text-center font-bold text-sm focus:outline-none"
          />
          <span className="text-xs text-zinc-400">
            Inserisci 1 o 2 lettere o caratteri per il monogramma del workspace.
          </span>
        </div>
      )}

      {/* Palette Color Selection */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Colore di Sfondo & Tonalità
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
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
                  })
                }
                className={cn(
                  "h-8 rounded-[8px] border flex items-center justify-center transition-all cursor-pointer group",
                  isSelected
                    ? "border-white ring-2 ring-white/30 shadow"
                    : "border-transparent opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: c.bg }}
                title={c.name}
              >
                <span
                  className="w-3 h-3 rounded-full shadow"
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
