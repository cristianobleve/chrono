"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Palette, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AsciiVideoPlayerProps {
  videoSrc: string;
  className?: string;
  colorMode?: "color" | "monochrome";
  fontSize?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const AsciiVideoPlayer: React.FC<AsciiVideoPlayerProps> = ({
  videoSrc,
  className = "",
  colorMode: initialColorMode = "color",
  isPlaying: externalIsPlaying,
  onTogglePlay,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [colorMode, setColorMode] = useState<"color" | "monochrome">(initialColorMode);
  const [internalIsPlaying, setInternalIsPlaying] = useState(true);
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
    if (!offscreenCtx) return;

    let animationFrameId: number;
    const asciiChars = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    const render = () => {
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const containerHeight = canvas.parentElement?.clientHeight || 600;

        if (canvas.width !== containerWidth || canvas.height !== containerHeight) {
          canvas.width = containerWidth;
          canvas.height = containerHeight;
        }

        // Calculate columns and rows based on aspect ratio
        const charWidth = 7;
        const charHeight = 12;
        const cols = Math.floor(containerWidth / charWidth);
        const rows = Math.floor(containerHeight / charHeight);

        offscreenCanvas.width = cols;
        offscreenCanvas.height = rows;

        // Draw downscaled video frame
        offscreenCtx.drawImage(video, 0, 0, cols, rows);

        let imgData: ImageData;
        try {
          imgData = offscreenCtx.getImageData(0, 0, cols, rows);
        } catch (e) {
          // If cross-origin or canvas read issue
          return;
        }

        const data = imgData.data;

        // Clear canvas with deep black
        ctx.fillStyle = "#060709";
        ctx.fillRect(0, 0, containerWidth, containerHeight);

        ctx.font = `bold ${charHeight - 1}px 'DM Mono', monospace`;
        ctx.textBaseline = "top";

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Perceptual luminance
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const charIdx = Math.floor(brightness * (asciiChars.length - 1));
            const char = asciiChars[charIdx] || " ";

            if (char !== " ") {
              if (colorMode === "color") {
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              } else {
                const monoVal = Math.floor(brightness * 255);
                ctx.fillStyle = `rgb(${monoVal},${Math.min(255, monoVal + 20)},${Math.min(255, monoVal + 40)})`;
              }
              ctx.fillText(char, x * charWidth, y * charHeight);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleLoadedData = () => {
      setIsLoaded(true);
      if (isPlaying) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", () => setIsLoaded(true));
    video.addEventListener("error", () => setHasError(true));

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [colorMode]);

  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
      return;
    }
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setInternalIsPlaying(true);
    } else {
      videoRef.current.pause();
      setInternalIsPlaying(false);
    }
  };

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === "color" ? "monochrome" : "color"));
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden flex items-center justify-center bg-[#060709] select-none",
        className
      )}
    >
      {/* Hidden Video Source Engine */}
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        autoPlay
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Visible ASCII Realtime Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* CRT Scanline & Grain Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,7,9,0.8)_100%)]" />

      {/* Floating Controls in bottom-right corner */}
      <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 backdrop-blur-md bg-zinc-950/80 p-1.5 rounded-[12px] border border-white/10 shadow-2xl">
        <button
          type="button"
          onClick={toggleColorMode}
          className="px-2.5 py-1 rounded-[8px] text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-subtle hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Toggle Color / Monochrome Matrix Mode"
        >
          <Palette className="w-3 h-3 text-zinc-400" />
          <span>{colorMode === "color" ? "Color ASCII" : "Mono ASCII"}</span>
        </button>

        <div className="w-px h-3.5 bg-white/10" />

        <button
          type="button"
          onClick={togglePlay}
          className="p-1 rounded-[8px] text-ink-subtle hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isPlaying ? "Pausa Video" : "Avvia Video"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Top Stream Watermark */}
      <div className="absolute top-4 left-6 z-20 pointer-events-none flex items-center gap-2 text-[10px] font-mono text-ink-tertiary">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>CHRONO // LIVE_ASCII_STREAM · 60FPS</span>
      </div>
    </div>
  );
};
