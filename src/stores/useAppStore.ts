import { create } from "zustand";

type Theme = "romantic" | "night";

type Preferences = {
  vintage: boolean;
  setVintage: (v: boolean) => void;
  toggleVintage: () => void;
};

type AppState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} & Preferences;

const THEME_KEY = "valentine_theme";
const VINTAGE_KEY = "valentine_vintage_mode";

function readTheme(): Theme {
  const raw = localStorage.getItem(THEME_KEY);
  if (raw === "romantic" || raw === "night") return raw;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "romantic";
}

function readVintage(): boolean {
  return localStorage.getItem(VINTAGE_KEY) === "1";
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: readTheme(),
  vintage: readVintage(),
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "romantic" ? "night" : "romantic";
    localStorage.setItem(THEME_KEY, next);
    set({ theme: next });
  },
  setVintage: (v) => {
    localStorage.setItem(VINTAGE_KEY, v ? "1" : "0");
    set({ vintage: v });
  },
  toggleVintage: () => {
    const next = !get().vintage;
    localStorage.setItem(VINTAGE_KEY, next ? "1" : "0");
    set({ vintage: next });
  },
}));

