import { useEffect, useRef, useState, useCallback } from "react";

/* ---------------- reduced motion ---------------- */

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion(): boolean {
  const [prm, setPrm] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setPrm(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return prm;
}

/* ---------------- dotted globe ---------------- */

interface SpherePt { x: number; y: number; z: number }

const PINS = [
  { lat: 7.87, lon: 80.77, label: "The Resplendent Isle", main: true },
  { lat: 30.33, lon: 35.44, label: "Petra, past vol." },
  { lat: 35.01, lon: 135.77, label: "Kyoto, past vol." },
  { lat: -50.94, lon: -72.9, label: "Patagonia, past vol." },
  { lat: 31.06, lon: -7.92, label: "Atlas, past vol." },
];

function fibSphere(n: number): SpherePt[] {
  const pts: SpherePt[] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = ga * i;
    pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
  }
  return pts;
}

export function GlobeCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prm = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pts = fibSphere(820);
    let raf = 0;
    let angle = 0.65;
    let t0 = performance.now();

    const draw = (time: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.40;
      const tilt = 0.36;

      // land dots
      for (const p of pts) {
        const x1 = p.x * Math.cos(angle) + p.z * Math.sin(angle);
        const z1 = -p.x * Math.sin(angle) + p.z * Math.cos(angle);
        const y2 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
        if (z2 < -0.02) continue;
        const a = 0.10 + 0.42 * Math.max(0, z2);
        ctx.fillStyle = `rgba(122, 96, 55, ${a})`;
        const s = 1.1 + z2 * 1.1;
        ctx.fillRect(cx + x1 * R - s / 2, cy - y2 * R - s / 2, s, s);
      }

      // rim
      ctx.beginPath();
      ctx.arc(cx, cy, R + 7, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(165, 130, 75, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // pins
      PINS.forEach((pin, i) => {
        const la = (pin.lat * Math.PI) / 180;
        const lo = (pin.lon * Math.PI) / 180;
        const px = Math.cos(la) * Math.cos(lo);
        const py = Math.sin(la);
        const pz = Math.cos(la) * Math.sin(lo);
        const x1 = px * Math.cos(angle) + pz * Math.sin(angle);
        const z1 = -px * Math.sin(angle) + pz * Math.cos(angle);
        const y2 = py * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = py * Math.sin(tilt) + z1 * Math.cos(tilt);
        if (z2 < 0.05) return;
        const sx = cx + x1 * R;
        const sy = cy - y2 * R;
        const pulse = ((time - t0) / 2200 + i * 0.23) % 1;
        if (!prm) {
          ctx.beginPath();
          ctx.arc(sx, sy, 4 + pulse * 13, 0, Math.PI * 2);
          ctx.strokeStyle = pin.main ? `rgba(192, 91, 51, ${0.7 * (1 - pulse)})` : `rgba(217, 179, 106, ${0.55 * (1 - pulse)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(sx, sy, pin.main ? 4 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = pin.main ? "#C05B33" : "#D9B36A";
        ctx.fill();
        ctx.strokeStyle = "rgba(253, 251, 247, 0.9)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    if (prm) {
      draw(t0 + 900);
    } else {
      const loop = (t: number) => {
        angle += 0.0016;
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [prm]);

  return <canvas ref={ref} className={`h-full w-full ${className}`} aria-label="Rotating expedition globe" />;
}

/* ---------------- fog & fireflies ---------------- */

export function FogCanvas({ className = "", tint = "warm" }: { className?: string; tint?: "warm" | "dark" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prm = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const blobs = Array.from({ length: 16 }, () => ({
      x: Math.random(), y: Math.random(), r: rnd(0.14, 0.34),
      vx: rnd(-0.00012, 0.00012), vy: rnd(-0.00005, 0.00005),
      a: rnd(0.03, 0.075), warm: Math.random() > 0.45,
    }));
    const flies = Array.from({ length: 16 }, () => ({
      x: Math.random(), y: Math.random(), vy: rnd(-0.00025, -0.00008),
      vx: rnd(-0.00008, 0.00008), ph: rnd(0, Math.PI * 2), s: rnd(1, 2.2),
    }));

    let raf = 0;
    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r * Math.max(w, h));
        const col = tint === "dark"
          ? (b.warm ? "217, 179, 106" : "160, 205, 180")
          : (b.warm ? "165, 130, 75" : "30, 77, 56");
        g.addColorStop(0, `rgba(${col}, ${b.a})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        b.x += b.vx; b.y += b.vy;
        if (b.x < -0.2) b.x = 1.2; if (b.x > 1.2) b.x = -0.2;
        if (b.y < -0.2) b.y = 1.2; if (b.y > 1.2) b.y = -0.2;
      }
      for (const f of flies) {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + f.ph));
        ctx.beginPath();
        ctx.arc(f.x * w, f.y * h, f.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 179, 106, ${0.5 * tw})`;
        ctx.fill();
        f.y += f.vy; f.x += f.vx + Math.sin(t / 1400 + f.ph) * 0.0004;
        if (f.y < -0.05) { f.y = 1.05; f.x = Math.random(); }
        if (f.x < -0.05) f.x = 1.05; if (f.x > 1.05) f.x = -0.05;
      }
    };

    if (prm) {
      draw(0);
    } else {
      const loop = (t: number) => { draw(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [prm, tint]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}

/* ---------------- ambient audio: wind + cicadas + birdsong ---------------- */

export function useAmbientAudio() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const birdTimer = useRef<number | null>(null);
  const srcRefs = useRef<AudioBufferSourceNode[]>([]);

  const buildGraph = useCallback(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    const len = ctx.sampleRate * 2.5;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }

    // wind bed
    const wind = ctx.createBufferSource();
    wind.buffer = buf; wind.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 340; lp.Q.value = 0.6;
    const wg = ctx.createGain(); wg.gain.value = 0.11;
    wind.connect(lp).connect(wg).connect(master);
    wind.start();
    srcRefs.current.push(wind);

    // slow swell on the wind
    const swell = ctx.createOscillator();
    swell.frequency.value = 0.07;
    const sg = ctx.createGain(); sg.gain.value = 0.045;
    swell.connect(sg).connect(lp.frequency);
    swell.start();

    // cicada shimmer
    const sh = ctx.createBufferSource();
    sh.buffer = buf; sh.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 2700; bp.Q.value = 9;
    const shg = ctx.createGain(); shg.gain.value = 0.008;
    sh.connect(bp).connect(shg).connect(master);
    sh.start();
    srcRefs.current.push(sh);
  }, []);

  const chirp = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(2100 + Math.random() * 500, t);
    o.frequency.exponentialRampToValueAtTime(3300 + Math.random() * 400, t + 0.07);
    o.frequency.exponentialRampToValueAtTime(2400, t + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.3);
    if (Math.random() > 0.5) {
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.setValueAtTime(2600, t + 0.22);
      o2.frequency.exponentialRampToValueAtTime(3600, t + 0.3);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + 0.22);
      g2.gain.exponentialRampToValueAtTime(0.04, t + 0.25);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o2.connect(g2).connect(master);
      o2.start(t + 0.22); o2.stop(t + 0.5);
    }
  }, []);

  const toggle = useCallback(() => {
    if (!ctxRef.current) buildGraph();
    const ctx = ctxRef.current!;
    const master = masterRef.current!;
    ctx.resume();
    if (!on) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
      const loop = () => {
        chirp();
        birdTimer.current = window.setTimeout(loop, 3800 + Math.random() * 5200);
      };
      birdTimer.current = window.setTimeout(loop, 1600);
      setOn(true);
    } else {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      if (birdTimer.current) window.clearTimeout(birdTimer.current);
      setOn(false);
    }
  }, [on, buildGraph, chirp]);

  useEffect(() => () => {
    if (birdTimer.current) window.clearTimeout(birdTimer.current);
    srcRefs.current.forEach((s) => { try { s.stop(); } catch { /* noop */ } });
    ctxRef.current?.close().catch(() => undefined);
  }, []);

  return { on, toggle };
}
