"use client";

import React from "react";
import {
  Zap,
  Rocket,
  Terminal,
  Layers,
  Sparkles,
  Shield,
  Database,
  Globe,
  Briefcase,
  Flame,
  Target,
  Box,
  Code2,
  Cpu,
  Feather,
  Compass,
  Folder,
  Activity,
  Heart,
  Award,
  Crown,
  Command,
} from "lucide-react";
import { ChronoLogo } from "@/components/ui/ChronoLogo";
import { cn } from "@/lib/utils";

export interface WorkspaceIconProps {
  icon?: string | null;
  iconBg?: string | null;
  iconColor?: string | null;
  logoUrl?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const WORKSPACE_ICON_LIST = [
  { id: "chrono", label: "Chrono Logo", component: ChronoLogo },
  { id: "zap", label: "Zap / Fulmine", component: Zap },
  { id: "rocket", label: "Rocket / Lancio", component: Rocket },
  { id: "terminal", label: "Terminal / Dev", component: Terminal },
  { id: "layers", label: "Layers / Stack", component: Layers },
  { id: "sparkles", label: "Sparkles / AI", component: Sparkles },
  { id: "shield", label: "Shield / Security", component: Shield },
  { id: "database", label: "Database / Cloud", component: Database },
  { id: "globe", label: "Globe / Web", component: Globe },
  { id: "briefcase", label: "Briefcase / Business", component: Briefcase },
  { id: "flame", label: "Flame / Focus", component: Flame },
  { id: "target", label: "Target / Obiettivi", component: Target },
  { id: "box", label: "Box / Prodotti", component: Box },
  { id: "code", label: "Code / Sviluppo", component: Code2 },
  { id: "cpu", label: "CPU / Hardware", component: Cpu },
  { id: "compass", label: "Compass / Roadmap", component: Compass },
  { id: "crown", label: "Crown / Premium", component: Crown },
  { id: "command", label: "Command / Sistema", component: Command },
];

export const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({
  icon,
  iconBg = "#121419",
  iconColor = "#5e6ad2",
  logoUrl,
  name,
  size = "md",
  className,
}) => {
  const sizeMap = {
    xs: { box: "w-4 h-4 rounded-[5px] text-[8px]", iconSize: 10, text: "text-[8px]" },
    sm: { box: "w-5 h-5 rounded-[6px] text-[9px]", iconSize: 12, text: "text-[9px]" },
    md: { box: "w-7 h-7 rounded-[9px] text-xs", iconSize: 14, text: "text-xs font-bold" },
    lg: { box: "w-10 h-10 rounded-[12px] text-sm", iconSize: 20, text: "text-sm font-bold" },
    xl: { box: "w-14 h-14 rounded-[16px] text-xl", iconSize: 28, text: "text-xl font-bold" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const normalizedIcon = (icon || "").toLowerCase().trim();

  // Match predefined icon component
  const iconEntry = WORKSPACE_ICON_LIST.find((i) => i.id === normalizedIcon);

  let iconContent: React.ReactNode = null;

  if (logoUrl) {
    iconContent = (
      <img
        src={logoUrl}
        alt={name || "Workspace Logo"}
        className="w-full h-full object-cover rounded-[inherit]"
      />
    );
  } else if (normalizedIcon === "chrono") {
    iconContent = <ChronoLogo size={currentSize.iconSize} glow={size === "xl" || size === "lg"} />;
  } else if (iconEntry) {
    const IconComp = iconEntry.component;
    iconContent = <IconComp className="shrink-0" style={{ width: currentSize.iconSize, height: currentSize.iconSize }} />;
  } else if (icon && icon.length <= 2) {
    // Single letter initial or emoji
    iconContent = <span className={currentSize.text}>{icon}</span>;
  } else {
    // Fallback to initial of name or 'C'
    const fallbackChar = name ? name.charAt(0).toUpperCase() : "C";
    iconContent = <span className={currentSize.text}>{fallbackChar}</span>;
  }

  return (
    <div
      className={cn(
        currentSize.box,
        "border border-white/10 flex items-center justify-center shrink-0 shadow-sm select-none transition-all",
        className
      )}
      style={{
        backgroundColor: iconBg || "#121419",
        color: iconColor || "#5e6ad2",
      }}
    >
      {iconContent}
    </div>
  );
};
