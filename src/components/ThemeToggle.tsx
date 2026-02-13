import { Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === "night";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text)]",
        "transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0",
        className,
      )}
      aria-label={isNight ? "Ubah ke tema Romantis" : "Ubah ke tema Gelap"}
    >
      {isNight ? <Moon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      <span className="hidden sm:inline">{isNight ? "Gelap" : "Romantis"}</span>
    </button>
  );
}

