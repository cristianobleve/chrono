"use client";

import React from "react";
import { Project } from "@/types";
import { cn } from "@/lib/utils";

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
  const currentBg = (iconBg !== undefined ? iconBg : project?.iconBg) || "#2a0808"; // Default crimson/obsidian like screenshot L
  const currentColor = (iconColor !== undefined ? iconColor : project?.iconColor) || "#e53e3e"; // Vivid Red
  const displayName = (name || project?.name || "Project").trim();
  const letter = (currentIcon && currentIcon.length <= 3) ? currentIcon : displayName.charAt(0).toUpperCase();

  const isImage = currentIcon && (
    currentIcon.startsWith("http://") ||
    currentIcon.startsWith("https://") ||
    currentIcon.startsWith("/") ||
    currentIcon.startsWith("data:image/")
  );

  const sizeClasses = {
    xs: "w-4.5 h-4.5 rounded-[5px] text-[9px] font-bold",
    sm: "w-7 h-7 rounded-[10px] text-xs font-bold",
    md: "w-10 h-10 rounded-[14px] text-base font-bold",
    lg: "w-12 h-12 rounded-[16px] text-xl font-bold",
    xl: "w-16 h-16 rounded-[22px] text-3xl font-bold",
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
          src={currentIcon}
          alt={displayName}
          className="w-full h-full object-cover"
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
