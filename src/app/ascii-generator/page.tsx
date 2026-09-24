"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Palette,
  Sliders,
  Sparkles,
  RefreshCw,
  Eye,
  FileText,
  Layers,
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Maximize2,
} from "lucide-react";
import { ChronoLogo } from "@/components/ui/ChronoLogo";
import { cn } from "@/lib/utils";

const CHAR_PRESETS = [
  {
    id: "standard",
    name: "Standard (70 Caratteri)",
    chars: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  },
  {
    id: "dense",
    name: "Blocks & Shades",
    chars: " ░▒▓█",
  },
  {
    id: "minimal",
    name: "Minimalist (10 Caratteri)",
    chars: " .:-=+*#%@█",
  },
  {
    id: "binary",
    name: "Matrix Binary (0 1)",
    chars: " 01",
  },
  {
    id: "math",
    name: "Math & Symbols",
    chars: " ·:÷+±=≠≈#%&@█",
  },
];

export default function AsciiGeneratorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<"color" | "green" | "amber" | "white">("color");
  const [selectedPreset, setSelectedPreset] = useState<string>("standard");
  const [customChars, setCustomChars] = useState("");
  const [fontSize, setFontSize] = useState(9);
  const [contrast, setContrast] = useState(1.1);
  const [brightness, setBrightness] = useState(1.0);
  const [enableCrt, setEnableCrt] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ cols: 0, rows: 0, charCount: 0 });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawTextRef = useRef<string>("");

  // Sample default images
  const sampleImages = [
    {
      name: "Chrono Icon",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Cyberpunk City",
      url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Astronaut Neon",
      url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80",
    },
  ];

  useEffect(() => {
    // Load first sample on mount
    setImageSrc(sampleImages[0].url);
  }, []);

  // Handle Drag & Drop / Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Re-generate ASCII canvas whenever options change
  useEffect(() => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const activeChars =
        selectedPreset === "custom" && customChars.trim()
          ? customChars
          : CHAR_PRESETS.find((p) => p.id === selectedPreset)?.chars || CHAR_PRESETS[0].chars;

      // Calculate resolution based on font size and aspect ratio
      const charWidth = Math.max(4, Math.floor(fontSize * 0.6));
      const charHeight = fontSize;

      const maxCols = 180;
      const cols = Math.min(maxCols, Math.floor(img.width / 4));
      const aspect = img.height / img.width;
      const rows = Math.floor(cols * aspect * 0.55);

      // Offscreen downscaled canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = cols;
      offscreen.height = rows;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, cols, rows);
      const imgData = offCtx.getImageData(0, 0, cols, rows).data;

      // Render onto main canvas
      const outWidth = cols * charWidth;
      const outHeight = rows * charHeight;
      canvas.width = outWidth;
      canvas.height = outHeight;

      ctx.fillStyle = "#060709";
      ctx.fillRect(0, 0, outWidth, outHeight);

      ctx.font = `bold ${charHeight}px 'DM Mono', monospace`;
      ctx.textBaseline = "top";

      let textOutput = "";

      for (let y = 0; y < rows; y++) {
        let line = "";
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          let r = imgData[idx];
          let g = imgData[idx + 1];
          let b = imgData[idx + 2];

          // Contrast & Brightness adjustment
          r = Math.min(255, Math.max(0, (r - 128) * contrast + 128 * brightness));
          g = Math.min(255, Math.max(0, (g - 128) * contrast + 128 * brightness));
          b = Math.min(255, Math.max(0, (b - 128) * contrast + 128 * brightness));

          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const charIdx = Math.floor(luminance * (activeChars.length - 1));
          const char = activeChars[charIdx] || " ";
          line += char;

          if (char !== " ") {
            if (colorMode === "color") {
              ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
            } else if (colorMode === "green") {
              const lumInt = Math.floor(luminance * 255);
              ctx.fillStyle = `rgb(${Math.floor(lumInt * 0.2)},${lumInt},${Math.floor(lumInt * 0.4)})`;
            } else if (colorMode === "amber") {
              const lumInt = Math.floor(luminance * 255);
              ctx.fillStyle = `rgb(${lumInt},${Math.floor(lumInt * 0.7)},${Math.floor(lumInt * 0.1)})`;
            } else {
              const lumInt = Math.floor(luminance * 255);
              ctx.fillStyle = `rgb(${lumInt},${lumInt},${lumInt})`;
            }

            ctx.fillText(char, x * charWidth, y * charHeight);
          }
        }
        textOutput += line + "\n";
      }

      rawTextRef.current = textOutput;
      setStats({
        cols,
        rows,
        charCount: cols * rows,
      });
      setIsProcessing(false);
    };
  }, [imageSrc, colorMode, selectedPreset, customChars, fontSize, contrast, brightness]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const handleCopyText = () => {
    if (!rawTextRef.current) return;
    navigator.clipboard.writeText(rawTextRef.current);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `chrono-ascii-art-${Date.now()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const handleDownloadText = () => {
    if (!rawTextRef.current) return;
    const blob = new Blob([rawTextRef.current], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `chrono-ascii-art-${Date.now()}.txt`;
    a.href = url;
    a.click();
  };

  return (
    <div className="min-h-screen w-full bg-[#08090c] text-ink font-sans flex flex-col select-none">
      {/* Top Header */}
      <header className="w-full bg-zinc-950 border-b border-white/5 px-6 py-3.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Torna ai progetti</span>
          </Link>

          <div className="h-4 w-px bg-white/5 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-sm">
              <ChronoLogo size={16} />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">
              Color ASCII Art Generator
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copiato" : "Copia testo"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Esporta PNG</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar + Viewport) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Toolbar / Settings Pane */}
        <aside className="w-full lg:w-80 xl:w-96 bg-zinc-950 border-r border-white/5 p-5 overflow-y-auto flex flex-col gap-6 shrink-0">
          {/* Upload Box */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Carica immagine PNG / JPG
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-zinc-900/40 hover:bg-zinc-900/60 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white group-hover:text-zinc-300 transition-colors">
                  Clicca o trascina qui un file
                </span>
                <span className="text-[10px] text-zinc-500 mt-0.5">
                  Supporta PNG, JPG, WebP o Ctrl+V
                </span>
              </div>
            </div>

            {/* Sample Images Quick Pick */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-zinc-500">Oppure prova:</span>
              <div className="flex items-center gap-1.5">
                {sampleImages.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setImageSrc(s.url)}
                    className="text-[10px] text-zinc-300 hover:text-white hover:underline font-medium cursor-pointer"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Palette Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Modalità colore
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setColorMode("color")}
                className={cn(
                  "p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer",
                  colorMode === "color"
                    ? "bg-white/10 border-white/20 text-white shadow-sm"
                    : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400" />
                <span>Colori RGB</span>
              </button>

              <button
                type="button"
                onClick={() => setColorMode("green")}
                className={cn(
                  "p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer",
                  colorMode === "green"
                    ? "bg-white/10 border-white/20 text-white shadow-sm"
                    : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                <span>Matrix Green</span>
              </button>

              <button
                type="button"
                onClick={() => setColorMode("amber")}
                className={cn(
                  "p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer",
                  colorMode === "amber"
                    ? "bg-white/10 border-white/20 text-white shadow-sm"
                    : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                <span>Retro Amber</span>
              </button>

              <button
                type="button"
                onClick={() => setColorMode("white")}
                className={cn(
                  "p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer",
                  colorMode === "white"
                    ? "bg-white/10 border-white/20 text-white shadow-sm"
                    : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white" />
                <span>Monocromatico</span>
              </button>
            </div>
          </div>

          {/* Character Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Set di caratteri ASCII
            </span>
            <div className="flex flex-col gap-1.5">
              {CHAR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPreset(p.id)}
                  className={cn(
                    "p-2 rounded-lg border text-xs transition-all flex items-center justify-between text-left cursor-pointer",
                    selectedPreset === p.id
                      ? "bg-white/10 border-white/20 text-white font-medium"
                      : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  <span>{p.name}</span>
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[90px]">
                    {p.chars.substring(0, 8)}...
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders: Resolution, Contrast, Brightness */}
          <div className="flex flex-col gap-4 pt-2 border-t border-white/5">
            {/* Font Size / Density */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Dimensione carattere (Risoluzione)</span>
                <span className="font-mono text-zinc-300 text-[11px] font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="18"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500">
                Font più piccolo = maggiore risoluzione e dettagli
              </span>
            </div>

            {/* Contrast Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Contrasto</span>
                <span className="font-mono text-zinc-300 text-[11px] font-bold">{contrast.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Brightness Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Luminosità</span>
                <span className="font-mono text-zinc-300 text-[11px] font-bold">{brightness.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* CRT Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs font-medium text-white">Filtro CRT Scanlines</span>
              <button
                type="button"
                onClick={() => setEnableCrt(!enableCrt)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative cursor-pointer p-0.5",
                  enableCrt ? "bg-white" : "bg-zinc-800"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full transition-transform",
                    enableCrt ? "translate-x-5 bg-zinc-950" : "translate-x-0 bg-white"
                  )}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Preview Canvas Viewport */}
        <main className="flex-1 bg-black p-6 flex flex-col items-center justify-center relative overflow-auto">
          {/* Realtime Canvas Container */}
          <div className="relative border border-white/10 rounded-xl shadow-2xl overflow-hidden bg-black max-w-full max-h-full flex items-center justify-center p-4">
            <canvas ref={canvasRef} className="max-w-full max-h-[75vh] object-contain block" />

            {/* CRT Texture overlay */}
            {enableCrt && (
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40" />
            )}
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex items-center gap-6 text-[11px] font-mono text-zinc-500">
            <span>GRIGLIA: {stats.cols} x {stats.rows} CARATTERI</span>
            <span>-</span>
            <span>TOTALE: {stats.charCount.toLocaleString()} GLIFI</span>
            <span>-</span>
            <button
              type="button"
              onClick={handleDownloadText}
              className="text-zinc-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>Scarica .TXT</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
