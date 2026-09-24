"use client";

import React, { useEffect, useRef } from "react";

interface AsciiArtAnimationProps {
  className?: string;
  charColor?: string;
  glowColor?: string;
}

export const AsciiArtAnimation: React.FC<AsciiArtAnimationProps> = ({
  className = "",
  charColor = "#ffffff",
  glowColor = "#5e6ad2",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // ASCII characters gradient from dense to sparse
    const asciiChars = " .,:;i1tfLCG08@█▓▒░✦◆◇▲▼#*+=-";

    let A = 0;
    let B = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      // Clear with deep transparent black
      ctx.fillStyle = "rgba(8, 9, 12, 0.35)";
      ctx.fillRect(0, 0, width, height);

      A += 0.015 + mouseY * 0.01;
      B += 0.012 + mouseX * 0.01;

      const cosA = Math.cos(A), sinA = Math.sin(A);
      const cosB = Math.cos(B), sinB = Math.sin(B);

      const R1 = 1.2; // Torus inner radius
      const R2 = 2.4; // Torus outer radius
      const K2 = 5;
      const K1 = (Math.min(width, height) * K2 * 3) / (8 * (R1 + R2));

      const rows = 45;
      const cols = 75;
      const zBuffer = new Float32Array(rows * cols);
      const output = new Array(rows * cols).fill(" ");
      const brightnessBuffer = new Float32Array(rows * cols);

      for (let theta = 0; theta < 6.28; theta += 0.07) {
        const costheta = Math.cos(theta), sintheta = Math.sin(theta);

        for (let phi = 0; phi < 6.28; phi += 0.03) {
          const cosphi = Math.cos(phi), sinphi = Math.sin(phi);

          const circlex = R2 + R1 * costheta;
          const circley = R1 * sintheta;

          const x = circlex * (cosB * cosphi + sinA * sinB * sinphi) - circley * cosA * sinB;
          const y = circlex * (sinB * cosphi - sinA * cosB * sinphi) + circley * cosA * cosB;
          const z = K2 + cosA * circlex * sinphi + circley * sinA;
          const ooz = 1 / z;

          const xp = Math.floor(cols / 2 + K1 * ooz * x * 0.6);
          const yp = Math.floor(rows / 2 - K1 * ooz * y * 0.35);

          // Luminance calculation (-sqrt(2) to sqrt(2))
          const L =
            cosphi * costheta * sinB -
            cosA * costheta * sinphi -
            sinA * sintheta +
            cosB * (cosA * sintheta - costheta * sinA * sinphi);

          if (L > 0) {
            if (xp >= 0 && xp < cols && yp >= 0 && yp < rows) {
              const idx = xp + yp * cols;
              if (ooz > zBuffer[idx]) {
                zBuffer[idx] = ooz;
                const luminanceIndex = Math.floor(L * 8);
                output[idx] = asciiChars[Math.min(luminanceIndex, asciiChars.length - 1)] || ".";
                brightnessBuffer[idx] = L;
              }
            }
          }
        }
      }

      // Draw ASCII grid to canvas
      const charWidth = width / cols;
      const charHeight = height / rows;
      ctx.font = `bold ${Math.max(10, Math.floor(charHeight * 0.95))}px 'DM Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          const char = output[idx];
          if (char !== " ") {
            const b = brightnessBuffer[idx];
            // Dynamic alpha & glow based on brightness
            const alpha = Math.min(1, Math.max(0.15, b * 0.8));

            if (b > 0.9) {
              ctx.fillStyle = "#ffffff";
              ctx.shadowColor = glowColor;
              ctx.shadowBlur = 8;
            } else if (b > 0.5) {
              ctx.fillStyle = `rgba(180, 190, 255, ${alpha})`;
              ctx.shadowBlur = 3;
              ctx.shadowColor = glowColor;
            } else {
              ctx.fillStyle = `rgba(120, 130, 160, ${alpha * 0.7})`;
              ctx.shadowBlur = 0;
            }

            ctx.fillText(char, x * charWidth + charWidth / 2, y * charHeight + charHeight / 2);
          }
        }
      }

      // Draw subtle futuristic coordinates & watermark
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "10px 'DM Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`CHRONO_CORE // ASCII_STREAM [${A.toFixed(2)}, ${B.toFixed(2)}]`, 24, height - 24);
      ctx.textAlign = "right";
      ctx.fillText("ENGINE_v2.4", width - 24, height - 24);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [charColor, glowColor]);

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-[#07080b] select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle CRT scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />
      {/* Radial vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(6,7,9,0.85)_100%)]" />
    </div>
  );
};
