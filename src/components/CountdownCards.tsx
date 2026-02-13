import { useEffect, useMemo, useState } from "react";
import { diffParts, nextAnniversary } from "@/utils/dates";
import { cn } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <div key={String(value)} className="flip-number text-2xl font-semibold tabular-nums text-[var(--text)]">
        {value}
      </div>
      <div className="mt-1 text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}

export default function CountdownCards({ className }: { className?: string }) {
  const target = useMemo(() => nextAnniversary(), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = diffParts(target, now);

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      <Stat label="Hari" value={days} />
      <Stat label="Jam" value={hours} />
      <Stat label="Menit" value={minutes} />
      <Stat label="Detik" value={seconds} />
    </div>
  );
}

