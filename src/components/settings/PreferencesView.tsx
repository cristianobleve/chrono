"use client";

import React from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { useTranslation, SupportedLanguage } from "@/i18n";
import { cn } from "@/lib/utils";

export const PreferencesView: React.FC = () => {
  const { preferences, updatePreferences, addToast } = useLinearStore();
  const { t, lang, setLanguage, languages } = useTranslation();

  const handleToggleEmoticons = () => {
    updatePreferences({ convertEmoticons: !preferences.convertEmoticons });
    addToast({
      title: t.preferences.convertEmoticons,
      description: !preferences.convertEmoticons ? "On" : "Off",
      type: "info",
    });
  };

  const handleTogglePointerCursors = () => {
    updatePreferences({ usePointerCursors: !preferences.usePointerCursors });
    addToast({
      title: t.preferences.usePointerCursors,
      description: !preferences.usePointerCursors ? "On" : "Off",
      type: "info",
    });
  };

  const languageOptions: SelectOption[] = languages.map((l) => ({
    value: l.code,
    label: l.nativeName,
  }));

  const homeViewOptions: SelectOption[] = [
    { value: "agent", label: "Chrono Agent (default)" },
    { value: "projects", label: t.projects.title },
    { value: "all_issues", label: t.issues.title },
    { value: "my_issues", label: t.nav.myIssues },
  ];

  const displayNameOptions: SelectOption[] = [
    { value: "username", label: t.preferences.options.username },
    { value: "full_name", label: t.preferences.options.fullName },
  ];

  const firstDayOptions: SelectOption[] = [
    { value: "sunday", label: t.preferences.options.sunday },
    { value: "monday", label: t.preferences.options.monday },
  ];

  const fontSizeOptions: SelectOption[] = [
    { value: "default", label: t.preferences.options.fontDefault },
    { value: "small", label: t.preferences.options.fontSmall },
    { value: "large", label: t.preferences.options.fontLarge },
  ];

  return (
    <div className="flex-1 p-6 md:p-10 w-full max-w-5xl flex flex-col gap-8 text-ink select-none pb-24">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.preferences.title}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {t.preferences.subtitle}
        </p>
      </div>

      {/* General Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
          {t.preferences.generalExperience}
        </h2>

        <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-5 text-xs">
          {/* Interface Language */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">{t.preferences.languageLabel}</span>
              <span className="text-[11px] text-zinc-400">
                {t.preferences.languageDesc}
              </span>
            </div>

            <LinearSelect
              options={languageOptions}
              value={lang}
              onChange={(val) => {
                setLanguage(val as SupportedLanguage);
                addToast({
                  title: t.preferences.languageUpdatedToast,
                  type: "info",
                });
              }}
              searchable={false}
              align="right"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* Default home view */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">{t.preferences.defaultHomeView}</span>
              <span className="text-[11px] text-zinc-400">
                {t.preferences.defaultHomeViewDesc}
              </span>
            </div>

            <LinearSelect
              options={homeViewOptions}
              value={preferences.defaultHomeView}
              onChange={(val) => {
                updatePreferences({ defaultHomeView: val as any });
                addToast({
                  title: t.preferences.defaultHomeView,
                  type: "info",
                });
              }}
              align="right"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* Display names */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">{t.preferences.displayNames}</span>
              <span className="text-[11px] text-zinc-400">
                {t.preferences.displayNamesDesc}
              </span>
            </div>

            <LinearSelect
              options={displayNameOptions}
              value={preferences.displayNames}
              onChange={(val) => {
                updatePreferences({ displayNames: val as any });
                addToast({
                  title: t.preferences.displayNames,
                  type: "info",
                });
              }}
              align="right"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* First day of the week */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">{t.preferences.firstDayOfWeek}</span>
              <span className="text-[11px] text-zinc-400">{t.preferences.firstDayOfWeekDesc}</span>
            </div>

            <LinearSelect
              options={firstDayOptions}
              value={preferences.firstDayOfWeek}
              onChange={(val) => {
                updatePreferences({ firstDayOfWeek: val as any });
                addToast({
                  title: t.preferences.firstDayOfWeek,
                  type: "info",
                });
              }}
              align="right"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* Convert emoticons */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">{t.preferences.convertEmoticons}</span>
              <span className="text-[11px] text-zinc-400">
                {t.preferences.convertEmoticonsDesc}
              </span>
            </div>

            <button
              onClick={handleToggleEmoticons}
              type="button"
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer",
                preferences.convertEmoticons ? "bg-white" : "bg-zinc-900 border border-white/10"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full transition-transform duration-200 shadow-md",
                  preferences.convertEmoticons ? "translate-x-5 bg-zinc-950" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Interface and Theme Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
          {t.preferences.interfaceVisuals}
        </h2>

        <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-5 text-xs">
          {/* Font size */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">{t.preferences.fontSize}</span>
              <span className="text-[11px] text-zinc-400">
                {t.preferences.fontSizeDesc}
              </span>
            </div>

            <LinearSelect
              options={fontSizeOptions}
              value={preferences.fontSize}
              onChange={(val) => {
                updatePreferences({ fontSize: val as any });
                addToast({
                  title: t.preferences.fontSize,
                  type: "info",
                });
              }}
              align="right"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* Use pointer cursors */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">{t.preferences.usePointerCursors}</span>
              <span className="text-[11px] text-zinc-400">
                {t.preferences.usePointerCursorsDesc}
              </span>
            </div>

            <button
              onClick={handleTogglePointerCursors}
              type="button"
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer",
                preferences.usePointerCursors ? "bg-white" : "bg-zinc-900 border border-white/10"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full transition-transform duration-200 shadow-md",
                  preferences.usePointerCursors ? "translate-x-5 bg-zinc-950" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
