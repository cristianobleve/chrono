"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  size?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor,
  size,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative squircle rounded-[22px] bg-zinc-900/60 border border-white/5 overflow-hidden transition-all duration-200 hover:border-white/15",
        className
      )}
      {...props}
    >
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};
