"use client";

import { useLinearStore } from "@/store/useLinearStore";
import { SupportedLanguage, LanguageInfo, TranslationDictionary } from "./types";
import { it } from "./locales/it";
import { en } from "./locales/en";
import { de } from "./locales/de";
import { fr } from "./locales/fr";
import { es } from "./locales/es";
import { ru } from "./locales/ru";

export * from "./types";

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  it,
  en,
  de,
  fr,
  es,
  ru,
};

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "it", name: "Italian", nativeName: "Italiano", badge: "IT" },
  { code: "en", name: "English", nativeName: "English", badge: "EN" },
  { code: "de", name: "German", nativeName: "Deutsch", badge: "DE" },
  { code: "fr", name: "French", nativeName: "Français", badge: "FR" },
  { code: "es", name: "Spanish", nativeName: "Español", badge: "ES" },
  { code: "ru", name: "Russian", nativeName: "Русский", badge: "RU" },
];

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "it";
  try {
    const local = window.localStorage.getItem("chrono_language");
    if (local && local in translations) {
      return local as SupportedLanguage;
    }
    const match = document.cookie.match(/(?:^|;\s*)chrono_language=([^;]+)/);
    if (match && match[1] in translations) {
      return match[1] as SupportedLanguage;
    }
  } catch (_) {}
  return "it";
}

export function getTranslation(lang?: string | null): TranslationDictionary {
  if (lang && lang in translations) {
    return translations[lang as SupportedLanguage];
  }
  return translations.it;
}

import { useState, useEffect } from "react";

export function useTranslation() {
  const storeLang = useLinearStore((state) => state.preferences?.language);
  const updatePreferences = useLinearStore((state) => state.updatePreferences);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or first render on client, keep deterministic language to avoid hydration mismatch
  let currentLang: SupportedLanguage = "it";
  if (mounted) {
    if (storeLang && storeLang in translations) {
      currentLang = storeLang as SupportedLanguage;
    } else {
      currentLang = getStoredLanguage();
    }
  }

  const t = translations[currentLang] || translations.it;

  const setLanguage = (lang: SupportedLanguage) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("chrono_language", lang);
      } catch (_) {}
      document.cookie = `chrono_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = lang;
    }
    updatePreferences({ language: lang });
  };

  return {
    t,
    lang: currentLang,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    isMounted: mounted,
  };
}

