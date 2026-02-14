import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";

export default function VintageToggle({ className }: { className?: string }) {
  const vintage = useAppStore((s) => s.vintage);
  const toggleVintage = useAppStore((s) => s.toggleVintage);

  return (
    <button
      type="button"
      onClick={toggleVintage}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text)]",
        "transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0",
        vintage && "ring-2 ring-[color:var(--accent)]",
        className,
      )}
      aria-label={vintage ? "Matikan Mode Vintage" : "Nyalakan Mode Vintage"}
    >
      <Camera className="h-4 w-4" />
      <span className="hidden sm:inline">Vintage</span>
    </button>
  );
}

