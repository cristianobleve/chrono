"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ChronoDialBackgroundProps {
  className?: string;
}

interface OrbitalNode {
  radius: number;
  angle: number;
  speed: number;
  size: number;
  label: string;
  type: "milestone" | "issue" | "sync" | "agent";
  pulse: number;
}

export function ChronoDialBackground({ className }: ChronoDialBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number = 0;
    let isVisible = false;
    let lastTime = 0;
    const targetFps = 35;
    const interval = 1000 / targetFps;

    // Mouse coordinates with damped interpolation
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Check system preference for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Chrono orbital tracks definition
    const rings = [
      { r: 110, dash: [2, 6], width: 1, alpha: 0.15 },
      { r: 180, dash: [4, 8], width: 1, alpha: 0.2 },
      { r: 280, dash: [], width: 1.2, alpha: 0.25 },
      { r: 390, dash: [8, 12], width: 1, alpha: 0.18 },
      { r: 520, dash: [1, 5], width: 1, alpha: 0.12 },
      { r: 680, dash: [], width: 1, alpha: 0.08 },
    ];

    // Orbital nodes along the timeline rings
    const nodes: OrbitalNode[] = [
      { radius: 180, angle: 0.8, speed: 0.0018, size: 3.5, label: "M1", type: "milestone", pulse: 0 },
      { radius: 180, angle: 3.4, speed: 0.0018, size: 3, label: "FIR-248", type: "issue", pulse: 0 },
      { radius: 280, angle: 1.6, speed: -0.0012, size: 4, label: "SYNC", type: "sync", pulse: 0 },
      { radius: 280, angle: 4.8, speed: -0.0012, size: 3.5, label: "M2", type: "milestone", pulse: 0 },
      { radius: 390, angle: 2.2, speed: 0.0009, size: 3.5, label: "AGENT", type: "agent", pulse: 0 },
      { radius: 390, angle: 5.5, speed: 0.0009, size: 3, label: "FIR-251", type: "issue", pulse: 0 },
      { radius: 520, angle: 0.4, speed: -0.0006, size: 3, label: "EPOCH", type: "sync", pulse: 0 },
    ];

    let sweepAngle = 0;

    // Handle high-DPI scaling
    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouse.targetX = x * 24;
      mouse.targetY = y * 24;
    };

    container.addEventListener("mousemove", onMouseMove, { passive: true });

    // Render loop
    const render = (currentTime: number) => {
      if (!isVisible) return;
      animId = requestAnimationFrame(render);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      // Interpolate mouse parallax
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const w = container.clientWidth;
      const h = container.clientHeight;
      const cx = w / 2 + mouse.x;
      const cy = h / 2 + mouse.y;

      ctx.clearRect(0, 0, w, h);

      if (!prefersReducedMotion) {
        sweepAngle = (sweepAngle + 0.004) % (Math.PI * 2);
      }

      // Draw faint background radial coordinates
      ctx.save();

      // Axis crosshair lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.beginPath();
      ctx.moveTo(cx - 750, cy);
      ctx.lineTo(cx + 750, cy);
      ctx.moveTo(cx, cy - 750);
      ctx.lineTo(cx, cy + 750);
      ctx.stroke();

      // Diagonal crosshair
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.beginPath();
      ctx.moveTo(cx - 500, cy - 500);
      ctx.lineTo(cx + 500, cy + 500);
      ctx.moveTo(cx - 500, cy + 500);
      ctx.lineTo(cx + 500, cy - 500);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw concentric chronometer rings
      for (const ring of rings) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${ring.alpha})`;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dash);
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw chronometer dial tick marks along the 280px and 390px rings
      const tickRingR = 280;
      ctx.setLineDash([]);
      for (let i = 0; i < 60; i++) {
        const rad = (i * Math.PI) / 30;
        const isMajor = i % 5 === 0;
        const isQuarter = i % 15 === 0;
        const length = isQuarter ? 8 : isMajor ? 5 : 2.5;
        const alpha = isQuarter ? 0.35 : isMajor ? 0.2 : 0.08;

        const x1 = cx + Math.cos(rad) * (tickRingR - length);
        const y1 = cy + Math.sin(rad) * (tickRingR - length);
        const x2 = cx + Math.cos(rad) * tickRingR;
        const y2 = cy + Math.sin(rad) * tickRingR;

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = isMajor ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Sweeping radar / timeline needle
      if (!prefersReducedMotion) {
        const sweepGradient = ctx.createRadialGradient(cx, cy, 20, cx, cy, 420);
        sweepGradient.addColorStop(0, "rgba(255, 255, 255, 0.12)");
        sweepGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
        sweepGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = sweepGradient;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 420, sweepAngle - 0.22, sweepAngle);
        ctx.closePath();
        ctx.fill();

        // Thin needle line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * 400, cy + Math.sin(sweepAngle) * 400);
        ctx.stroke();
      }

      // Draw and update orbital nodes
      for (const node of nodes) {
        if (!prefersReducedMotion) {
          node.angle += node.speed;
        }

        const nx = cx + Math.cos(node.angle) * node.radius;
        const ny = cy + Math.sin(node.angle) * node.radius;

        // Compute angle diff with sweep to calculate illumination pulse
        const angleDiff = Math.abs(((node.angle - sweepAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        const isNearSweep = angleDiff < 0.25;
        if (isNearSweep) {
          node.pulse = 1.0;
        } else {
          node.pulse = Math.max(0, node.pulse - 0.02);
        }

        // Connecting hairline from center
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + node.pulse * 0.07})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 8]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        ctx.setLineDash([]);

        // Outer glow on pulse
        if (node.pulse > 0) {
          ctx.fillStyle = node.type === "sync"
            ? `rgba(16, 185, 129, ${node.pulse * 0.25})`
            : `rgba(255, 255, 255, ${node.pulse * 0.3})`;
          ctx.beginPath();
          ctx.arc(nx, ny, node.size + 4 * node.pulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node dot
        ctx.fillStyle = node.type === "sync"
          ? "#34d399"
          : node.type === "agent"
          ? "#e4e4e7"
          : "#ffffff";
        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Technical node tag label
        ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillText(node.label, nx + 7, ny + 3);
      }

      // Central Chrono core hub
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Peripheral technical coordinate telemetry
      ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillText("CHRONO // CHRONOGRAM ENGINE", 24, 32);
      ctx.fillText("SYNC_STATE: REALTIME_OK", 24, 46);
      ctx.fillText("CLOCK_DRIFT: <0.02ms", 24, 60);

      ctx.textAlign = "right";
      ctx.fillText("MCP_SOCKET: 127.0.0.1:9092", w - 24, 32);
      ctx.fillText("RLS_POLICY: STRICT", w - 24, 46);
      ctx.fillText("POSTGRES_WAL: LSN_0x1A", w - 24, 60);
      ctx.textAlign = "left";

      ctx.restore();
    };

    // IntersectionObserver to conserve 100% CPU when not in view
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none select-none", className)}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
