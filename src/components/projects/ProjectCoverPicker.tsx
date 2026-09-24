"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Search,
  Image as ImageIcon,
  Sparkles,
  Upload,
  RefreshCw,
  Palette,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UnsplashPhotoSkeleton } from "@/components/ui/Skeleton";

export interface CoverPreset {
  id: string;
  title: string;
  url: string;
  thumbUrl?: string;
  author: string;
  authorUrl?: string;
}

export interface GradientPreset {
  id: string;
  title: string;
  gradient: string;
}

export const INITIAL_UNSPLASH_COVERS: CoverPreset[] = [
  {
    id: "unsplash-1",
    title: "Abstract Neon Waves",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=70",
    author: "Milad Fakurian",
    authorUrl: "https://unsplash.com/@fakurian",
  },
  {
    id: "unsplash-2",
    title: "Deep Space Nebula",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=70",
    author: "NASA",
    authorUrl: "https://unsplash.com/@nasa",
  },
  {
    id: "unsplash-3",
    title: "Cyberpunk Geometry",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=70",
    author: "Google DeepMind",
    authorUrl: "https://unsplash.com/@googledeepmind",
  },
  {
    id: "unsplash-4",
    title: "Dark Minimal Architecture",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=70",
    author: "Simone Hutsch",
    authorUrl: "https://unsplash.com/@heysupersimi",
  },
  {
    id: "unsplash-5",
    title: "Cybernetic Mesh Fluid",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=70",
    author: "DeepMind AI",
    authorUrl: "https://unsplash.com/@googledeepmind",
  },
  {
    id: "unsplash-6",
    title: "Aurora Night Glow",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=70",
    author: "Jonatan Pie",
    authorUrl: "https://unsplash.com/@jonatanpie",
  },
  {
    id: "unsplash-7",
    title: "Obsidian Mountain Mist",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=70",
    author: "Benjamin Davies",
    authorUrl: "https://unsplash.com/@bendavisual",
  },
  {
    id: "unsplash-8",
    title: "Prismatic Light Dispersion",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=70",
    author: "Pawel Czerwinski",
    authorUrl: "https://unsplash.com/@pawel_czerwinski",
  },
];

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "grad-1",
    title: "Obsidian Sunset",
    gradient: "linear-gradient(135deg, #1e0538 0%, #4a0e4e 50%, #9d174d 100%)",
  },
  {
    id: "grad-2",
    title: "Cyber Aurora",
    gradient: "linear-gradient(135deg, #051923 0%, #003554 40%, #006494 70%, #0582ca 100%)",
  },
  {
    id: "grad-3",
    title: "Cosmic Emerald",
    gradient: "linear-gradient(135deg, #022b19 0%, #064e3b 50%, #047857 100%)",
  },
  {
    id: "grad-4",
    title: "Crimson Blaze",
    gradient: "linear-gradient(135deg, #2b0808 0%, #5a0d0d 50%, #991b1b 100%)",
  },
  {
    id: "grad-5",
    title: "Royal Indigo",
    gradient: "linear-gradient(135deg, #0c0f24 0%, #1e1b4b 50%, #3730a3 100%)",
  },
  {
    id: "grad-6",
    title: "Solar Amber",
    gradient: "linear-gradient(135deg, #251202 0%, #592506 50%, #9a3412 100%)",
  },
];

const SEARCH_TOPIC_CHIPS = [
  { label: "Tutto", query: "all" },
  { label: "Natura & Montagne", query: "natura montagne" },
  { label: "Architettura", query: "architettura" },
  { label: "Astratto & 3D", query: "astratto" },
  { label: "Dark Tech & Code", query: "tech code" },
  { label: "Spazio & Cosmo", query: "spazio" },
  { label: "Gradienti Mesh", query: "gradiente" },
];

interface ProjectCoverPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverUrl?: string | null;
  currentCoverGradient?: string | null;
  onSave: (cover: { coverUrl: string | null; coverGradient: string | null }) => void;
}

export const ProjectCoverPicker: React.FC<ProjectCoverPickerProps> = ({
  isOpen,
  onClose,
  currentCoverUrl,
  currentCoverGradient,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"unsplash" | "gradients" | "custom">("unsplash");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Tutto");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentCoverUrl || null);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(currentCoverGradient || null);
  const [customInputUrl, setCustomInputUrl] = useState("");

  const [photos, setPhotos] = useState<CoverPreset[]>(INITIAL_UNSPLASH_COVERS);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentCoverUrl || null);
      setSelectedGradient(currentCoverGradient || null);
      if (currentCoverGradient && !currentCoverUrl) {
        setActiveTab("gradients");
      }
      executeUnsplashQuery("all");
    }
  }, [isOpen, currentCoverUrl, currentCoverGradient]);

  // Live Query Search Execution
  const executeUnsplashQuery = async (queryText: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(queryText)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setPhotos(data.results);
        }
      }
    } catch (err) {
      console.warn("Unsplash live query error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      executeUnsplashQuery(text || "abstract dark");
    }, 400);
  };

  const handleChipClick = (chip: { label: string; query: string }) => {
    setActiveChip(chip.label);
    setSearchQuery("");
    executeUnsplashQuery(chip.query);
  };

  if (!isOpen) return null;

  const handleSelectUnsplash = (url: string) => {
    setSelectedUrl(url);
    setSelectedGradient(null);
  };

  const handleSelectGradient = (gradient: string) => {
    setSelectedGradient(gradient);
    setSelectedUrl(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawDataUrl = uploadEvent.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setSelectedUrl(compressed);
          setSelectedGradient(null);
        } else {
          setSelectedUrl(rawDataUrl);
          setSelectedGradient(null);
        }
      };
      img.onerror = () => {
        setSelectedUrl(rawDataUrl);
        setSelectedGradient(null);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customInputUrl.trim()) return;
    setSelectedUrl(customInputUrl.trim());
    setSelectedGradient(null);
  };

  const handleRemoveCover = () => {
    setSelectedUrl(null);
    setSelectedGradient(null);
    onSave({ coverUrl: null, coverGradient: null });
    onClose();
  };

  const handleSave = () => {
    onSave({
      coverUrl: selectedUrl,
      coverGradient: selectedGradient,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[4px] p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-[18px] p-6 flex flex-col gap-5 shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[12px] bg-zinc-800 text-white border border-white/10 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Immagine di Copertina Progetto
              </h2>
              <p className="text-[11px] text-zinc-400">
                Accesso alla libreria Unsplash, gradienti scuri o upload personalizzato.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Banner Preview */}
        <div className="w-full h-32 rounded-[14px] overflow-hidden border border-white/10 relative flex items-end p-4 shadow-inner">
          {selectedUrl ? (
            <img
              src={selectedUrl}
              alt="Cover preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : selectedGradient ? (
            <div
              className="absolute inset-0 w-full h-full"
              style={{ background: selectedGradient }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-zinc-900/60 flex items-center justify-center text-xs text-zinc-500">
              Nessuna copertina selezionata
            </div>
          )}

          {/* Dark Gradient Overlay for perfect readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-white text-black font-bold text-sm flex items-center justify-center shadow-lg">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">Anteprima Copertina</span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {selectedUrl ? "Immagine Unsplash HD" : selectedGradient ? "Gradiente Attivo" : "Nessun background"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-[12px] bg-zinc-900/60 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("unsplash")}
            className={cn(
              "flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "unsplash"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Unsplash Live Search</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gradients")}
            className={cn(
              "flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "gradients"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Gradienti Scuri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={cn(
              "flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "custom"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Carica / URL</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[340px]">
          {activeTab === "unsplash" && (
            <div className="flex flex-col gap-3">
              {/* Search Bar with live query */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Cerca su Unsplash (es. dark minimal, mountains, architecture, glass)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-[12px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin absolute right-3.5" />
                )}
              </div>

              {/* Topic Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {SEARCH_TOPIC_CHIPS.map((chip) => {
                  const isActive = activeChip === chip.label && !searchQuery;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={cn(
                        "px-3 py-1 rounded-[8px] text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer",
                        isActive
                          ? "bg-white text-black font-semibold shadow-sm"
                          : "bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white"
                      )}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Unsplash Photo Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {isSearching ? (
                  <>
                    <UnsplashPhotoSkeleton />
                    <UnsplashPhotoSkeleton />
                    <UnsplashPhotoSkeleton />
                    <UnsplashPhotoSkeleton />
                    <UnsplashPhotoSkeleton />
                    <UnsplashPhotoSkeleton />
                    <UnsplashPhotoSkeleton />
                    <UnsplashPhotoSkeleton />
                  </>
                ) : (
                  photos.map((item) => {
                    const isSelected = selectedUrl === item.url;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectUnsplash(item.url)}
                      className={cn(
                        "h-28 rounded-[12px] overflow-hidden relative cursor-pointer group border transition-all shadow-md bg-zinc-900",
                        isSelected
                          ? "ring-2 ring-white border-white"
                          : "border-white/5 hover:border-white/20"
                      )}
                    >
                      <img
                        src={item.thumbUrl || item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2">
                        <span className="text-[10px] font-semibold text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[8px] text-zinc-400 truncate flex items-center justify-between">
                          <span>{item.author}</span>
                          <span className="text-white/40 font-mono">HD</span>
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>
          )}

          {activeTab === "gradients" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GRADIENT_PRESETS.map((g) => {
                const isSelected = selectedGradient === g.gradient;

                return (
                  <div
                    key={g.id}
                    onClick={() => handleSelectGradient(g.gradient)}
                    className={cn(
                      "h-28 rounded-[12px] p-3.5 flex flex-col justify-end relative cursor-pointer border transition-all shadow-md group",
                      isSelected
                        ? "ring-2 ring-white border-white"
                        : "border-white/5 hover:border-white/20"
                    )}
                    style={{ background: g.gradient }}
                  >
                    <span className="text-xs font-bold text-white shadow-sm">
                      {g.title}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "custom" && (
            <div className="flex flex-col gap-4">
              {/* File Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white">Carica Immagine da Computer</label>
                <label className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-[14px] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/40 transition-all">
                  <Upload className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs text-white font-medium">Seleziona file immagine...</span>
                  <span className="text-[10px] text-zinc-500">Supporta PNG, JPG, WebP, SVG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white">Oppure Inserisci URL Immagine</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={customInputUrl}
                    onChange={(e) => setCustomInputUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-[12px] bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    disabled={!customInputUrl.trim()}
                    className="px-4 py-2 rounded-[12px] bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all disabled:opacity-40"
                  >
                    Applica
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={handleRemoveCover}
            className="text-xs text-rose-400 hover:underline cursor-pointer"
          >
            Rimuovi Copertina
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-[12px] text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-[12px] bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Salva Copertina</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
