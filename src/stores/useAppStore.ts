import { create } from "zustand";

type Theme = "romantic" | "night";

type AppState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const THEME_KEY = "valentine_theme";

function readTheme(): Theme {
  const raw = localStorage.getItem(THEME_KEY);
  if (raw === "romantic" || raw === "night") return raw;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "romantic";
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "romantic" ? "night" : "romantic";
    localStorage.setItem(THEME_KEY, next);
    set({ theme: next });
  },
}));

