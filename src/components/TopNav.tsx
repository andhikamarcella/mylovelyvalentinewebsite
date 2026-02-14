import { Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import VintageToggle from "@/components/VintageToggle";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "rounded-full px-3 py-2 text-sm transition",
          isActive
            ? "bg-white/10 text-[var(--text)]"
            : "text-[var(--muted)] hover:bg-white/10 hover:text-[var(--text)]",
        )
      }
    >
      {children}
    </NavLink>
  );
}

export default function TopNav({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-white/10 bg-[color:var(--bg)]/70 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 text-[var(--text)]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
            <Heart className="h-5 w-5 text-[var(--accent)]" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Untuk Kamu</div>
            <div className="text-xs text-[var(--muted)]">Valentine</div>
          </div>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavItem to="/kenangan">Kenangan</NavItem>
          <NavItem to="/game">Claw</NavItem>
          <NavItem to="/secret">Rahasia</NavItem>
          <VintageToggle className="ml-1" />
          <ThemeToggle className="ml-1" />
        </nav>
      </div>
    </header>
  );
}

