import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";

export type Theme = "romantic" | "night";

export function useTheme() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "night");
  }, [theme]);

  return {
    theme,
    toggleTheme,
    isNight: theme === "night",
  };
}
