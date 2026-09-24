"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { Tag } from "@/types";
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Filter,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "@/i18n";

const PRESET_COLORS = [
  "#60a5fa", // Blue
  "#34d399", // Emerald
  "#c084fc", // Violet
  "#f472b6", // Pink
  "#fb923c", // Orange
  "#facc15", // Amber
  "#38bdf8", // Cyan
  "#f87171", // Red
  "#a3e635", // Lime
  "#94a3b8", // Slate
];

export const TagsManagerView: React.FC = () => {
  const { t } = useTranslation();
  const { tags, addTag, updateTag, deleteTag, issues, addToast } = useLinearStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#60a5fa");
  const [newTagDesc, setNewTagDesc] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    addTag({
      name: newTagName.trim().replace(/^#/, ""),
      color: newTagColor,
      description: newTagDesc.trim() || undefined,
    });

    setNewTagName("");
    setNewTagDesc("");
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6 text-ink select-none pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-zinc-400" />
            <span>{t.tags.title}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {t.tags.subtitle}
          </p>
        </div>
      </div>

      {/* 1. Create Tag Card */}
      <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 flex flex-col gap-4 shadow-xl">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider text-zinc-400">
          {t.tags.newTag}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-zinc-400">{t.tags.tagName}</label>
            <input
              type="text"
              placeholder={t.tags.tagNamePlaceholder}
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-zinc-400">{t.tags.description}</label>
            <input
              type="text"
              placeholder={t.tags.descriptionPlaceholder}
              value={newTagDesc}
              onChange={(e) => setNewTagDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 focus:border-white/20 text-white text-xs focus:outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Color Palette Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{t.tags.color}:</span>
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTagColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "w-5 h-5 rounded-full transition-transform cursor-pointer",
                    newTagColor === c ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : "hover:scale-105"
                  )}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateTag}
            disabled={!newTagName.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-black text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.tags.create}</span>
          </button>
        </div>
      </div>

      {/* 2. Tags List Card */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider text-zinc-400">
            {t.tags.title} ({tags.length})
          </h2>

          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-zinc-500" />
            <input
              type="text"
              placeholder={t.tags.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredTags.map((tag) => {
            const taskCount = issues.filter(
              (i) => i.labels?.includes(tag.name) || i.tags?.includes(tag.name)
            ).length;

            return (
              <div
                key={tag.id}
                className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 flex flex-col justify-between gap-3 shadow-sm group transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-white text-xs font-heading">
                      #{tag.name}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 rounded transition-opacity cursor-pointer"
                    title={t.tags.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {tag.description && (
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {tag.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                  <span>{taskCount} {t.tags.usageCount}</span>
                  <Link
                    href="/issues"
                    className="text-zinc-300 hover:text-white font-medium transition-colors flex items-center gap-1"
                  >
                    <span>{t.common.open}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
