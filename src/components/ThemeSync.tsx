"use client";

import { useEffect } from "react";

import { DEFAULT_THEME, getStoredTheme } from "@/lib/indian-languages";

const STORAGE_KEY = "voteeasy-theme";

function applyTheme(theme: string) {
  const resolvedTheme = getStoredTheme(theme);
  document.documentElement.dataset.theme = resolvedTheme.toLowerCase();
  document.body.dataset.theme = resolvedTheme.toLowerCase();
}

export function ThemeSync() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
    applyTheme(savedTheme);

    const syncTheme = () => {
      applyTheme(window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME);
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === STORAGE_KEY) {
        syncTheme();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("voteeasy-settings-updated", syncTheme as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("voteeasy-settings-updated", syncTheme as EventListener);
    };
  }, []);

  return null;
}

