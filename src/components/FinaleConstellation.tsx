import { AnimatePresence, motion } from "framer-motion";
import { content } from "@/content/experience";
import { CONSTELLATION_STEPS } from "@/app/ExperienceState";

export const HEART: [number, number][] = [
  [50, 34],
  [36, 20],
  [22, 22],
  [12, 34],
  [14, 50],
  [28, 66],
  [50, 84],
  [72, 66],
  [86, 50],
  [88, 34],
  [78, 22],
  [64, 20],
];

interface Props {
  step: number;
  complete: boolean;
  reduced: boolean;
  onAdvance: () => void;
  onTrace: () => void;
}

export default function FinaleConstellation({ step, complete, reduced, onAdvance, onTrace }: Props) {
  const activeIndex = step % HEART.length;
  const active = HEART[activeIndex];
  const revealed = (i: number) => i === 0 || i <= step;

  return (
    <div className="relative z-20 flex min-h-full w-full items-center justify-center px-4">
      <div className="relative flex w-full max-w-[64rem] flex-col items-center">
        {/* --- the constellation --- */}
        <div className="relative w-full" style={{ maxWidth: 520 }}>
          <svg viewBox="-8 -8 116 116" className="w-full" role="img" aria-label="A constellation forming a heart">
            <defs>
              <radialGradient id="heartHalo" cx="50%" cy="52%" r="50%">
                <stop offset="0%" stopColor="rgba(216,181,121,0.3)" />
                <stop offset="60%" stopColor="rgba(185,111,131,0.14)" />
                <stop offset="100%" stopColor="rgba(185,111,131,0)" />
              </radialGradient>
              <filter id="starGlow" x="-160%" y="-160%" width="420%" height="420%">
                <feGaussianBlur stdDeviation="1.7" />
              </filter>
            </defs>

            <ellipse cx="50" cy="52" rx="52" ry="50" fill="url(#heartHalo)" opacity={complete ? 1 : 0.5} style={{ transition: "opacity 1.4s ease" }} />

            {/* segments */}
            {Array.from({ length: Math.min(step, CONSTELLATION_STEPS) }).map((_, k) => {
              const a = HEART[k % HEART.length];
              const b = HEART[(k + 1) % HEART.length];
              return (
                <motion.line
                  key={k}
                  x1={a[0]}
                  y1={a[1]}
                  x2={b[0]}
                  y2={b[1]}
                  stroke="rgba(232,214,180,0.85)"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: reduced ? 0.2 : 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}

            {/* stars */}
            {HEART.map(([x, y], i) =>
              revealed(i) ? (
                <motion.g
                  key={i}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
                >
                  <circle cx={x} cy={y} r={2.6} fill="rgba(255,244,222,0.9)" filter="url(#starGlow)" />
                  <circle cx={x} cy={y} r="1.5" fill="#fffdf6" />
                </motion.g>
              ) : null,
            )}

            {/* the live star */}
            {!complete && (
              <motion.g
                className="cursor-pointer"
                onClick={onAdvance}
                role="button"
                tabIndex={0}
                aria-label={content.finale.constellationHint}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAdvance();
                  }
                }}
                animate={reduced ? {} : { scale: [1, 1.16, 1] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              >
                <circle cx={active[0]} cy={active[1]} r="6" fill="rgba(216,181,121,0.28)" />
                <circle cx={active[0]} cy={active[1]} r="2.4" fill="#ffeecb" />
                <circle cx={active[0]} cy={active[1]} r="7.5" fill="none" stroke="rgba(216,181,121,0.7)" strokeWidth="0.5" />
                <circle cx={active[0]} cy={active[1]} r="12" fill="transparent" />
              </motion.g>
            )}
          </svg>

          <div className="mt-2 flex justify-center">
            <AnimatePresence mode="wait">
              {!complete && (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col items-center gap-3"
                >
                  <span className="hint" style={{ color: "rgba(247,240,232,0.75)" }}>
                    <span className="hint__dot" />
                    {step === 0 ? content.finale.constellationHint : content.finale.constellationHint}
                  </span>
                  {step >= 2 && (
                    <button type="button" className="btn" onClick={onTrace}>
                      {content.finale.traceAll}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- final message --- */}
        <AnimatePresence>
          {complete && (
            <motion.div
              className="mt-6 max-w-[46rem] text-center sm:mt-10"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="label" style={{ color: "rgba(216,181,121,0.9)" }}>
                {content.finale.eyebrow}
              </span>
              <h2
                className="display mt-4 mb-0"
                style={{ fontSize: "clamp(2.1rem,6vw,4.4rem)", color: "#f7f0e8", fontWeight: 300 }}
              >
                {content.finale.headline}
              </h2>
              <p
                className="mx-auto mt-5 mb-0"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 300,
                  fontSize: "clamp(0.98rem,1.4vw,1.12rem)",
                  lineHeight: 1.8,
                  color: "rgba(247,240,232,0.76)",
                  maxWidth: "44ch",
                }}
              >
                {content.finale.supporting}
              </p>

              <motion.div
                className="mt-9 flex flex-wrap items-center justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                <span className="label" style={{ color: "rgba(247,240,232,0.45)" }}>
                  {content.finale.finalNote}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
