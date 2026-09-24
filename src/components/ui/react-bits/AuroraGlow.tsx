"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuroraGlowProps {
  className?: string;
  glowColor?: "primary" | "emerald" | "amber" | "cyan" | "mixed";
}

export const AuroraGlow: React.FC<AuroraGlowProps> = ({
  className,
  glowColor = "primary",
}) => {
  const colorMap = {
    primary: "from-white/10 via-zinc-500/5 to-transparent",
    emerald: "from-emerald-500/20 via-teal-500/10 to-transparent",
    amber: "from-amber-500/20 via-orange-500/10 to-transparent",
    cyan: "from-zinc-400/15 via-zinc-600/10 to-transparent",
    mixed: "from-zinc-700/20 via-zinc-800/10 to-transparent",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute -inset-[100px] opacity-30 blur-[80px] -z-10 overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "w-full h-full bg-gradient-to-r rounded-full animate-aurora",
          colorMap[glowColor]
        )}
      />
    </div>
  );
};
