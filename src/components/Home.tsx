import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  EXPEDITIONS, usd, byId, moonPhase, phaseName,
  type Booking, type ExpeditionPackage, type Terrain, type Vibe,
} from "../data/expeditions";
import { GlobeCanvas, FogCanvas, usePrefersReducedMotion } from "./canvas";
import {
  Reveal, CountUp, StampButton, CompassRose, Kicker, Fleuron,
  IconDays, IconRoute, IconPeak, IconDownload, IconChat, MoonIcon,
} from "./bits";

gsap.registerPlugin(ScrollTrigger);

/* ---------------- field guide generator ---------------- */

function fieldGuideHtml(b: Booking, pkg: ExpeditionPackage): string {
  const days = pkg.chapters
    .map((c) => `<h2>Chapter ${c.numeral} — ${c.title} <small>(${c.place}, ${c.daysLabel})</small></h2>
      <p><em>${c.narrative}</em></p>
      <ul>${c.entries.map((e) => `<li><strong>Day ${e.day} · ${e.title}</strong> — ${e.story}${e.food ? ` <em>Table: ${e.food}.</em>` : ""}${e.lodging ? ` <em>Beds: ${e.lodging}.</em>` : ""}</li>`).join("")}</ul>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Aetheria Field Guide — ${pkg.title}</title>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 24px;color:#2B2620;line-height:1.65}
  h1{font-variant:small-caps;letter-spacing:.06em;border-bottom:2px solid #A5824B;padding-bottom:12px}
  h2{color:#9A4526;margin-top:36px}small{color:#7C5F33;font-weight:normal}
  .meta{display:flex;gap:24px;flex-wrap:wrap;color:#57503F}</style></head><body>
  <h1>Aetheria Expeditions — Field Guide</h1>
  <p class="meta"><span><strong>Booking</strong> ${b.ref}</span><span><strong>Route</strong> ${pkg.title}</span>
  <span><strong>Dates</strong> ${b.start} → ${b.end} (${b.nights} nights)</span><span><strong>Party</strong> ${b.guests} travellers</span>
  <span><strong>Ledger</strong> ${usd(b.total)}</span></p>
  <p>${pkg.subtitle}. ${pkg.days} days · ${pkg.distanceKm} km · ${pkg.elevationGain.toLocaleString()} m of ascent. Best season: ${pkg.bestSeason}.</p>
  ${days}
  <h2>Packing manifest</h2><ul>${pkg.gear.map((g) => `<li>${g.name} — ${g.kg} kg${g.essential ? " (essential)" : ""}</li>`).join("")}</ul>
  <p style="margin-top:48px;color:#7C5F33"><em>Charted by hand · Aetheria Expeditions · Vol. VII</em></p>
  </body></html>`;
}

function downloadGuide(b: Booking) {
  const pkg = byId(b.pkgId);
  if (!pkg) return;
  const blob = new Blob([fieldGuideHtml(b, pkg)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aetheria-field-guide-${b.ref}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

const WA = "94771838383";

/* ---------------- component ---------------- */

interface HomeProps {
  onOpen: (id: string) => void;
  onBook: (p: ExpeditionPackage) => void;
  bookings: Booking[];
  postcards: string[];
  onRemoveBooking: (ref: string) => void;
  ambienceOn: boolean;
  onToggleAmbience: () => void;
}

const TERRAINS: (Terrain | "All")[] = ["All", "Highlands", "Coastal", "Jungle"];
const VIBES: (Vibe | "All")[] = ["All", "Ancient History", "Adrenaline", "Eco-Luxury", "Wildlife"];
const DURS = [
  { id: "any", label: "Any length" },
  { id: "short", label: "Up to 5 days" },
  { id: "long", label: "6+ days" },
] as const;

export default function Home({ onOpen, onBook, bookings, postcards, onRemoveBooking, ambienceOn, onToggleAmbience }: HomeProps) {
  const prm = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [terrain, setTerrain] = useState<(typeof TERRAINS)[number]>("All");
  const [vibe, setVibe] = useState<(typeof VIBES)[number]>("All");
  const [dur, setDur] = useState<string>("any");

  const tonight = phaseName(moonPhase(new Date()));

  const filtered = useMemo(
    () =>
      EXPEDITIONS.filter((p) => {
        if (terrain !== "All" && p.terrain !== terrain) return false;
        if (vibe !== "All" && !p.vibes.includes(vibe)) return false;
        if (dur === "short" && p.days > 5) return false;
        if (dur === "long" && p.days < 6) return false;
        return true;
      }),
    [terrain, vibe, dur],
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!prm) {
        gsap.from(".h-fade", { opacity: 0, y: 26, stagger: 0.09, duration: 1, ease: "power3.out", delay: 0.45 });
        gsap.to(".hero-plate", {
          yPercent: 11,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      }
    }, heroRef);
    return () => ctx.revert();
  }, [prm]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: prm ? "auto" : "smooth", block: "start" });

  const ticker = [
    "07°57′N 80°45′E — SIGIRIYA · LION ROCK 370 M",
    "06°52′N 81°03′E — NINE ARCH VIADUCT · 950 M",
    "06°25′N 81°31′E — YALA BLOCK ONE · LEOPARD TERRITORIES",
    "06°01′N 80°13′E — GALLE RAMPARTS · DUTCH BASTIONS",
    `${tonight.toUpperCase()} TONIGHT OVER THE ISLE`,
    "MONSOON WINDOW DEC–APR · CHARTS UPDATED WEEKLY",
    "22 WAYPOINTS · 4 ROUTES · ONE RESPLENDENT ISLE",
  ];

  const rotations = [-1.4, 1.2, -0.9, 1.6];

  return (
    <div>
      {/* ================= HERO — the journal cover ================= */}
      <section ref={heroRef} className="paper-tint relative overflow-hidden">
        <FogCanvas />
        <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-24">
          {/* left page */}
          <div className="lg:col-span-7">
            <p className="h-fade flex items-center gap-3 font-display text-[11px] font-semibold uppercase tracking-[0.34em] text-bronze-2">
              <CompassRose className="h-9 w-9 text-terra" spin />
              Field Journal · Volume VII · The Resplendent Isle
            </p>

            <h1 className="mt-6 font-display font-black leading-[0.98] text-ink">
              <span className="mask-line text-[13.5vw] sm:text-7xl lg:text-[5.6rem]" style={{ "--d": "120ms" } as CSSProperties}>
                <span>AETHERIA</span>
              </span>
              <span className="mask-line text-[13.5vw] sm:text-7xl lg:text-[5.6rem]" style={{ "--d": "260ms" } as CSSProperties}>
                <span>
                  EXPEDITION<span className="text-terra">S</span>
                </span>
              </span>
            </h1>
            <div className="ink-draw mt-5 h-[3px] w-44 bg-terra" style={{ "--d": "900ms" } as CSSProperties} />

            <p className="h-fade relative mt-7 max-w-xl text-lg leading-relaxed text-ink-2">
              Four hand-scouted routes across an island that keeps its promises — lion rock, cloud forest,
              leopard wilds and a fortress coast. Bound into chapters, priced without riddles,
              and walked with naturalists born on the trail.
              <span className="absolute -right-6 -top-7 hidden rotate-6 font-hand text-2xl text-terra sm:block lg:-right-16">
                — an atlas of slow adventures
              </span>
            </p>

            <div className="h-fade mt-9 flex flex-wrap gap-4">
              <StampButton onClick={() => scrollTo("shelf")}>Open the Shelf ↓</StampButton>
              <button
                onClick={() => onOpen("sigiriya")}
                className="tab-seal font-display text-xs font-semibold uppercase tracking-[0.22em] text-ink-2 transition-colors hover:text-terra"
              >
                Unfold the first map
              </button>
            </div>

            <div className="h-fade mt-12 grid max-w-xl grid-cols-2 gap-y-6 border-t border-bronze/30 pt-7 sm:grid-cols-4">
              {[
                { n: 4, s: "", l: "Charted routes", dec: 0 },
                { n: 22, s: "", l: "Story waypoints", dec: 0 },
                { n: 3370, s: " m", l: "Cumulative ascent", dec: 0 },
                { n: 4.9, s: "★", l: "Field rating", dec: 1 },
              ].map((x) => (
                <div key={x.l}>
                  <p className="font-display text-3xl font-bold text-ink">
                    <CountUp to={x.n} suffix={x.s} decimals={x.dec ?? 0} />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink-3">{x.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right plate — the globe */}
          <div className="hero-plate lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              <div className="relative border-[3px] border-double border-bronze-2/80 bg-parchment-2/70 p-2 shadow-(--shadow-plate)">
                <div className="relative aspect-square overflow-hidden border border-bronze/40">
                  <GlobeCanvas />
                  <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-bronze-2" />
                  <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-bronze-2" />
                  <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-bronze-2" />
                  <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-bronze-2" />
                </div>
                <div className="flex items-center justify-between px-2 py-2.5">
                  <p className="font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-bronze-2">
                    Plate 07 · Survey of the Isle
                  </p>
                  <p className="font-hand text-lg text-terra-2">drawn by candlelight</p>
                </div>
              </div>
              <span className="stamp-in floaty absolute -right-3 -top-5 block rotate-[-8deg] border-2 border-seal px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-seal/90 sm:-right-8" style={{ "--r": "-8deg" } as CSSProperties}>
                Verified · MMXXVI
              </span>
              <CompassRose className="spin-slower absolute -bottom-10 -left-6 hidden h-24 w-24 text-bronze/60 sm:block" />
            </div>
          </div>
        </div>

        {/* ambience toggle */}
        <button
          onClick={onToggleAmbience}
          aria-pressed={ambienceOn}
          className={`absolute bottom-20 right-5 z-10 flex items-center gap-2.5 border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 sm:bottom-24 sm:right-8 ${
            ambienceOn
              ? "border-canopy bg-canopy text-parchment shadow-(--shadow-card)"
              : "border-bronze/50 bg-parchment/80 text-ink-2 hover:border-canopy hover:text-canopy"
          }`}
        >
          <span className="flex h-3.5 items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-[3px] ${ambienceOn ? "eq-bar bg-gold" : "bg-bronze/60"}`}
                style={{ height: `${[60, 100, 45, 80][i]}%`, animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
          {ambienceOn ? "Isle ambience · on" : "Wind & birdsong"}
        </button>

        {/* ticker */}
        <div className="relative border-y-2 border-ink/80 bg-ink py-3 text-parchment">
          <div className="overflow-hidden">
            <div className="marquee-track flex w-max items-center">
              {[0, 1].map((k) => (
                <div key={k} className="flex items-center" aria-hidden={k === 1}>
                  {ticker.map((t) => (
                    <span key={t + k} className="flex items-center font-display text-[11px] font-medium tracking-[0.24em]">
                      <span className="px-6">{t}</span>
                      <span className="inline-block h-1.5 w-1.5 rotate-45 bg-terra" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= THE SHELF ================= */}
      <section id="shelf" className="paper-rules relative py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker>The Expedition Shelf</Kicker>
                <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-6xl">
                  Choose your <span className="text-terra">chapter</span>
                </h2>
              </div>
              <p className="max-w-xs font-hand text-2xl leading-snug text-ink-2">
                filter by terrain, by mood, by the days you can spare —
                <span className="text-terra"> the shelf answers honestly</span>
              </p>
            </div>
          </Reveal>

          {/* filters */}
          <Reveal delay={100}>
            <div className="mt-10 grid gap-5 border-y border-bronze/30 py-6 md:grid-cols-3">
              {[
                { label: "By terrain", opts: TERRAINS as readonly string[], labels: TERRAINS as readonly string[], val: terrain, set: (v: string) => setTerrain(v as typeof terrain) },
                { label: "By vibe", opts: VIBES as readonly string[], labels: VIBES as readonly string[], val: vibe, set: (v: string) => setVibe(v as typeof vibe) },
                { label: "By duration", opts: DURS.map((d) => d.id as string), labels: DURS.map((d) => d.label as string), val: dur, set: setDur },
              ].map((g) => (
                <div key={g.label}>
                  <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-bronze-2">{g.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {g.opts.map((o, i) => (
                      <button
                        key={o}
                        onClick={() => g.set(o)}
                        className={`border px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
                          g.val === o
                            ? "-rotate-1 border-ink bg-ink text-parchment shadow-(--shadow-card)"
                            : "border-bronze/40 text-ink-2 hover:-translate-y-0.5 hover:border-terra hover:text-terra"
                        }`}
                      >
                        {g.labels ? g.labels[i] : o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <p className="mt-6 font-display text-[11px] uppercase tracking-[0.28em] text-ink-3" aria-live="polite">
            Showing {filtered.length} of {EXPEDITIONS.length} routes
          </p>

          {/* postcards */}
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-12">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                const span = i % 4 === 0 || i % 4 === 3 ? "md:col-span-7" : "md:col-span-5";
                const offset = i === 1 || i === 2 ? "md:mt-10" : "";
                return (
                  <motion.article
                    layout
                    key={p.id}
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`${span} ${offset}`}
                  >
                    <div
                      className="postcard tape group relative cursor-pointer border border-bronze/35 bg-parchment shadow-(--shadow-card)"
                      style={{ transform: `rotate(${rotations[i % 4]}deg)` }}
                      onClick={() => onOpen(p.id)}
                    >
                      <div className={`relative overflow-hidden ${i % 4 === 0 || i % 4 === 3 ? "h-72 sm:h-80" : "h-60 sm:h-64"}`}>
                        <img src={p.image} alt={p.title} className="kb-hover h-full w-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                        <span className="absolute left-4 top-4 -rotate-6 border-2 border-parchment/70 bg-ink/35 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-parchment backdrop-blur-[2px]">
                          {p.plateNo} · {p.stampText}
                        </span>
                        <span className="absolute right-4 top-4 bg-canopy-2/90 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-parchment">
                          {p.terrain}
                        </span>
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                          <p className="font-hand text-2xl text-parchment drop-shadow">{p.coords}</p>
                          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-parchment/85">
                            {p.bestSeason}
                          </p>
                        </div>
                      </div>

                      <div className="p-6">
                        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-bronze-2">{p.region}</p>
                        <h3 className="mt-2 font-display text-2xl font-bold leading-snug text-ink transition-colors group-hover:text-terra sm:text-[1.7rem]">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.subtitle}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-2">
                          <span className="flex items-center gap-1.5 text-sm"><IconDays className="h-4.5 w-4.5 text-terra" />{p.days} days</span>
                          <span className="flex items-center gap-1.5 text-sm"><IconRoute className="h-4.5 w-4.5 text-terra" />{p.distanceKm} km</span>
                          <span className="flex items-center gap-1.5 text-sm"><IconPeak className="h-4.5 w-4.5 text-terra" />{p.elevationGain.toLocaleString()} m ↑</span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {p.vibes.map((v) => (
                            <span key={v} className="border border-bronze/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-bronze-2">{v}</span>
                          ))}
                        </div>

                        <div className="mt-6 flex items-end justify-between border-t border-dashed border-bronze/40 pt-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-ink-3">from</p>
                            <p className="font-display text-3xl font-bold text-ink">{usd(p.price)}<span className="ml-1 text-xs font-medium text-ink-3">/traveller</span></p>
                            <p className="mt-0.5 font-hand text-lg text-terra-2">★ {p.rating} — {p.reviews} field reports</p>
                          </div>
                          <StampButton small tone="ink" onClick={() => onOpen(p.id)}>Open Chapter</StampButton>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="mx-auto mt-10 max-w-lg border-2 border-dashed border-bronze/50 bg-parchment-2 p-10 text-center">
              <CompassRose className="mx-auto h-14 w-14 text-bronze/70" />
              <p className="mt-4 font-hand text-2xl text-ink-2">
                No route answers to that combination — loosen a filter or two, traveller.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================= HOUSE METHOD ================= */}
      <section id="method" className="relative overflow-hidden bg-canopy-3 py-24 text-parchment sm:py-28">
        <FogCanvas tint="dark" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal dir="left" className="lg:col-span-5">
              <Kicker tone="gold">The House Method</Kicker>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
                How a chapter <span className="text-gold">unfolds</span>
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-parchment/75">
                We are not a booking matrix. Aetheria works the way an expedition journal does —
                you choose a route, we bind the ledger, and the island does the rest.
              </p>
              <Fleuron className="mt-8 h-4 w-24 text-gold/70" />
            </Reveal>
            <div className="lg:col-span-7">
              {[
                { n: "01", t: "Choose your route", d: "Read the shelf like a book spines-up. Every postcard lists its terrain, its tempo and its price — no riddles, no 'contact us for rates'." },
                { n: "02", t: "Bind the ledger", d: "Open the booking drawer, pick your dates under the actual moon, add a dawn balloon if your courage holds, and watch the ledger total itself — transparent to the last rupee." },
                { n: "03", t: "Walk the chapter", d: "A naturalist born on the trail takes the first page. You keep the hand-bound journal; we keep the promise that the waypoints were real." },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 120}>
                  <div className={`group flex gap-6 border-t border-parchment/15 py-8 transition-colors hover:bg-parchment/[0.04] sm:gap-10 ${i === 1 ? "lg:ml-10" : ""}`}>
                    <span className="font-display text-6xl font-black leading-none text-gold/25 transition-colors group-hover:text-gold/60 sm:text-7xl">{s.n}</span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-parchment sm:text-2xl">{s.t}</h3>
                      <p className="mt-2 max-w-lg leading-relaxed text-parchment/70">{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= MEMORY VAULT ================= */}
      <section id="vault" className="paper-tint relative py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker>User Memory Vault</Kicker>
                <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-6xl">
                  The Memory <span className="text-terra">Vault</span>
                </h2>
              </div>
              <p className="max-w-xs text-right font-hand text-2xl leading-snug text-ink-2">
                {bookings.length > 0 ? "your bound journals, kept safe on this shelf" : "journals you bind will rest here"}
              </p>
            </div>
          </Reveal>

          {bookings.length === 0 ? (
            <Reveal delay={120}>
              <div className="mt-12 flex flex-col items-center gap-4 border-2 border-dashed border-bronze/50 bg-parchment-2/70 px-8 py-16 text-center">
                <CompassRose className="h-16 w-16 text-bronze/60" spin />
                <p className="max-w-md font-hand text-2xl leading-snug text-ink-2">
                  The vault is empty — for now. Bind a chapter above and your journal,
                  field guide and concierge line will appear on this shelf.
                </p>
                <StampButton small tone="ink" onClick={() => scrollTo("shelf")}>Back to the shelf</StampButton>
              </div>
            </Reveal>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {bookings.map((b, i) => {
                const pkg = byId(b.pkgId);
                if (!pkg) return null;
                return (
                  <Reveal key={b.ref} delay={i * 100}>
                    <article className="postcard flex overflow-hidden border border-bronze/40 bg-parchment shadow-(--shadow-card)" style={{ transform: `rotate(${i % 2 === 0 ? -0.7 : 0.8}deg)` }}>
                      <div className="relative w-32 flex-none sm:w-40">
                        <img src={pkg.image} alt={pkg.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                        <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-ink/45 to-transparent" />
                        <span className="absolute left-2 top-3 -rotate-90 whitespace-nowrap font-display text-[9px] font-bold uppercase tracking-[0.3em] text-parchment/90">
                          Bound · {b.ref}
                        </span>
                      </div>
                      <div className="flex-1 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze-2">{pkg.plateNo} · {pkg.region}</p>
                            <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink">{pkg.title}</h3>
                          </div>
                          <span className="stamp-in mt-1 flex-none border-2 border-canopy px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.2em] text-canopy">
                            Confirmed
                          </span>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-ink-2">
                          <div><dt className="text-[10px] uppercase tracking-[0.2em] text-ink-3">Departure</dt><dd className="font-medium text-ink">{b.start}</dd></div>
                          <div><dt className="text-[10px] uppercase tracking-[0.2em] text-ink-3">Return</dt><dd className="font-medium text-ink">{b.end}</dd></div>
                          <div><dt className="text-[10px] uppercase tracking-[0.2em] text-ink-3">Party</dt><dd className="font-medium text-ink">{b.guests} travellers · {b.nights} nights</dd></div>
                          <div><dt className="text-[10px] uppercase tracking-[0.2em] text-ink-3">Ledger</dt><dd className="font-display font-bold text-terra">{usd(b.total)}</dd></div>
                        </dl>
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-dashed border-bronze/40 pt-4">
                          <button onClick={() => downloadGuide(b)} className="flex items-center gap-1.5 border border-bronze/50 px-3 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-2 transition-all hover:-translate-y-0.5 hover:border-canopy hover:text-canopy">
                            <IconDownload className="h-3.5 w-3.5" /> Field guide
                          </button>
                          <a
                            href={`https://wa.me/${WA}?text=${encodeURIComponent(`Aetheria concierge — booking ${b.ref} (${pkg.title}), departing ${b.start}. `)}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 border border-bronze/50 px-3 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-2 transition-all hover:-translate-y-0.5 hover:border-canopy hover:text-canopy"
                          >
                            <IconChat className="h-3.5 w-3.5" /> Concierge
                          </a>
                          <button onClick={() => onRemoveBooking(b.ref)} className="ml-auto border border-transparent px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3 transition-colors hover:text-seal">
                            Unbind
                          </button>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* collected postcards */}
          {postcards.length > 0 && (
            <Reveal delay={150}>
              <div className="mt-16">
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-bronze-2">Collected postcards</p>
                <div className="mt-5 flex flex-wrap gap-5">
                  {postcards.map((id, i) => {
                    const pkg = byId(id);
                    if (!pkg) return null;
                    return (
                      <button
                        key={id + i}
                        onClick={() => onOpen(id)}
                        className="postcard tape group relative w-44 border border-bronze/40 bg-parchment p-2 pb-3 text-left shadow-(--shadow-card)"
                        style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (1.5 + i * 0.4)}deg)` }}
                      >
                        <div className="h-24 overflow-hidden">
                          <img src={pkg.image} alt={pkg.title} className="kb-hover h-full w-full object-cover" loading="lazy" />
                        </div>
                        <p className="mt-2 truncate font-display text-[11px] font-bold text-ink">{pkg.title}</p>
                        <p className="font-hand text-base leading-tight text-terra-2">wish you were here · {pkg.coords}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          {/* closing line */}
          <Reveal delay={200}>
            <div className="mt-20 border-t border-bronze/30 pt-12 text-center">
              <MoonIcon phase={moonPhase(new Date())} size={40} className="mx-auto" />
              <p className="mx-auto mt-5 max-w-xl font-hand text-3xl leading-snug text-ink">
                “Every great journey on this isle begins with a single plate —
                <span className="text-terra"> tonight's {tonight.toLowerCase()} is as good a start as any.”</span>
              </p>
              <div className="mt-7 flex justify-center">
                <StampButton onClick={() => onBook(EXPEDITIONS[0])}>Begin a ledger</StampButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
