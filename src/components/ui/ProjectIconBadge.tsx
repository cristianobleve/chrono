"use client";

import React from "react";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import * as ReiconIcons from "reicon-react";
import type { IconComponent } from "reicon-react";

// Pre-built case-insensitive lookup table for all 2670+ Reicon icons
const REICON_LOWERCASE_MAP = new Map<string, IconComponent>();
for (const [key, comp] of Object.entries(ReiconIcons)) {
  if (typeof comp === "function" || (typeof comp === "object" && comp !== null)) {
    REICON_LOWERCASE_MAP.set(key.toLowerCase(), comp as unknown as IconComponent);
  }
}

// Aliases mapping common keywords to exact Reicon components
const ICON_ALIASES: Record<string, string> = {
  db: "database",
  database: "database",
  zap: "bolt",
  bolt: "bolt",
  lightning: "bolt",
  cube: "box",
  box: "box",
  layer: "layers",
  layers: "layers",
  security: "shield",
  shield: "shield",
  terminal: "browserterminal",
  cli: "browserterminal",
  console: "terminalsquare",
  web: "globe",
  globe: "globe",
  ai: "sparkles",
  sparkles: "sparkles",
  chip: "cpu",
  cpu: "cpu",
  fire: "flame",
  flame: "flame",
  activity: "activity",
  pulse: "activity",
  compass: "compass",
  code: "code",
  layout: "layout",
  server: "server",
  cloud: "cloud",
  git: "branchdown",
  "git-branch": "branchdown",
  branch: "branchdown",
  workflow: "hierarchy",
  hierarchy: "hierarchy",
  lock: "lock",
  rocket: "rocket",
  launch: "rocket",
  key: "key",
  search: "search",
  star: "star",
  folder: "folder",
  check: "checkcircle",
  file: "file",
  storage: "harddrive",
  drive: "harddrive",
  bookmark: "bookmark",
  tag: "hashtag",
  hashtag: "hashtag",
  chart: "chartbar",
  route: "route",
  diagram: "diagram",
};

function getReiconComponent(name: string): IconComponent | null {
  const norm = name.toLowerCase().trim().replace(/[-_\s]+/g, "");
  // 1. Check aliases
  const aliasTarget = ICON_ALIASES[norm] || ICON_ALIASES[name.toLowerCase().trim()];
  if (aliasTarget && REICON_LOWERCASE_MAP.has(aliasTarget)) {
    return REICON_LOWERCASE_MAP.get(aliasTarget)!;
  }
  // 2. Direct case-insensitive match from Reicon catalog
  if (REICON_LOWERCASE_MAP.has(norm)) {
    return REICON_LOWERCASE_MAP.get(norm)!;
  }
  return null;
}

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

  const ReiconComponent = !imageSrc && currentIcon ? getReiconComponent(currentIcon) : null;

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
      ) : ReiconComponent ? (
        <ReiconComponent
          size={Math.round(dim * 0.5)}
          className={cn(iconSizes[size], "shrink-0")}
          color="currentColor"
        />
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
