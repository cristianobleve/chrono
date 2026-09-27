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

  const isIconImage = Boolean(
    currentIcon &&
      (currentIcon.startsWith("http://") ||
        currentIcon.startsWith("https://") ||
        currentIcon.startsWith("/") ||
        currentIcon.startsWith("data:image/") ||
        /\.(png|jpe?g|svg|webp|gif|avif)(\?.*)?$/i.test(currentIcon))
  );

  const isBgImage = Boolean(
    currentBg &&
      (currentBg.startsWith("http://") ||
        currentBg.startsWith("https://") ||
        currentBg.startsWith("/") ||
        currentBg.startsWith("data:image/") ||
        /\.(png|jpe?g|svg|webp|gif|avif)(\?.*)?$/i.test(currentBg))
  );

  // If either icon or iconBg is an image URL, treat as custom image
  const imageSrc = isIconImage ? currentIcon : isBgImage ? currentBg : null;

  const normalizedIconKey = currentIcon ? currentIcon.toLowerCase().trim() : "";
  const LucideComponent = !imageSrc && normalizedIconKey ? ICON_MAP[normalizedIconKey] : null;

  const letter =
    currentIcon && currentIcon.length <= 3
      ? currentIcon
      : displayName.charAt(0).toUpperCase();

  const pxSizes = {
    xs: 18,
    sm: 28,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const sizeClasses = {
    xs: "rounded-[5px] text-[9px] font-bold aspect-square",
    sm: "rounded-[9px] text-xs font-bold aspect-square",
    md: "rounded-[14px] text-base font-bold aspect-square",
    lg: "rounded-[16px] text-xl font-bold aspect-square",
    xl: "rounded-[22px] text-3xl font-bold aspect-square",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const dim = pxSizes[size] || 40;

  return (
    <div
      onClick={onClick}
      className={cn(
        "superquadrato-badge flex items-center justify-center shrink-0 border select-none transition-all shadow-md overflow-hidden relative aspect-square",
        sizeClasses[size],
        onClick && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      style={{
        width: dim,
        height: dim,
        minWidth: dim,
        minHeight: dim,
        maxWidth: dim,
        maxHeight: dim,
        backgroundColor: isBgImage ? undefined : currentBg,
        backgroundImage: isBgImage && isIconImage ? `url(${currentBg})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: currentColor,
        borderColor: "rgba(255, 255, 255, 0.12)",
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc!}
          alt={displayName}
          className="w-full h-full object-cover block aspect-square pointer-events-none"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
