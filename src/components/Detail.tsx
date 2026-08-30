import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ExpeditionPackage } from "../data/expeditions";
import { usd } from "../data/expeditions";
import { FogCanvas, usePrefersReducedMotion } from "./canvas";
import RouteMap from "./RouteMap";
import {
  Reveal, StampButton, Kicker, Fleuron, CompassRose,
  IconDays, IconRoute, IconPeak, IconFork, IconBed, IconArrow, IconClose,
} from "./bits";

gsap.registerPlugin(ScrollTrigger);

interface DetailProps {
  pkg: ExpeditionPackage;
  onBack: () => void;
  onBook: (p: ExpeditionPackage) => void;
  onCollect: (id: string) => void;
  collected: boolean;
}

export default function Detail({ pkg, onBack, onBook, onCollect, collected }: DetailProps) {
  const prm = usePrefersReducedMotion();
  const heroImgRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [idx, setIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [turning, setTurning] = useState(false);
  const timers = useRef<number[]>([]);

  const [activeWp, setActiveWp] = useState<string | null>(pkg.waypoints[0]?.id ?? null);
  const [checked, setChecked] = useState<number[]>(pkg.gear.filter((g) => g.essential).map((_, i) => i));
  const [lightbox, setLightbox] = useState<number | null>(null);

  const chapter = pkg.chapters[displayIdx];

  /* gear defaults: essentials ticked */
  useEffect(() => {
    setChecked(pkg.gear.map((g, i) => (g.essential ? i : -1)).filter((i) => i >= 0));
    setIdx(0);
    setDisplayIdx(0);
    setActiveWp(pkg.waypoints[0]?.id ?? null);
  }, [pkg]);

  /* page turn */
  const go = (n: number) => {
    if (turning || n === idx || n < 0 || n >= pkg.chapters.length) return;
    setTurning(true);
    timers.current.push(
      window.setTimeout(() => {
        setDisplayIdx(n);
        setIdx(n);
        timers.current.push(window.setTimeout(() => setTurning(false), prm ? 30 : 480));
      }, prm ? 30 : 500),
    );
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  /* keyboard paging */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });

  /* hero parallax */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!prm) {
        gsap.to(heroImgRef.current, {
          yPercent: 16,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "70% top", scrub: 0.5 },
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [prm, pkg]);

  /* gear math */
  const totalKg = checked.reduce((s, i) => s + (pkg.gear[i]?.kg ?? 0), 0);
  const essentials = pkg.gear.filter((g) => g.essential).length;
  const essentialsChecked = checked.filter((i) => pkg.gear[i]?.essential).length;
  const readiness = essentials === 0 ? 100 : Math.round((essentialsChecked / essentials) * 100);
  const score = Math.min(100, Math.round(pkg.fitness.elevationGainM / 22));
  const needleDeg = -90 + score * 1.8;

  const photos = pkg.gallery;

  return (
    <div ref={rootRef} className="paper-tint">
      {/* ============ HERO CHAPTER ============ */}
      <section className="relative flex h-[88vh] min-h-[620px] items-end overflow-hidden">
        <div ref={heroImgRef} className="absolute inset-0 -inset-y-[8%]">
          <img src={pkg.image} alt={pkg.title} className="kb-img h-full w-full object-cover" />
        </div>
        <FogCanvas />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/10" />

        <div className="absolute left-5 top-24 z-10 flex items-center gap-3 sm:left-8">
          <button onClick={onBack} className="tab-seal flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-parchment/90 hover:text-parchment">
            <IconArrow flip className="h-4 w-4" /> The Shelf
          </button>
          <span className="h-4 w-px bg-parchment/40" />
          <span className="font-display text-[11px] uppercase tracking-[0.24em] text-parchment/70">{pkg.plateNo} · {pkg.coords}</span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-3xl">
              <p className="flex items-center gap-3 font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
                <CompassRose className="h-8 w-8 text-gold" spin />
                {pkg.region} · {pkg.terrain} · best {pkg.bestSeason}
              </p>
              <h1 className="mt-4 font-display font-black leading-[1.02] text-parchment">
                <span className="mask-line text-4xl sm:text-6xl lg:text-7xl" style={{ "--d": "100ms" } as CSSProperties}>
                  <span>{pkg.title}</span>
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-parchment/85">{pkg.subtitle}</p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {[
                  { ic: <IconDays className="h-4 w-4" />, t: `${pkg.days} days` },
                  { ic: <IconRoute className="h-4 w-4" />, t: `${pkg.distanceKm} km` },
                  { ic: <IconPeak className="h-4 w-4" />, t: `${pkg.elevationGain.toLocaleString()} m ↑` },
                  { ic: null, t: `Party ≤ ${pkg.groupMax}` },
                  { ic: null, t: `${pkg.fitness.level} tempo` },
                ].map((c) => (
                  <span key={c.t} className="flex items-center gap-1.5 border border-parchment/35 bg-ink/25 px-3 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-parchment backdrop-blur-[2px]">
                    {c.ic}{c.t}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full max-w-xs border-[3px] border-double border-gold/70 bg-ink/45 p-5 text-parchment backdrop-blur-[3px]">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Transparent ledger</p>
              <p className="mt-2 font-display text-4xl font-bold">{usd(pkg.price)}<span className="ml-1 text-xs font-medium text-parchment/70">/traveller</span></p>
              <p className="mt-1 text-xs leading-relaxed text-parchment/70">
                {usd(pkg.parkFee)} park fees incl. · {pkg.days} days · group of ≤ {pkg.groupMax}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <StampButton small onClick={() => onBook(pkg)}>Begin the ledger</StampButton>
              </div>
              <p className="mt-3 font-hand text-lg leading-snug text-gold/90">★ {pkg.rating} from {pkg.reviews} field reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CHAPTERS — page-turn spread ============ */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Kicker tone="terra">The Itinerary, bound as chapters</Kicker>
                <h2 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Turn the pages</h2>
              </div>
              <p className="font-hand text-2xl text-ink-2">— arrow keys work too, reader</p>
            </div>
          </Reveal>

          {/* chapter tabs */}
          <div className="mt-12 flex flex-wrap gap-1.5">
            {pkg.chapters.map((c, i) => (
              <button
                key={c.numeral}
                onClick={() => go(i)}
                className={`border border-b-0 px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 sm:px-6 ${
                  i === idx
                    ? "-translate-y-1 bg-terra text-parchment shadow-(--shadow-card)"
                    : "bg-parchment-3 text-ink-2 hover:-translate-y-0.5 hover:bg-parchment-2 hover:text-terra"
                }`}
              >
                Ch. {c.numeral} — {c.title}
              </button>
            ))}
          </div>

          {/* the page */}
          <Reveal delay={80}>
            <div className="page-scene">
              <div className={`page-wrap relative border border-bronze/40 bg-parchment shadow-(--shadow-plate) ${turning ? "" : ""}`}>
                <div className={`page-sheet relative ${turning ? "turning" : ""}`}>
                  <div className="grid lg:grid-cols-2">
                    {/* left leaf */}
                    <div className="relative border-b border-bronze/25 lg:border-b-0 lg:border-r">
                      <div className="relative h-64 overflow-hidden sm:h-80 lg:h-96">
                        <img key={chapter.image + displayIdx} src={chapter.image} alt={chapter.title} className="kb-img h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                        <p className="absolute bottom-3 left-5 font-hand text-2xl text-parchment drop-shadow">{chapter.place}</p>
                        <span className="absolute right-4 top-4 border border-parchment/60 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-parchment/90">
                          {chapter.daysLabel}
                        </span>
                      </div>
                      <div className="p-6 sm:p-8">
                        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-terra">Chapter {chapter.numeral}</p>
                        <h3 className="mt-2 font-display text-3xl font-bold text-ink">{chapter.title}</h3>
                        <p className="mt-4 leading-relaxed text-ink-2">{chapter.narrative}</p>
                        <Fleuron className="mt-6 h-3 w-20 text-bronze/70" />
                        <ul className="mt-5 space-y-2.5">
                          {chapter.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-3 text-sm text-ink-2">
                              <span className="mt-1 inline-block h-2 w-2 flex-none rotate-45 bg-terra" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* right leaf — diary */}
                    <div className="paper-rules relative p-6 sm:p-9 lg:pl-12">
                      <div className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-terra/35 lg:block" />
                      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-bronze-2">Diary of the route</p>
                      <div className="mt-5 space-y-7">
                        {chapter.entries.map((e) => (
                          <article key={e.day} className="group">
                            <div className="flex items-baseline gap-3">
                              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 border-bronze-2 bg-parchment font-display text-sm font-bold text-terra">
                                {e.day}
                              </span>
                              <h4 className="font-display text-lg font-bold text-ink transition-colors group-hover:text-terra">{e.title}</h4>
                            </div>
                            <p className="mt-2 pl-12 text-sm leading-relaxed text-ink-2">{e.story}</p>
                            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 pl-12 text-xs text-ink-3">
                              {e.elevation && <span className="flex items-center gap-1.5"><IconPeak className="h-3.5 w-3.5 text-terra" />{e.elevation}</span>}
                              {e.food && <span className="flex items-center gap-1.5"><IconFork className="h-3.5 w-3.5 text-terra" />{e.food}</span>}
                              {e.lodging && <span className="flex items-center gap-1.5"><IconBed className="h-3.5 w-3.5 text-terra" />{e.lodging}</span>}
                            </div>
                          </article>
                        ))}
                      </div>

                      <button
                        onClick={() => onCollect(pkg.id)}
                        disabled={collected}
                        className={`mt-8 ml-12 border px-4 py-2 font-display text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${
                          collected
                            ? "cursor-default border-canopy/50 bg-canopy/10 text-canopy"
                            : "border-bronze/50 text-ink-2 hover:-translate-y-0.5 hover:border-terra hover:text-terra"
                        }`}
                      >
                        {collected ? "Postcard collected ✓" : "+ Collect a postcard"}
                      </button>
                    </div>
                  </div>
                  <div className="page-shade absolute inset-0" />
                </div>

                {/* spine + footer */}
                <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-ink/10 to-transparent lg:block" />
                <div className="flex items-center justify-between border-t border-bronze/30 px-6 py-3">
                  <button onClick={() => go(idx - 1)} disabled={idx === 0} className="flex items-center gap-2 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2 transition-colors enabled:hover:text-terra disabled:opacity-30">
                    <IconArrow flip className="h-4 w-4" /> Previous
                  </button>
                  <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-bronze-2">
                    Plate {idx + 1} of {pkg.chapters.length}
                  </p>
                  <button onClick={() => go(idx + 1)} disabled={idx === pkg.chapters.length - 1} className="flex items-center gap-2 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2 transition-colors enabled:hover:text-terra disabled:opacity-30">
                    Turn the page <IconArrow className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ ROUTE MAP ============ */}
      <section className="relative border-y border-bronze/25 bg-parchment-2/60 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <RouteMap
            waypoints={pkg.waypoints}
            title="Unfold the route"
            subtitle={`${pkg.waypoints.length} waypoints stitched by ${pkg.distanceKm} km of trail, rail and tank bund. Each pin answers with its elevation, its weather and one piece of field folklore.`}
            activeId={activeWp}
            onSelect={(id) => setActiveWp(id || null)}
          />
        </div>
      </section>

      {/* ============ GEAR & FITNESS ============ */}
      <section className="paper-rules py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker>Kit & Constitution</Kicker>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold text-ink sm:text-5xl">
              The packing ledger
            </h2>
            <p className="mt-4 max-w-2xl font-hand text-2xl text-ink-2">— tick what's in your pack; the quartermaster does the arithmetic</p>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* fitness gauge */}
            <Reveal dir="left">
              <div className="border border-bronze/40 bg-parchment p-7 shadow-(--shadow-card)">
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze-2">Difficulty score</p>
                <div className="relative mx-auto mt-6 w-52">
                  <svg viewBox="0 0 200 110" className="w-full">
                    <path d="M 12 100 A 88 88 0 0 1 188 100" fill="none" stroke="#E8DFC8" strokeWidth="13" strokeLinecap="round" />
                    <path d="M 12 100 A 88 88 0 0 1 188 100" fill="none" stroke="#1E4D38" strokeWidth="13" strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 276} 276`} />
                    <g className="needle" style={{ transform: `rotate(${needleDeg}deg)` }}>
                      <line x1="100" y1="100" x2="100" y2="26" stroke="#C05B33" strokeWidth="3.5" strokeLinecap="round" />
                    </g>
                    <circle cx="100" cy="100" r="7" fill="#C05B33" />
                    <circle cx="100" cy="100" r="2.6" fill="#FDFBF7" />
                  </svg>
                  <p className="mt-2 text-center font-display text-4xl font-black text-ink">{score}<span className="text-lg text-ink-3">/100</span></p>
                </div>
                <p className="mt-4 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-terra">
                  {pkg.fitness.level} · {pkg.fitness.elevationGainM.toLocaleString()} m elevation gain
                </p>
                <p className="mt-2 text-center text-sm text-ink-2">{pkg.fitness.dailyHours}</p>
                <p className="mt-4 border-t border-dashed border-bronze/40 pt-4 text-center font-hand text-xl leading-snug text-ink-2">
                  “{pkg.fitness.note}”
                </p>
              </div>
            </Reveal>

            {/* checklist */}
            <Reveal delay={100}>
              <div className="flex h-full flex-col border border-bronze/40 bg-parchment p-7 shadow-(--shadow-card)">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze-2">Manifest</p>
                  <p className="font-display text-sm font-bold text-terra">{totalKg.toFixed(1)} kg packed</p>
                </div>
                <ul className="mt-4 flex-1 divide-y divide-bronze/15">
                  {pkg.gear.map((g, i) => (
                    <li key={g.name}>
                      <label className="group flex cursor-pointer items-center gap-3 py-2.5">
                        <input
                          type="checkbox"
                          className="inkbox"
                          checked={checked.includes(i)}
                          onChange={() => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))}
                        />
                        <span className={`flex-1 text-sm transition-colors ${checked.includes(i) ? "text-ink line-through decoration-terra/60" : "text-ink-2 group-hover:text-ink"}`}>
                          {g.name}
                          {g.essential && <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.18em] text-terra">essential</span>}
                        </span>
                        <span className="font-display text-xs text-ink-3">{g.kg} kg</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-bronze/30 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-semibold uppercase tracking-[0.2em] text-ink-2">Pack readiness</span>
                    <span className="font-display font-bold text-canopy">{readiness}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-parchment-3">
                    <div className="h-full bg-gradient-to-r from-canopy to-bronze transition-all duration-700" style={{ width: `${readiness}%` }} />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* included */}
            <Reveal dir="right" delay={150}>
              <div className="flex h-full flex-col border border-bronze/40 bg-canopy-3 p-7 text-parchment shadow-(--shadow-card)">
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Bound into the price</p>
                <ul className="mt-5 flex-1 space-y-3.5">
                  {pkg.included.map((x) => (
                    <li key={x} className="flex items-start gap-3 text-sm leading-relaxed text-parchment/85">
                      <span className="mt-1.5 inline-block h-2 w-2 flex-none rotate-45 bg-gold" />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-parchment/15 pt-5">
                  <p className="font-hand text-xl leading-snug text-gold/90">
                    No riddles in the ledger — park fees, permits and the naturalist are already inside the figure.
                  </p>
                  <div className="mt-5">
                    <StampButton tone="gold" onClick={() => onBook(pkg)}>Bind this chapter</StampButton>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ MARGINALIA ============ */}
      <section className="overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker>Marginalia</Kicker>
            <h2 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Notes from the field</h2>
          </Reveal>
        </div>
        <div className="mt-10 flex snap-x gap-7 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-[max(1.25rem,calc((100vw-80rem)/2+2rem))]">
          {pkg.culturalNotes.map((n, i) => (
            <figure
              key={n.title}
              className="tape w-80 flex-none snap-start border border-bronze/40 bg-parchment-2 p-6 shadow-(--shadow-card)"
              style={{ transform: `rotate(${i % 2 === 0 ? -1.6 : 1.4}deg)` }}
            >
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-terra">{n.title}</p>
              <blockquote className="mt-3 font-hand text-[22px] leading-snug text-ink">“{n.text}”</blockquote>
              <figcaption className="mt-3 border-t border-dashed border-bronze/40 pt-2 text-xs text-ink-3">— {n.source}</figcaption>
            </figure>
          ))}
          <figure className="flex w-64 flex-none snap-start items-center justify-center border-2 border-dashed border-bronze/40 p-6">
            <p className="text-center font-hand text-2xl text-ink-3">your note goes here —<br />the journal leaves room</p>
          </figure>
        </div>
      </section>

      {/* ============ FIELD ARCHIVE ============ */}
      <section className="border-t border-bronze/25 bg-parchment-2/60 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Kicker>From the field archive</Kicker>
                <h2 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Plates & exposures</h2>
              </div>
              <p className="font-hand text-2xl text-ink-2">— click a plate to hold it up to the light</p>
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-12">
            {photos.map((src, i) => (
              <Reveal key={src + i} delay={i * 90} className={i % 3 === 1 ? "sm:col-span-7" : "sm:col-span-5"}>
                <button
                  onClick={() => setLightbox(i)}
                  className="postcard group block w-full border-[6px] border-parchment bg-parchment shadow-(--shadow-card)"
                  style={{ transform: `rotate(${[-1.2, 1, -0.8, 1.4][i % 4]}deg)` }}
                >
                  <div className="overflow-hidden">
                    <img src={src} alt={`${pkg.title} — plate ${i + 1}`} className="kb-hover aspect-[16/10] w-full object-cover" loading="lazy" />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CLOSING LEDGER BAND ============ */}
      <section className="relative overflow-hidden bg-ink py-20 text-parchment">
        <FogCanvas tint="dark" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 sm:px-8">
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">The final page</p>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              {usd(pkg.price)} <span className="text-xl font-medium text-parchment/60">per traveller · {pkg.days} days · ledger transparent</span>
            </h2>
            <p className="mt-2 font-hand text-2xl text-gold/90">bind it tonight — the {pkg.bestSeason.toLowerCase()} window fills fast</p>
          </div>
          <StampButton onClick={() => onBook(pkg)}>Begin the ledger</StampButton>
        </div>
      </section>

      {/* lightbox */}
      {lightbox !== null && (
        <button
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/92 p-5 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          aria-label="Close plate viewer"
        >
          <div className="relative max-w-4xl border-[10px] border-parchment shadow-(--shadow-plate)">
            <img src={photos[lightbox]} alt="" className="max-h-[82vh] w-auto object-contain" />
            <span className="absolute -top-4 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-terra text-parchment">
              <IconClose className="h-5 w-5" />
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
