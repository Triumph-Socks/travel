import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ADDONS, GUIDE_TIERS, computeLedger, makeRef, moonPhase, phaseName, usd,
  type Booking, type ExpeditionPackage,
} from "../data/expeditions";
import { MoonIcon, StampButton, IconClose, IconArrow, useAnimatedNumber } from "./bits";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const pretty = (k: string) =>
  new Date(k + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STEPS = ["The Dates", "Party & Guide", "Micro-Adventures", "The Ledger"];

export default function BookingDrawer({
  pkg, onClose, onConfirm,
}: { pkg: ExpeditionPackage; onClose: () => void; onConfirm: (b: Booking) => void }) {
  const [step, setStep] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [guide, setGuide] = useState("shared");
  const [addons, setAddons] = useState<string[]>([]);
  const [sealed, setSealed] = useState<Booking | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const todayKey = iso(new Date());
  const nights = start && end ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) : 0;
  const ledger = useMemo(() => computeLedger(pkg, guests, guide, addons), [pkg, guests, guide, addons]);
  const animTotal = useAnimatedNumber(ledger.total);

  const base = new Date();
  const view = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const startDow = (view.getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const monthLabel = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const clickDay = (key: string) => {
    if (key < todayKey) return;
    if (!start || (start && end)) { setStart(key); setEnd(null); return; }
    if (key > start) setEnd(key);
    else { setStart(key); setEnd(null); }
  };

  const toggleAddon = (id: string) =>
    setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const canContinue = step !== 0 || (start !== null && end !== null);

  const seal = () => {
    if (!start || !end) return;
    const b: Booking = {
      ref: makeRef(), pkgId: pkg.id, start, end, nights, guests, guide,
      addons: [...addons], total: ledger.total, createdAt: Date.now(),
    };
    onConfirm(b);
    setSealed(b);
  };

  const phaseAt = (key: string) => moonPhase(new Date(key + "T12:00:00"));

  return (
    <>
      <motion.button
        key="backdrop"
        aria-label="Close booking drawer"
        className="fixed inset-0 z-[79] bg-canopy-3/65 backdrop-blur-[2px]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        key="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Book ${pkg.title}`}
        className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-xl flex-col border-l-[5px] border-double border-bronze-2 bg-parchment shadow-2xl"
        initial={{ x: "106%" }}
        animate={{ x: 0 }}
        exit={{ x: "106%" }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink/80 bg-parchment-2 px-6 py-5">
          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-terra">
              Booking canvas · {pkg.plateNo}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold leading-snug text-ink">{pkg.title}</h2>
            <p className="mt-0.5 text-xs text-ink-3">{pkg.days} days · {pkg.region} · ledger kept transparent</p>
          </div>
          <button onClick={onClose} className="group mt-1 flex h-9 w-9 flex-none items-center justify-center border border-bronze/50 text-ink-2 transition-all hover:rotate-90 hover:border-terra hover:text-terra" aria-label="Close">
            <IconClose className="h-4.5 w-4.5" />
          </button>
        </div>

        {sealed ? (
          /* ============ SEALED ============ */
          <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-8 py-12 text-center">
            <span className="stamp-in border-[3px] border-double border-canopy px-8 py-4 font-display text-2xl font-black uppercase tracking-[0.24em] text-canopy">
              Sealed & Bound
            </span>
            <p className="font-hand text-3xl text-ink">your chapter is in the bindery, {sealed.ref}</p>
            <dl className="w-full max-w-sm space-y-2 border-y border-dashed border-bronze/40 py-5 text-left text-sm">
              <div className="flex justify-between"><dt className="text-ink-3">Route</dt><dd className="font-medium text-ink">{pkg.title}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-3">Departure</dt><dd className="font-medium text-ink">{pretty(sealed.start)} → {pretty(sealed.end)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-3">Party</dt><dd className="font-medium text-ink">{sealed.guests} travellers · {sealed.nights} nights</dd></div>
              <div className="flex justify-between"><dt className="text-ink-3">Ledger total</dt><dd className="font-display text-lg font-bold text-terra">{usd(sealed.total)}</dd></div>
            </dl>
            <p className="max-w-sm text-sm leading-relaxed text-ink-2">
              The journal now rests in your <strong>Memory Vault</strong> with its field guide,
              offline itinerary and a live WhatsApp concierge line.
            </p>
            <StampButton onClick={onClose}>Return to the journal</StampButton>
          </div>
        ) : (
          <>
            {/* step rail */}
            <div className="grid grid-cols-4 border-b border-bronze/30 bg-parchment">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => i < step && setStep(i)}
                  className={`relative px-2 py-3 text-center transition-colors ${i === step ? "bg-parchment-2" : i < step ? "hover:bg-parchment-2/70" : "opacity-45"}`}
                >
                  <span className={`block font-display text-base font-bold ${i === step ? "text-terra" : "text-bronze-2"}`}>
                    {["I", "II", "III", "IV"][i]}
                  </span>
                  <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-2 sm:block">{s}</span>
                  {i === step && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-terra" />}
                </button>
              ))}
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 44 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -44 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6"
                >
                  {step === 0 && (
                    <div>
                      <p className="font-hand text-2xl text-ink-2">— pick your nights by the actual moon, as navigators did</p>
                      <div className="mt-4 flex items-center justify-between">
                        <button onClick={() => setMonthOffset((m) => Math.max(0, m - 1))} disabled={monthOffset === 0} className="flex h-9 w-9 items-center justify-center border border-bronze/50 text-ink-2 transition-colors enabled:hover:border-terra enabled:hover:text-terra disabled:opacity-30" aria-label="Previous month">
                          <IconArrow flip className="h-4 w-4" />
                        </button>
                        <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-ink">{monthLabel}</p>
                        <button onClick={() => setMonthOffset((m) => Math.min(3, m + 1))} disabled={monthOffset === 3} className="flex h-9 w-9 items-center justify-center border border-bronze/50 text-ink-2 transition-colors enabled:hover:border-terra enabled:hover:text-terra disabled:opacity-30" aria-label="Next month">
                          <IconArrow className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <span key={d + i} className="py-1 font-display text-[10px] font-bold uppercase tracking-widest text-bronze-2">{d}</span>
                        ))}
                        {Array.from({ length: startDow }).map((_, i) => <span key={`e${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const d = i + 1;
                          const date = new Date(view.getFullYear(), view.getMonth(), d);
                          const key = iso(date);
                          const past = key < todayKey;
                          const edge = key === start || key === end;
                          const inside = start && end && key > start && key < end;
                          const ph = moonPhase(date);
                          return (
                            <button
                              key={key}
                              onClick={() => clickDay(key)}
                              disabled={past}
                              title={phaseName(ph)}
                              className={`relative flex aspect-square flex-col items-center justify-center border text-sm transition-all duration-200 ${
                                edge ? "-rotate-1 border-terra bg-terra font-bold text-parchment shadow-(--shadow-card)"
                                : inside ? "border-terra/30 bg-terra/12 text-terra-2"
                                : past ? "cursor-not-allowed border-transparent text-ink-3/40 line-through"
                                : "border-bronze/25 text-ink-2 hover:-translate-y-0.5 hover:border-terra hover:text-terra"
                              }`}
                            >
                              {d}
                              <span className="absolute bottom-0.5 right-0.5 opacity-80"><MoonIcon phase={ph} size={9} /></span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-5 border-t border-dashed border-bronze/40 pt-4 text-sm text-ink-2">
                        {start && end ? (
                          <p>
                            <strong className="text-ink">{pretty(start)}</strong> → <strong className="text-ink">{pretty(end)}</strong>
                            <span className="ml-2 border border-canopy/50 bg-canopy/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-canopy">{nights} nights</span>
                            <span className="ml-2 font-hand text-lg text-terra-2">moon that night: {phaseName(phaseAt(start))}</span>
                          </p>
                        ) : start ? (
                          <p className="font-hand text-xl text-ink-2">check-in marked for {pretty(start)} — now choose your return night</p>
                        ) : (
                          <p className="font-hand text-xl text-ink-2">choose your first night — the isle will do the rest</p>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-8">
                      <div>
                        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze-2">Travellers</p>
                        <div className="mt-3 flex items-center gap-5">
                          <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="flex h-11 w-11 items-center justify-center border-2 border-bronze/60 font-display text-xl font-bold text-ink-2 transition-all hover:-translate-y-0.5 hover:border-terra hover:text-terra" aria-label="Fewer travellers">−</button>
                          <div className="w-24 text-center">
                            <p className="font-display text-4xl font-black text-ink">{guests}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-3">{guests === 1 ? "traveller" : "travellers"}</p>
                          </div>
                          <button onClick={() => setGuests((g) => Math.min(pkg.groupMax, g + 1))} className="flex h-11 w-11 items-center justify-center border-2 border-bronze/60 font-display text-xl font-bold text-ink-2 transition-all hover:-translate-y-0.5 hover:border-terra hover:text-terra" aria-label="More travellers">+</button>
                        </div>
                        <p className="mt-2 font-hand text-xl text-ink-2">— private parties cap at {pkg.groupMax} on this route, by house rule</p>
                      </div>
                      <div>
                        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze-2">Guide</p>
                        <div className="mt-3 space-y-3">
                          {GUIDE_TIERS.map((g) => (
                            <button
                              key={g.id}
                              onClick={() => setGuide(g.id)}
                              className={`w-full border-2 p-4 text-left transition-all duration-300 ${
                                guide === g.id ? "-rotate-[0.4deg] border-terra bg-terra/8 shadow-(--shadow-card)" : "border-bronze/35 hover:border-bronze hover:bg-parchment-2"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className={`font-display text-sm font-bold uppercase tracking-[0.14em] ${guide === g.id ? "text-terra" : "text-ink"}`}>{g.name}</p>
                                <p className="font-display text-sm font-bold text-canopy">{g.price === 0 ? "Included" : `+${usd(g.price)}`}</p>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-ink-2">{g.detail}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <p className="font-hand text-2xl text-ink-2">— small adventures, bound into the same ledger</p>
                      <div className="mt-4 space-y-3.5">
                        {ADDONS.map((a) => {
                          const on = addons.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              onClick={() => toggleAddon(a.id)}
                              className={`flex w-full items-stretch gap-4 border-2 p-3 text-left transition-all duration-300 ${
                                on ? "-rotate-[0.3deg] border-canopy bg-canopy/8 shadow-(--shadow-card)" : "border-bronze/35 hover:border-bronze hover:bg-parchment-2"
                              }`}
                            >
                              {a.image ? (
                                <img src={a.image} alt="" className="h-20 w-24 flex-none object-cover" loading="lazy" />
                              ) : (
                                <span className="flex h-20 w-24 flex-none items-center justify-center bg-parchment-3">
                                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-bronze/70" aria-hidden="true"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="currentColor" /></svg>
                                </span>
                              )}
                              <span className="flex-1">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className={`font-display text-sm font-bold ${on ? "text-canopy" : "text-ink"}`}>{a.name}</span>
                                  <span className="border border-bronze/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-bronze-2">{a.tag}</span>
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-ink-2">{a.detail}</span>
                                <span className="mt-1.5 block font-display text-xs font-bold text-terra">{usd(a.price)} / traveller</span>
                              </span>
                              <input type="checkbox" className="inkbox self-center" checked={on} readOnly />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze-2">The ledger, item by item</p>
                      <dl className="mt-4 space-y-3 text-sm">
                        {[
                          { l: `Base fare × ${guests} traveller${guests > 1 ? "s" : ""}`, v: ledger.base },
                          { l: `Park fees & permits × ${guests}`, v: ledger.park },
                          { l: `Guide — ${GUIDE_TIERS.find((g) => g.id === guide)?.name}`, v: ledger.guide },
                          { l: `Micro-adventures (${addons.length}) × ${guests}`, v: ledger.addons },
                          { l: "Canopy levy (3%) → replanting fund", v: ledger.levy },
                        ].map((r) => (
                          <div key={r.l} className="flex items-baseline gap-3">
                            <dt className="text-ink-2">{r.l}</dt>
                            <span className="dotted-leader h-3 flex-1" />
                            <dd className="font-display font-bold text-ink">{usd(r.v)}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-6 border-t-2 border-ink/70 pt-4">
                        <div className="flex items-end justify-between">
                          <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-ink-2">Total, no riddles</p>
                          <p className="font-display text-4xl font-black text-terra">{usd(animTotal)}</p>
                        </div>
                        <p className="mt-2 text-xs text-ink-3">
                          {start && end ? `${pretty(start)} → ${pretty(end)} · ${nights} nights · ` : ""}{guests} traveller{guests > 1 ? "s" : ""} · {pkg.plateNo} {pkg.region}
                        </p>
                      </div>
                      <div className="mt-6">
                        <StampButton className="w-full text-center" onClick={seal}>Seal & bind — {usd(ledger.total)}</StampButton>
                      </div>
                      <p className="mt-3 text-center font-hand text-xl text-ink-2">— 14 nights' grace to unbind, no questions asked</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-4 border-t-2 border-ink/80 bg-parchment-2 px-6 py-4">
              <button
                onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
                className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2 transition-colors hover:text-terra"
              >
                <IconArrow flip className="h-4 w-4" /> {step === 0 ? "Close" : "Back"}
              </button>
              <p className="hidden font-display text-sm text-ink-2 sm:block">
                running total <span className="ml-1 font-black text-ink">{usd(animTotal)}</span>
              </p>
              {step < 3 ? (
                <StampButton small disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>Continue</StampButton>
              ) : (
                <StampButton small tone="ink" onClick={seal}>Seal the ledger</StampButton>
              )}
            </div>
          </>
        )}
      </motion.aside>
    </>
  );
}
