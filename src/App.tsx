import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Home from "./components/Home";
import Detail from "./components/Detail";
import BookingDrawer from "./components/BookingDrawer";
import { CompassRose } from "./components/bits";
import { useAmbientAudio, prefersReducedMotion } from "./components/canvas";
import { EXPEDITIONS, byId, type Booking } from "./data/expeditions";

type View = { name: "home" } | { name: "detail"; id: string };

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(() => load<Booking[]>("ae-vault-v1", []));
  const [postcards, setPostcards] = useState<string[]>(() => load<string[]>("ae-postcards-v1", []));
  const [wipe, setWipe] = useState(false);
  const audio = useAmbientAudio();

  useEffect(() => {
    try {
      localStorage.setItem("ae-vault-v1", JSON.stringify(bookings));
      localStorage.setItem("ae-postcards-v1", JSON.stringify(postcards));
    } catch { /* storage unavailable */ }
  }, [bookings, postcards]);

  const goHome = useCallback(() => {
    if (prefersReducedMotion()) { setView({ name: "home" }); window.scrollTo(0, 0); return; }
    setWipe(true);
    window.setTimeout(() => { setView({ name: "home" }); window.scrollTo(0, 0); }, 400);
    window.setTimeout(() => setWipe(false), 1000);
  }, []);

  const openDetail = useCallback((id: string) => {
    if (prefersReducedMotion()) { setView({ name: "detail", id }); window.scrollTo(0, 0); return; }
    setWipe(true);
    window.setTimeout(() => { setView({ name: "detail", id }); window.scrollTo(0, 0); }, 400);
    window.setTimeout(() => setWipe(false), 1000);
  }, []);

  const navTo = useCallback((section: string) => {
    const scroll = () =>
      document.getElementById(section)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    if (view.name !== "home") {
      setWipe(true);
      window.setTimeout(() => { setView({ name: "home" }); window.scrollTo(0, 0); }, prefersReducedMotion() ? 0 : 400);
      window.setTimeout(() => { setWipe(false); scroll(); }, prefersReducedMotion() ? 60 : 1000);
    } else {
      scroll();
    }
  }, [view.name]);

  const collectPostcard = useCallback((id: string) => {
    setPostcards((p) => (p.includes(id) ? p : [...p, id]));
  }, []);

  const detailPkg = view.name === "detail" ? byId(view.id) : undefined;
  const drawerPkg = drawerId ? byId(drawerId) : undefined;

  return (
    <div className="paper-tint relative min-h-screen">
      {/* film grain over everything */}
      <div className="grain pointer-events-none fixed inset-0 z-[98]" aria-hidden="true" />

      {/* ink wipe for view changes */}
      {wipe && (
        <div className="pointer-events-none fixed inset-0 z-[96] overflow-hidden" aria-hidden="true">
          <div className="wipe-circle">
            <div className="grain absolute inset-0 opacity-20" />
          </div>
        </div>
      )}

      {/* ============ header ============ */}
      <header className="fixed inset-x-0 top-0 z-[70] border-b border-bronze/30 bg-parchment/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <button onClick={goHome} className="group flex items-center gap-3 text-left">
            <CompassRose className="h-9 w-9 text-terra transition-transform duration-700 group-hover:rotate-90" />
            <span>
              <span className="block font-display text-lg font-black leading-none tracking-[0.08em] text-ink">AETHERIA</span>
              <span className="block font-display text-[8px] font-semibold uppercase tracking-[0.34em] text-bronze-2">Expeditions · Field Journal</span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              { l: "The Shelf", s: "shelf" },
              { l: "House Method", s: "method" },
              { l: `Memory Vault${bookings.length ? ` · ${bookings.length}` : ""}`, s: "vault" },
            ].map((n) => (
              <button key={n.l} onClick={() => navTo(n.s)} className="tab-seal font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2 transition-colors hover:text-terra">
                {n.l}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={audio.toggle}
              aria-pressed={audio.on}
              title="Ambient isle soundscape"
              className={`hidden items-center gap-2 border px-3 py-2 font-display text-[10px] font-semibold uppercase tracking-[0.18em] transition-all sm:flex ${
                audio.on ? "border-canopy bg-canopy text-parchment" : "border-bronze/50 text-ink-2 hover:border-canopy hover:text-canopy"
              }`}
            >
              <span className="flex h-3 items-end gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`w-[2.5px] ${audio.on ? "eq-bar bg-gold" : "bg-bronze/60"}`} style={{ height: `${[60, 100, 45][i]}%`, animationDelay: `${i * 0.18}s` }} />
                ))}
              </span>
              {audio.on ? "On" : "Sound"}
            </button>
            <button
              onClick={() => setDrawerId(detailPkg?.id ?? EXPEDITIONS[0].id)}
              className="-rotate-1 border-2 border-terra bg-terra px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-parchment shadow-(--shadow-card) transition-all hover:rotate-0 hover:-translate-y-0.5"
            >
              Book
            </button>
          </div>
        </div>
      </header>

      {/* ============ views ============ */}
      <main>
        {view.name === "home" || !detailPkg ? (
          <Home
            onOpen={openDetail}
            onBook={(p) => setDrawerId(p.id)}
            bookings={bookings}
            postcards={postcards}
            onRemoveBooking={(ref) => setBookings((b) => b.filter((x) => x.ref !== ref))}
            ambienceOn={audio.on}
            onToggleAmbience={audio.toggle}
          />
        ) : (
          <Detail
            key={detailPkg.id}
            pkg={detailPkg}
            onBack={goHome}
            onBook={(p) => setDrawerId(p.id)}
            onCollect={collectPostcard}
            collected={postcards.includes(detailPkg.id)}
          />
        )}
      </main>

      {/* ============ booking drawer ============ */}
      <AnimatePresence>
        {drawerPkg && (
          <BookingDrawer
            key={drawerPkg.id}
            pkg={drawerPkg}
            onClose={() => setDrawerId(null)}
            onConfirm={(b) => setBookings((prev) => [b, ...prev])}
          />
        )}
      </AnimatePresence>

      {/* ============ footer colophon ============ */}
      <footer className="relative overflow-hidden bg-canopy-3 pt-16 text-parchment">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <CompassRose className="h-10 w-10 text-gold" spin />
              <p className="font-display text-2xl font-black tracking-[0.08em]">AETHERIA</p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-parchment/70">
              A field journal of hand-charted routes across the Resplendent Isle.
              Four plates, twenty-two waypoints, one promise — the ledger tells the truth
              and the naturalist knows the way.
            </p>
            <p className="mt-5 font-hand text-2xl text-gold/90">charted in Kandy · bound by hand · vol. VII</p>
          </div>
          <div className="lg:col-span-4">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">The Plates</p>
            <ul className="mt-4 space-y-2.5">
              {EXPEDITIONS.map((p) => (
                <li key={p.id}>
                  <button onClick={() => openDetail(p.id)} className="group flex items-baseline gap-3 text-left">
                    <span className="font-display text-xs font-bold text-gold/70">{p.plateNo}</span>
                    <span className="font-display text-sm text-parchment/85 transition-colors group-hover:text-gold">{p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Colophon</p>
            <p className="mt-4 text-sm leading-relaxed text-parchment/70">
              Set in Cinzel & Plus Jakarta Sans.<br />
              Moon phases computed live.<br />
              Winds synthesised, birdsong included.
            </p>
            <p className="mt-4 text-xs text-parchment/50">© MMXXVI Aetheria Expeditions · 07°17′N 80°38′E</p>
          </div>
        </div>
        <p className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[15vw] font-black leading-[0.78] text-parchment/[0.045]">
          AETHERIA
        </p>
      </footer>
    </div>
  );
}
