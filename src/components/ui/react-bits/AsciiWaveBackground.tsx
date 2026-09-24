"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AsciiWaveBackgroundProps {
  className?: string;
  speed?: number;
  glowColor?: string;
}

export const AsciiWaveBackground: React.FC<AsciiWaveBackgroundProps> = ({
  className,
  speed = 0.008,
  glowColor = "#a1a1aa",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // React Bits ASCII Character ramp (from subtle dots to rich symbols)
    const asciiChars = "  ··::--==++**##%%@@";

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5;
      mouseRef.current.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 1.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      if (!containerRef.current || !ctx || !canvas) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      time += speed;

      // Smooth mouse interpolation (calm lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      // Clear canvas with deep obsidian black
      ctx.fillStyle = "#06070a";
      ctx.fillRect(0, 0, width, height);

      // Subtle radial backdrop glow
      const radialGlow = ctx.createRadialGradient(
        width * 0.5 + mouseRef.current.x * 50,
        height * 0.5 + mouseRef.current.y * 50,
        20,
        width * 0.5,
        height * 0.5,
        width * 0.65
      );
      radialGlow.addColorStop(0, "rgba(59, 130, 246, 0.09)");
      radialGlow.addColorStop(0.5, "rgba(30, 41, 59, 0.03)");
      radialGlow.addColorStop(1, "rgba(6, 7, 10, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Density calculation
      const cols = Math.floor(Math.max(45, Math.min(85, width / 14)));
      const rows = Math.floor(Math.max(30, Math.min(60, height / 18)));
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      const fontSize = Math.floor(Math.min(cellWidth * 1.05, cellHeight * 0.95));

      ctx.font = `600 ${fontSize}px 'DM Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let r = 0; r < rows; r++) {
        const v = (r / (rows - 1) - 0.5) * 2;

        for (let c = 0; c < cols; c++) {
          const u = (c / (cols - 1) - 0.5) * 2;

          // Calm, fluid harmonic wave formulation
          const wave1 = Math.sin(u * 2.8 + time * 0.75 + my * 0.5);
          const wave2 = Math.cos(v * 2.4 - time * 0.6 + mx * 0.5);
          const wave3 = Math.sin((u * 1.8 + v * 2.0) + time * 0.45) * 0.55;
          const distFromCenter = Math.sqrt(u * u + v * v);
          const wave4 = Math.cos(distFromCenter * 3.2 - time * 0.55) * 0.4;

          // Combined height normalized around [-1, 1]
          let heightVal = (wave1 * wave2 + wave3 + wave4) / 1.95;

          // Subtle gentle mouse attractor ripple
          const mouseDist = Math.sqrt((u - mx) * (u - mx) + (v - my) * (v - my));
          if (mouseDist < 0.8) {
            heightVal += Math.cos(mouseDist * Math.PI) * 0.25 * (1 - mouseDist / 0.8);
          }

          // Normalize height to [0, 1]
          const norm = Math.max(0, Math.min(1, (heightVal + 1) / 2));
          const charIndex = Math.floor(norm * (asciiChars.length - 1));
          const char = asciiChars[charIndex] || " ";

          if (char !== " ") {
            const posX = c * cellWidth + cellWidth / 2;
            const posY = r * cellHeight + cellHeight / 2;

            // Chromatic styling based on height / elevation
            if (norm > 0.80) {
              ctx.fillStyle = "#ffffff";
              ctx.shadowColor = glowColor;
              ctx.shadowBlur = 6;
            } else if (norm > 0.62) {
              ctx.fillStyle = "#38bdf8";
              ctx.shadowColor = glowColor;
              ctx.shadowBlur = 3;
            } else if (norm > 0.44) {
              ctx.fillStyle = "rgba(59, 130, 246, 0.85)";
              ctx.shadowBlur = 0;
            } else if (norm > 0.26) {
              ctx.fillStyle = "rgba(99, 102, 241, 0.48)";
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = "rgba(71, 85, 105, 0.25)";
              ctx.shadowBlur = 0;
            }

            ctx.fillText(char, posX, posY);
          }
        }
      }

      // Reset shadow blur
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [speed, glowColor]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden flex items-center justify-center bg-[#06070a] select-none",
        className
      )}
    >
      {/* ASCII Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* CRT Scanline & Grain Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(6,7,10,0.85)_100%)]" />

      {/* Minimalist Watermark Header */}
      <div className="absolute top-6 left-8 z-20 pointer-events-none flex items-center gap-2.5 text-[11px] font-mono text-ink-subtle/70">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span className="tracking-wider uppercase font-semibold">Chrono // ASCII Waves</span>
      </div>

      <div className="absolute bottom-6 right-8 z-20 pointer-events-none text-[10px] font-mono text-ink-tertiary">
        <span>React Bits // Ambient Engine</span>
      </div>
    </div>
  );
};
