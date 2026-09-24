"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CalmWaveBackgroundProps {
  className?: string;
  speed?: number;
  waveCount?: number;
}

export const CalmWaveBackground: React.FC<CalmWaveBackgroundProps> = ({
  className,
  speed = 0.0012,
  waveCount = 4,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetY: number }>({
    x: 0,
    y: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Wave parameters: Calm, slow, harmonic frequencies and subtle amplitudes
    const waveLayers = [
      {
        frequency: 0.0025,
        amplitude: 65,
        speedMultiplier: 0.8,
        phase: 0,
        gradientStart: "rgba(255, 255, 255, 0.10)",
        gradientEnd: "rgba(9, 9, 11, 0.0)",
        stroke: "rgba(255, 255, 255, 0.25)",
        strokeWidth: 1.5,
        yOffsetPercent: 0.52,
      },
      {
        frequency: 0.0035,
        amplitude: 50,
        speedMultiplier: 1.1,
        phase: 1.8,
        gradientStart: "rgba(212, 212, 216, 0.08)",
        gradientEnd: "rgba(9, 9, 11, 0.0)",
        stroke: "rgba(212, 212, 216, 0.20)",
        strokeWidth: 1.2,
        yOffsetPercent: 0.56,
      },
      {
        frequency: 0.002,
        amplitude: 75,
        speedMultiplier: 0.6,
        phase: 3.4,
        gradientStart: "rgba(161, 161, 170, 0.08)",
        gradientEnd: "rgba(9, 9, 11, 0.0)",
        stroke: "rgba(161, 161, 170, 0.20)",
        strokeWidth: 1.5,
        yOffsetPercent: 0.48,
      },
      {
        frequency: 0.004,
        amplitude: 35,
        speedMultiplier: 1.3,
        phase: 5.1,
        gradientStart: "rgba(113, 113, 122, 0.06)",
        gradientEnd: "rgba(9, 9, 11, 0.0)",
        stroke: "rgba(255, 255, 255, 0.20)",
        strokeWidth: 1.0,
        yOffsetPercent: 0.60,
      },
    ];

    // Floating calm ambient particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      speedY: Math.random() * 0.0003 + 0.0001,
      speedX: (Math.random() - 0.5) * 0.0002,
    }));

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
      const relativeY = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetY = relativeY * 40;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      if (!containerRef.current || !ctx || !canvas) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      time += speed;

      // Smooth mouse interpolation
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      // Clear with obsidian background
      ctx.fillStyle = "#06070a";
      ctx.fillRect(0, 0, width, height);

      // Ambient radial glow behind waves
      const radialGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.52 + mouseRef.current.y,
        10,
        width * 0.5,
        height * 0.52 + mouseRef.current.y,
        width * 0.6
      );
      radialGlow.addColorStop(0, "rgba(37, 99, 235, 0.12)");
      radialGlow.addColorStop(0.5, "rgba(30, 41, 59, 0.04)");
      radialGlow.addColorStop(1, "rgba(6, 7, 10, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render floating calm particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < 0) p.y = 1;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
        ctx.fill();
      });

      // Render each calm wave layer
      waveLayers.slice(0, waveCount).forEach((layer) => {
        const baseY = height * layer.yOffsetPercent + mouseRef.current.y;
        const currentPhase = time * layer.speedMultiplier + layer.phase;

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseY);

        const step = 6;
        for (let x = 0; x <= width + step; x += step) {
          // Double sine harmonic formulation for organic fluid motion
          const y1 = Math.sin(x * layer.frequency + currentPhase) * layer.amplitude;
          const y2 = Math.cos(x * (layer.frequency * 0.6) - currentPhase * 0.5) * (layer.amplitude * 0.4);
          const y = baseY + y1 + y2;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Wave gradient fill
        const gradient = ctx.createLinearGradient(0, baseY - layer.amplitude, 0, height);
        gradient.addColorStop(0, layer.gradientStart);
        gradient.addColorStop(0.7, layer.gradientEnd);
        gradient.addColorStop(1, "rgba(6, 7, 10, 0)");

        ctx.fillStyle = gradient;
        ctx.fill();

        // Wave top stroke
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const y1 = Math.sin(x * layer.frequency + currentPhase) * layer.amplitude;
          const y2 = Math.cos(x * (layer.frequency * 0.6) - currentPhase * 0.5) * (layer.amplitude * 0.4);
          const y = baseY + y1 + y2;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.strokeWidth;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [speed, waveCount]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden flex items-center justify-center bg-[#06070a] select-none",
        className
      )}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Subtle Grid / Scanline Ambient Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      {/* Ambient Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,7,10,0.8)_100%)]" />

      {/* Minimalist Watermark */}
      <div className="absolute top-6 left-8 z-20 pointer-events-none flex items-center gap-2.5 text-[11px] font-mono text-ink-subtle/70">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span className="tracking-wider uppercase font-semibold">Chrono Engineering</span>
      </div>

      <div className="absolute bottom-6 right-8 z-20 pointer-events-none text-[10px] font-mono text-ink-tertiary">
        <span>Harmonic Ambient Engine</span>
      </div>
    </div>
  );
};
