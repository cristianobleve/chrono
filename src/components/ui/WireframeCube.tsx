import React from "react";
import { cn } from "@/lib/utils";

interface WireframeCubeProps {
  className?: string;
  size?: number;
}

export const WireframeCube: React.FC<WireframeCubeProps> = ({
  className,
  size = 48,
}) => {
  return (
    <div
      className={cn("flex items-center justify-center text-ink-muted/80", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current transition-transform duration-300 hover:scale-105"
      >
        {/* Isometric 3D Wireframe Cube with precision geometric segmentations */}
        <g strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer cube boundary */}
          <path d="M32 6L54 18.5V43.5L32 56L10 43.5V18.5L32 6Z" className="stroke-ink-subtle" />
          
          {/* Inner axes connecting center */}
          <path d="M32 31V56" className="stroke-ink-subtle" />
          <path d="M32 31L54 18.5" className="stroke-ink-subtle" />
          <path d="M32 31L10 18.5" className="stroke-ink-subtle" />

          {/* Internal grid subdivs - top facet */}
          <path d="M21 12.25L43 24.75" className="stroke-hairline-strong opacity-75" />
          <path d="M43 12.25L21 24.75" className="stroke-hairline-strong opacity-75" />

          {/* Internal grid subdivs - left facet */}
          <path d="M21 25V50" className="stroke-hairline-strong opacity-75" />
          <path d="M10 31L32 43.5" className="stroke-hairline-strong opacity-75" />

          {/* Internal grid subdivs - right facet */}
          <path d="M43 25V50" className="stroke-hairline-strong opacity-75" />
          <path d="M54 31L32 43.5" className="stroke-hairline-strong opacity-75" />
        </g>
      </svg>
    </div>
  );
};
