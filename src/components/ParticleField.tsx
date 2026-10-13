import { useEffect, useRef } from "react";

export type ParticleMode = "arrival" | "cake" | "keepsakes" | "letter" | "finale";

type BurstKind = "gift" | "candle" | "seal" | "star";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  seed: number;
  tone: 0 | 1 | 2; // 0 ivory · 1 gold · 2 rose
  burst: boolean;
  still: boolean;
}

/* -------------------------------------------------- tiny module bus */
type BurstEvent = { kind: BurstKind; x: number; y: number };
type Handler = (e: BurstEvent) => void;
const handlers = new Set<Handler>();

export const particleBus = {
  emit(kind: BurstKind, x = 0.5, y = 0.5) {
    handlers.forEach((h) => h({ kind, x, y }));
  },
  on(h: Handler) {
    handlers.add(h);
    return () => handlers.delete(h);
  },
};

/* -------------------------------------------------- deterministic rng */
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSprite(rgb: string) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, `rgba(${rgb},1)`);
  grd.addColorStop(0.28, `rgba(${rgb},0.55)`);
  grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

const TONES = ["247,240,232", "216,181,121", "185,111,131"];

const MODE_CFG: Record<
  ParticleMode,
  { count: number; rise: number; sway: number; alpha: number; size: number; gold: number; still: number }
> = {
  arrival: { count: 1, rise: -0.012, sway: 0.16, alpha: 0.3, size: 2.4, gold: 0.22, still: 0 },
  cake: { count: 1.1, rise: -0.02, sway: 0.2, alpha: 0.34, size: 2.5, gold: 0.4, still: 0 },
  keepsakes: { count: 1.0, rise: -0.05, sway: 0.28, alpha: 0.4, size: 2.7, gold: 0.72, still: 0 },
  letter: { count: 0.6, rise: -0.016, sway: 0.14, alpha: 0.32, size: 2.4, gold: 0.5, still: 0 },
  finale: { count: 1.35, rise: -0.004, sway: 0.05, alpha: 0.62, size: 2.1, gold: 0.3, still: 0.78 },
};

interface Props {
  mode: ParticleMode;
  reduced: boolean;
}

export default function ParticleField({ mode, reduced }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef(mode);
  const reducedRef = useRef(reduced);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const sprites = TONES.map(makeSprite);
    const compact = window.matchMedia("(max-width: 760px)").matches;
    const rnd = mulberry32(20260118);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: P[] = [];
    let raf = 0;
    let last = performance.now();
    let running = true;

    const seed = (modeName: ParticleMode, count: number) => {
      const cfg = MODE_CFG[modeName];
      const list: P[] = [];
      for (let i = 0; i < count; i++) {
        const isGold = rnd() < cfg.gold;
        const still = rnd() < cfg.still;
        list.push({
          x: rnd(),
          y: rnd(),
          vx: (rnd() - 0.5) * 0.02,
          vy: cfg.rise * (0.4 + rnd() * 1.2),
          r: cfg.size * (0.45 + rnd() * 1.1),
          life: 1,
          max: 1,
          seed: rnd() * 1000,
          tone: isGold ? 1 : rnd() < 0.12 ? 2 : 0,
          burst: false,
          still,
        });
      }
      return list;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cfg = MODE_CFG[modeRef.current];
      const density = compact ? 42 : 96;
      particles = seed(modeRef.current, Math.round(density * cfg.count));
    };

    resize();
    window.addEventListener("resize", resize);

    /* ------- re-seed gently when the scene changes (not on every frame) */
    let lastMode = modeRef.current;
    const syncMode = () => {
      const m = modeRef.current;
      if (m === lastMode) return;
      lastMode = m;
      const cfg = MODE_CFG[m];
      const density = compact ? 42 : 96;
      const target = Math.round(density * cfg.count);
      while (particles.length > target) particles.pop();
      while (particles.length < target) {
        particles.push(...seed(m, 1));
      }
      particles.forEach((p) => {
        p.still = Math.random() < cfg.still;
        p.vy = cfg.rise * (0.4 + Math.random() * 1.2);
        p.life = 1;
        p.max = 1;
      });
    };

    /* ------- bursts from user actions */
    const off = particleBus.on(({ kind, x, y }) => {
      const n =
        kind === "gift" ? (compact ? 26 : 54) : kind === "candle" ? (compact ? 18 : 34) : kind === "seal" ? 22 : 14;
      const speed = kind === "gift" ? 0.34 : kind === "candle" ? 0.16 : 0.24;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + rnd() * 0.5;
        const s = speed * (0.35 + rnd() * 0.9);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - (kind === "candle" ? 0.1 : 0.03),
          r: 1.6 + rnd() * 3.4,
          life: 0,
          max: 1.6 + rnd() * 1.4,
          seed: rnd() * 1000,
          tone: kind === "star" ? 0 : 1,
          burst: true,
          still: false,
        });
      }
      if (particles.length > 460) particles.splice(0, particles.length - 460);
    });

    const draw = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const m = modeRef.current;
      const cfg = MODE_CFG[m];
      const dark = m === "finale";

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.burst) {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.965;
          p.vy = p.vy * 0.965 - 0.012 * dt * 60 * 0.02;
          if (p.life > p.max) {
            // settle into the ambient field instead of vanishing
            if (particles.length > (compact ? 70 : 140)) {
              particles.splice(i, 1);
              continue;
            }
            p.burst = false;
            p.life = 0;
            p.vx = (rnd() - 0.5) * 0.02;
            p.vy = cfg.rise * (0.4 + rnd());
          }
        } else if (!reducedRef.current && !p.still) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.x += Math.sin(t * 0.0004 + p.seed) * cfg.sway * dt * 0.35;
          if (p.y < -0.06) {
            p.y = 1.06;
            p.x = rnd();
          }
          if (p.y > 1.06) p.y = -0.06;
          if (p.x < -0.06) p.x = 1.06;
          if (p.x > 1.06) p.x = -0.06;
        }

        const twinkle = dark ? 0.55 + 0.45 * Math.sin(t * 0.0016 + p.seed) : 0.72 + 0.28 * Math.sin(t * 0.0011 + p.seed);
        const fade = p.burst ? Math.max(0, 1 - p.life / p.max) : 1;
        const alpha = cfg.alpha * twinkle * fade * (reducedRef.current ? 0.7 : 1);
        if (alpha <= 0.01) continue;

        const size = p.r * (dark ? 5.5 : 6.5);
        ctx.globalAlpha = Math.min(alpha, 1);
        ctx.drawImage(sprites[p.tone], p.x * w - size / 2, p.y * h - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (t: number) => {
      if (!running) return;
      syncMode();
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      off();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      particles = [];
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="stage__layer"
      style={{ zIndex: 6, pointerEvents: "none" }}
    />
  );
}
