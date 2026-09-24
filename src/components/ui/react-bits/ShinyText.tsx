"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number; // duration in seconds
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  className,
  speed = 3,
}) => {
  return (
    <span
      className={cn(
        "inline-block bg-[linear-gradient(110deg,#9399b2,45%,#ffffff,55%,#9399b2)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer select-none",
        className
      )}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
};
