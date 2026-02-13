import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Ripple = { id: string; x: number; y: number; size: number };

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function RippleButton({
  className,
  children,
  onPointerDown,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  return (
    <button
      {...props}
      ref={ref}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (props.disabled) return;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 1.2;
        const id = uid();
        setRipples((r) => [...r, { id, x, y, size }]);
        window.setTimeout(() => setRipples((r) => r.filter((rr) => rr.id !== id)), 520);
      }}
      className={cn(
        "relative overflow-hidden",
        "inline-flex items-center justify-center gap-2 rounded-full",
        "transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]",
        className,
      )}
    >
      {children}
      <span className="pointer-events-none absolute inset-0">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      </span>
    </button>
  );
}

