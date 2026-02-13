import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  tw: number;
  sp: number;
};

export default function StarsBackdrop({ density = 110 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];

    const resize = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const w = Math.max(1, Math.floor(canvas.clientWidth));
      const h = Math.max(1, Math.floor(canvas.clientHeight));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((w * h) / 14000) + density;
      stars = new Array(count).fill(null).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.6,
        tw: Math.random() * Math.PI * 2,
        sp: 0.9 + Math.random() * 1.4,
      }));
    };

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.35, Math.max(w, h));
      g.addColorStop(0, "rgba(125,220,255,0.10)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        const phase = (t / 1000) * s.sp + s.tw;
        const a = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(247,233,239,${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    raf = window.requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, [density]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

