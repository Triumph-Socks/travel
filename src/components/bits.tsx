import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { WeatherKind } from "../data/expeditions";

/* ---------------- scroll reveal ---------------- */

export function Reveal({
  children, className = "", delay = 0, dir,
}: { children: ReactNode; className?: string; delay?: number; dir?: "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("rv-in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const d = dir === "left" ? "rv-left" : dir === "right" ? "rv-right" : "";
  return (
    <div ref={ref} className={`rv ${d} ${className}`} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

/* ---------------- animated counter ---------------- */

export function CountUp({ to, suffix = "", prefix = "", decimals = 0 }: { to: number; suffix?: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      io.disconnect();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) { setVal(to); return; }
      const t0 = performance.now();
      const dur = 1500;
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        setVal(to * eased);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  const shown = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-US");
  return <span ref={ref}>{prefix}{shown}{suffix}</span>;
}

/* ---------------- animated number (for ledgers) ---------------- */

export function useAnimatedNumber(target: number): number {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const dur = 550;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setVal(from + (target - from) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

/* ---------------- stamps & buttons ---------------- */

export function StampButton({
  children, onClick, tone = "terra", small = false, disabled = false, className = "",
}: { children: ReactNode; onClick?: () => void; tone?: "terra" | "ink" | "gold"; small?: boolean; disabled?: boolean; className?: string }) {
  const tones: Record<string, string> = {
    terra: "bg-terra text-parchment border-terra-2 shadow-[0_10px_24px_-10px_rgba(154,69,38,0.7)]",
    ink: "bg-ink text-parchment border-canopy-3 shadow-[0_10px_24px_-10px_rgba(43,38,32,0.6)]",
    gold: "bg-bronze text-parchment border-bronze-2 shadow-[0_10px_24px_-10px_rgba(124,95,51,0.7)]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative -rotate-1 border-2 font-display uppercase tracking-[0.18em] transition-all duration-300
        ${small ? "px-4 py-2 text-[11px]" : "px-7 py-3.5 text-xs sm:text-sm"}
        ${tones[tone]}
        ${disabled ? "cursor-not-allowed opacity-40 saturate-50" : "hover:rotate-0 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"}
        ${className}`}
    >
      <span className="pointer-events-none absolute inset-1 border border-current opacity-40" />
      {children}
    </button>
  );
}

/* ---------------- compass rose ---------------- */

export function CompassRose({ className = "", spin = false }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} ${spin ? "spin-slow" : ""}`} aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <g key={a} transform={`rotate(${a} 50 50)`}>
          <path d="M50 6 L54 46 L50 50 L46 46 Z" fill={a % 90 === 0 ? "currentColor" : "currentColor"} opacity={a % 90 === 0 ? 0.9 : 0.4} />
          <path d="M50 50 L54 46 L50 6 Z" fill="currentColor" opacity={a % 90 === 0 ? 0.35 : 0.15} />
        </g>
      ))}
      <circle cx="50" cy="50" r="3.4" fill="currentColor" />
      <circle cx="50" cy="50" r="1.4" fill="var(--color-parchment)" />
      <text x="50" y="19" textAnchor="middle" fontSize="8" fontFamily="Cinzel, serif" fill="currentColor" opacity="0.9">N</text>
    </svg>
  );
}

/* ---------------- fleuron divider ---------------- */

export function Fleuron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 12" className={className} aria-hidden="true">
      <path d="M0 6 H22" stroke="currentColor" strokeWidth="1" />
      <path d="M30 1 L34 6 L30 11 L26 6 Z" fill="currentColor" />
      <circle cx="30" cy="6" r="1.2" fill="var(--color-parchment)" />
      <path d="M38 6 H60" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ---------------- moon phase icon ---------------- */

export function MoonIcon({ phase, size = 16, className = "" }: { phase: number; size?: number; className?: string }) {
  const r = 44;
  const c = 50;
  const rx = Math.max(0.5, Math.abs(Math.cos(2 * Math.PI * phase)) * r);
  const waxing = phase <= 0.5;
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = (phase < 0.25 || phase > 0.75) ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
  const lit = `M ${c} ${c - r} A ${r} ${r} 0 0 ${outerSweep} ${c} ${c + r} A ${rx} ${r} 0 0 ${innerSweep} ${c} ${c - r} Z`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="#3D362B" />
      <path d={lit} fill="#E8D9B0" />
      <circle cx={c} cy={c} r={r} fill="none" stroke="#3D362B" strokeWidth="2" />
    </svg>
  );
}

/* ---------------- weather glyphs ---------------- */

export function WeatherGlyph({ kind, className = "" }: { kind: WeatherKind; className?: string }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 5, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {kind === "sun" && (
        <g>
          <circle cx="24" cy="24" r="9" fill="currentColor" opacity="0.85" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="24" y1="5" x2="24" y2="11" transform={`rotate(${a} 24 24)`} {...s} />
          ))}
        </g>
      )}
      {kind === "cloud" && <path d="M12 34 a8 8 0 1 1 3-15 a11 11 0 0 1 21 3 a7 7 0 0 1 -1 12 Z" fill="currentColor" opacity="0.85" />}
      {kind === "rain" && (
        <g>
          <path d="M12 28 a8 8 0 1 1 3-15 a11 11 0 0 1 21 3 a7 7 0 0 1 -1 12 Z" fill="currentColor" opacity="0.85" />
          <line x1="17" y1="34" x2="15" y2="41" {...s} />
          <line x1="26" y1="34" x2="24" y2="41" {...s} />
          <line x1="35" y1="33" x2="33" y2="40" {...s} />
        </g>
      )}
      {kind === "mist" && (
        <g>
          <path d="M12 24 a8 8 0 1 1 3-14 a11 11 0 0 1 20 3 a7 7 0 0 1 -1 11 Z" fill="currentColor" opacity="0.7" />
          <line x1="10" y1="32" x2="38" y2="32" {...s} />
          <line x1="14" y1="39" x2="34" y2="39" {...s} />
        </g>
      )}
      {kind === "wind" && (
        <g>
          <path d="M6 18 h22 a5 5 0 1 0 -5 -7" {...s} />
          <path d="M6 27 h30 a6 6 0 1 1 -6 8" {...s} />
          <path d="M6 36 h16" {...s} />
        </g>
      )}
    </svg>
  );
}

/* ---------------- elevation sparkline ---------------- */

export function Sparkline({ data, w = 130, h = 34, stroke = "#C05B33" }: { data: number[]; w?: number; h?: number; stroke?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * (w - 4) + 2,
    h - 4 - ((v - min) / span) * (h - 10),
  ]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `2,${h - 2} ${line} ${w - 2},${h - 2}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <polygon points={area} fill={stroke} opacity="0.14" />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={stroke} />
    </svg>
  );
}

/* ---------------- small inline icons (hand-drawn strokes) ---------------- */

const ic = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconDays({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" {...ic} />
      <path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5" {...ic} />
      <path d="M6.5 12h2M11 12h2.5M6.5 14.5h2" {...ic} />
    </svg>
  );
}
export function IconRoute({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="4.5" cy="15.5" r="2" {...ic} />
      <circle cx="15.5" cy="4.5" r="2" {...ic} />
      <path d="M6.2 14.2 C 9 12, 8 9, 10.5 8 S 13.5 6.5, 14.2 6" {...ic} strokeDasharray="2.4 2" />
    </svg>
  );
}
export function IconPeak({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M2.5 16 L8 6.5 L11 11 L13.5 7.5 L17.5 16 Z" {...ic} />
      <path d="M7 9.5 l1 1.2 1.2-1.4" {...ic} />
    </svg>
  );
}
export function IconFork({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M6 3v5a2.5 2.5 0 0 0 5 0V3M8.5 3v14" {...ic} />
      <path d="M14 3c-1.6 1.5-2 4-2 6h2v8M14 3v6" {...ic} />
    </svg>
  );
}
export function IconBed({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M2.5 15.5v-9M2.5 12.5h15v3M2.5 12.5V10a2 2 0 0 1 2-2H9v4.5" {...ic} />
      <circle cx="5.8" cy="9.4" r="1.3" {...ic} />
    </svg>
  );
}
export function IconArrow({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      <path d="M4 12h15M13 5.5 19.5 12 13 18.5" {...ic} />
    </svg>
  );
}
export function IconClose({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" {...ic} strokeWidth={2} />
    </svg>
  );
}
export function IconDownload({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 3v9M6.5 8.5 10 12l3.5-3.5M3.5 15.5h13" {...ic} />
    </svg>
  );
}
export function IconChat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5V14H5.5A2.5 2.5 0 0 1 3 11.5Z" {...ic} />
      <path d="M7 8h6M7 10.5h4" {...ic} />
    </svg>
  );
}

/* ---------------- kicker label ---------------- */

export function Kicker({ children, tone = "bronze" }: { children: ReactNode; tone?: "bronze" | "terra" | "gold" }) {
  const t = tone === "terra" ? "text-terra" : tone === "gold" ? "text-gold" : "text-bronze-2";
  return (
    <p className={`flex items-center gap-3 font-display text-[11px] font-semibold uppercase tracking-[0.34em] ${t}`}>
      <span className="inline-block h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}
