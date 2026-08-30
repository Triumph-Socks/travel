import { useState } from "react";
import type { Waypoint } from "../data/expeditions";
import { Reveal, Sparkline, WeatherGlyph, CompassRose, Kicker } from "./bits";

const ISLAND =
  "M 198 20 C 220 30 236 48 250 72 C 266 98 284 118 298 148 C 314 182 306 216 312 250 C 318 288 308 324 294 356 C 282 386 272 420 248 448 C 228 472 214 494 190 500 C 166 506 150 486 136 464 C 120 438 108 410 100 378 C 92 344 90 308 94 272 C 98 238 92 204 102 172 C 112 140 126 112 144 88 C 160 64 178 40 198 20 Z";

export default function RouteMap({
  waypoints, title, subtitle, activeId, onSelect,
}: {
  waypoints: Waypoint[];
  title: string;
  subtitle: string;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const shown = hover ?? activeId;
  const active = waypoints.find((w) => w.id === shown) ?? null;

  const toX = (x: number) => x * 4;
  const toY = (y: number) => y * 5.2;

  const routePts = waypoints.map((w) => `${toX(w.x)},${toY(w.y)}`).join(" ");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
      {/* left: narrative + waypoint index */}
      <Reveal dir="left">
        <div className="lg:sticky lg:top-28">
          <Kicker>The Route Plate</Kicker>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-ink sm:text-5xl">{title}</h2>
          <p className="mt-5 max-w-md leading-relaxed text-ink-2">{subtitle}</p>

          <ul className="mt-8 divide-y divide-bronze/25 border-y border-bronze/25">
            {waypoints.map((w, i) => (
              <li key={w.id}>
                <button
                  onClick={() => onSelect(w.id === activeId ? "" : w.id)}
                  onMouseEnter={() => setHover(w.id)}
                  onMouseLeave={() => setHover(null)}
                  className={`group flex w-full items-center gap-4 px-2 py-3.5 text-left transition-colors duration-300 ${
                    shown === w.id ? "bg-terra/8" : "hover:bg-bronze/10"
                  }`}
                >
                  <span className={`font-display text-sm font-bold ${shown === w.id ? "text-terra" : "text-bronze-2"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className={`block font-display text-[15px] font-semibold tracking-wide ${shown === w.id ? "text-terra" : "text-ink"}`}>
                      {w.name}
                    </span>
                    <span className="block text-xs text-ink-3">{w.elevation} · {w.weather.tempC}°C · {w.weather.condition}</span>
                  </span>
                  <WeatherGlyph kind={w.weather.kind} className={`h-6 w-6 ${shown === w.id ? "text-terra" : "text-bronze-2"}`} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-hand text-xl text-terra-2">— hover the pins, the plate answers back</p>
        </div>
      </Reveal>

      {/* right: the plate itself */}
      <Reveal dir="right" delay={120}>
        <div className="relative border-[3px] border-double border-bronze-2/70 bg-parchment-2 p-3 shadow-(--shadow-plate) sm:p-5">
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-bronze-2">
            <CompassRose className="h-8 w-8 text-terra" spin />
            Plate surveyed by hand
          </div>
          <div className="pointer-events-none absolute bottom-3 right-4 z-10 font-hand text-lg text-ink-2">
            scale — one palm to a league
          </div>

          <div className="relative">
            <svg viewBox="0 0 400 520" className="w-full" role="img" aria-label="Hand-drawn route map">
              {/* graticule */}
              {[66, 133, 200, 266, 333].map((x) => (
                <line key={`gx${x}`} x1={x} y1="10" x2={x} y2="510" stroke="#A5824B" strokeOpacity="0.14" strokeDasharray="2 7" />
              ))}
              {[86, 173, 260, 346, 433].map((y) => (
                <line key={`gy${y}`} x1="8" y1={y} x2="392" y2={y} stroke="#A5824B" strokeOpacity="0.14" strokeDasharray="2 7" />
              ))}

              {/* island + contours */}
              <path d={ISLAND} transform="translate(61 79) scale(0.70)" fill="none" stroke="#A5824B" strokeOpacity="0.22" strokeWidth="1" />
              <path d={ISLAND} transform="translate(30 39) scale(0.85)" fill="none" stroke="#A5824B" strokeOpacity="0.3" strokeWidth="1" />
              <path d={ISLAND} fill="#F1E7D2" stroke="#7C5F33" strokeWidth="2.2" />
              {/* hatch coast */}
              <path d={ISLAND} fill="none" stroke="#7C5F33" strokeWidth="6" strokeOpacity="0.12" />

              {/* sea squiggles */}
              {[[40, 120], [52, 300], [330, 180], [340, 360], [300, 470], [70, 460]].map(([x, y], i) => (
                <path key={i} d={`M ${x} ${y} q 6 -6 12 0 q 6 6 12 0`} fill="none" stroke="#A5824B" strokeOpacity="0.35" strokeWidth="1.2" />
              ))}

              {/* route */}
              <polyline
                points={routePts}
                fill="none"
                stroke="#C05B33"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                className="draw-line"
                strokeDasharray="1"
              />

              {/* pins */}
              {waypoints.map((w, i) => {
                const cx = toX(w.x);
                const cy = toY(w.y);
                const hot = shown === w.id;
                return (
                  <g
                    key={w.id}
                    transform={`translate(${cx} ${cy})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHover(w.id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onSelect(w.id === activeId ? "" : w.id)}
                  >
                    <circle r="14" fill="transparent" />
                    <circle
                      r="5.5"
                      className="pulse-ring"
                      fill="none"
                      stroke={hot ? "#C05B33" : "#A5824B"}
                      strokeWidth="1.4"
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    />
                    <circle r={hot ? 6.5 : 4.6} fill={hot ? "#C05B33" : "#FDFBF7"} stroke={hot ? "#7C2F14" : "#C05B33"} strokeWidth="2" />
                    <text
                      y="-11"
                      textAnchor="middle"
                      fontFamily="Cinzel, serif"
                      fontSize="11"
                      fontWeight="700"
                      fill={hot ? "#9A4526" : "#57503F"}
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* tooltip card */}
            {active && (
              <div
                className="pointer-events-none absolute z-20 w-60 border border-bronze-2/50 bg-parchment shadow-(--shadow-card)"
                style={{
                  left: `${Math.min(Math.max(active.x, 24), 74)}%`,
                  top: `${Math.max(active.y - 6, 2)}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="relative h-24 overflow-hidden">
                  <img src={active.photo} alt={active.name} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-canopy-3/60 to-transparent" />
                  <p className="absolute bottom-1.5 left-2.5 font-display text-sm font-bold text-parchment drop-shadow">{active.name}</p>
                </div>
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between text-xs text-ink-2">
                    <span className="font-semibold text-ink">▲ {active.elevation}</span>
                    <span className="flex items-center gap-1.5">
                      <WeatherGlyph kind={active.weather.kind} className="h-4.5 w-4.5 text-bronze-2" />
                      {active.weather.tempC}°C {active.weather.condition}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 font-display text-[9px] font-semibold uppercase tracking-[0.24em] text-bronze-2">Elevation profile</p>
                    <Sparkline data={active.profile} />
                  </div>
                  <p className="border-t border-bronze/25 pt-2 font-hand text-[17px] leading-snug text-ink-2">{active.culturalNote}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
