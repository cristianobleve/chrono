"use client";

import React from "react";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import {
  Database,
  Zap,
  Box,
  Layers,
  Shield,
  Terminal,
  Globe,
  Sparkles,
  Cpu,
  Flame,
  Activity,
  Compass,
  Code,
  Layout,
  Server,
  Cloud,
  GitBranch,
  Workflow,
  Lock,
  Rocket,
  Key,
  Search,
  Star,
  Folder,
  CheckCircle,
  FileCode,
  HardDrive,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  database: Database,
  db: Database,
  zap: Zap,
  bolt: Zap,
  box: Box,
  cube: Box,
  layers: Layers,
  layer: Layers,
  shield: Shield,
  security: Shield,
  terminal: Terminal,
  cli: Terminal,
  globe: Globe,
  web: Globe,
  sparkles: Sparkles,
  ai: Sparkles,
  cpu: Cpu,
  chip: Cpu,
  flame: Flame,
  fire: Flame,
  activity: Activity,
  pulse: Activity,
  compass: Compass,
  code: Code,
  layout: Layout,
  server: Server,
  cloud: Cloud,
  "git-branch": GitBranch,
  git: GitBranch,
  workflow: Workflow,
  lock: Lock,
  rocket: Rocket,
  launch: Rocket,
  key: Key,
  search: Search,
  star: Star,
  folder: Folder,
  check: CheckCircle,
  file: FileCode,
  storage: HardDrive,
};

interface ProjectIconBadgeProps {
  project?: Project | null;
  icon?: string | null;
  iconBg?: string | null;
  iconColor?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export const ProjectIconBadge: React.FC<ProjectIconBadgeProps> = ({
  project,
  icon,
  iconBg,
  iconColor,
  name,
  size = "md",
  className,
  onClick,
}) => {
  const currentIcon = icon !== undefined ? icon : project?.icon;
  const currentBg = (iconBg !== undefined ? iconBg : project?.iconBg) || "#2a0808";
  const currentColor = (iconColor !== undefined ? iconColor : project?.iconColor) || "#e53e3e";
  const displayName = (name || project?.name || "Project").trim();

  const isImage =
    currentIcon &&
    (currentIcon.startsWith("http://") ||
      currentIcon.startsWith("https://") ||
      currentIcon.startsWith("/") ||
      currentIcon.startsWith("data:image/"));

  const normalizedIconKey = currentIcon ? currentIcon.toLowerCase().trim() : "";
  const LucideComponent = !isImage && normalizedIconKey ? ICON_MAP[normalizedIconKey] : null;

  const letter =
    currentIcon && currentIcon.length <= 3
      ? currentIcon
      : displayName.charAt(0).toUpperCase();

  const sizeClasses = {
    xs: "w-4.5 h-4.5 rounded-[5px] text-[9px] font-bold",
    sm: "w-7 h-7 rounded-[10px] text-xs font-bold",
    md: "w-10 h-10 rounded-[14px] text-base font-bold",
    lg: "w-12 h-12 rounded-[16px] text-xl font-bold",
    xl: "w-16 h-16 rounded-[22px] text-3xl font-bold",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "superquadrato-badge flex items-center justify-center shrink-0 border select-none transition-all shadow-md overflow-hidden relative",
        sizeClasses[size],
        onClick && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      style={{
        backgroundColor: currentBg,
        color: currentColor,
        borderColor: "rgba(255, 255, 255, 0.12)",
      }}
    >
      {isImage ? (
        <img
          src={currentIcon!}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : LucideComponent ? (
        <LucideComponent className={cn(iconSizes[size], "shrink-0")} strokeWidth={2} />
      ) : (
        <span
          className="leading-none tracking-tight flex items-center justify-center font-bold"
          style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
        >
          {letter}
        </span>
      )}
    </div>
  );
};
