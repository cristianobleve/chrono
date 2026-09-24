"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChronoLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const ChronoLogo: React.FC<ChronoLogoProps> = ({
  className,
  size = 22,
  glow = false,
}) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 select-none",
        glow && "after:absolute after:inset-0 after:rounded-full after:bg-white/20 after:blur-md",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img src="/icon.png" alt="" className="h-full w-full object-contain" />
    </div>
  );
};

export const ChronoWordmark: React.FC<{ className?: string; logoSize?: number }> = ({
  className,
  logoSize = 20,
}) => {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <img src="/name.svg" alt="Chrono" style={{ height: logoSize, width: logoSize * 5.89 }} className="object-contain" />
    </div>
  );
};
